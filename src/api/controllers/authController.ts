import { FastifyReply, FastifyRequest } from 'fastify';
import { getToken } from '../services/authService';
import axios from 'axios';
import dotenv from 'dotenv';
import JSZip from 'jszip';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface FileStructure {
    [key: string]: string | FileStructure;
}

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token, scriptName, scriptVersion } = request.body as { token: string, scriptName: string, scriptVersion: string };

    const forwardedFor: any = request.headers['x-forwarded-for'];
    const clientIp = forwardedFor.split(',')[0];

    if (!clientIp) {
        return reply.status(400).send({ message: 'Invalid token: client IP is required' });
    }

    if (!token) {
        return reply.status(400).send({ message: 'Invalid token: token is required' });
    }

    if (!scriptName) {
        return reply.status(400).send({ message: 'Invalid token: script name is required' });
    }

    const tokenData = await getToken(token);

    if (!tokenData) {
        return reply.status(401).send({ message: 'Invalid token: token does not exist' });
    }

    if (tokenData.isExpired) {
        return reply.status(401).send({ message: 'Token expired' });
    }

    if (tokenData.clientIp !== clientIp) {
        return reply.status(401).send({ message: 'Invalid credentials: client IP mismatch' });
    }

    if (tokenData.scriptName !== scriptName) {
        return reply.status(401).send({ message: 'Invalid credentials: script name mismatch' });
    }

    const GITHUB_REPO_URL = `https://github.com/feijonts/bet_system/releases/download/v1.0.0/bet_system.zip`;

    try {
        const versionResponse = await axios.get(GITHUB_REPO_URL, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            },
            responseType: 'arraybuffer'
        });

        const latestVersion = "v1.0.0"; // Atualize conforme a versão da release

        const now = new Date();
        const expirationDate = new Date(tokenData.expirationDate);
        const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

        if (!scriptVersion || scriptVersion !== latestVersion) {
            const files = await getFilesFromZip(versionResponse.data);
            return reply.status(200).send({
                updateAvailable: true,
                latestVersion,
                files,
                message: 'Token is valid',
                tokenInfo: {
                    discordId: tokenData.discordId,
                    clientIp: tokenData.clientIp,
                    scriptName: tokenData.scriptName,
                    createdAt: tokenData.createdAt,
                    expirationDate: tokenData.expirationDate,
                    daysRemaining: daysRemaining,
                }
            });
        }

        const response = {
            message: 'Token is valid',
            tokenInfo: {
                discordId: tokenData.discordId,
                clientIp: tokenData.clientIp,
                scriptName: tokenData.scriptName,
                createdAt: tokenData.createdAt,
                expirationDate: tokenData.expirationDate,
                daysRemaining: daysRemaining,
            }
        };

        return reply.status(200).send(response);

    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Error downloading or processing the release file.' });
    }
};

async function getFilesFromZip(zipData: ArrayBuffer): Promise<FileStructure> {
    const zip = await JSZip.loadAsync(zipData);
    const files: FileStructure = {};

    await Promise.all(Object.keys(zip.files).map(async (filename) => {
        if (!filename.includes('shared/') && filename !== 'token.json') {
            const fileContent = await zip.files[filename].async('string');
            files[filename] = Buffer.from(fileContent).toString('base64');
        }
    }));

    return files;
}