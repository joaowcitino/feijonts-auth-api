import { FastifyReply, FastifyRequest } from 'fastify';
import { getToken } from '../services/authService';
import axios from 'axios';
import dotenv from 'dotenv';

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

    const GITHUB_REPO_URL = `https://api.github.com/repos/feijonts/${scriptName}/contents`;

    const versionResponse = await axios.get(`${GITHUB_REPO_URL}/version.json`, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`
        }
    });
    const latestVersion = versionResponse.data.version;

    const now = new Date();
    const expirationDate = new Date(tokenData.expirationDate);
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (!scriptVersion || scriptVersion !== latestVersion) {
        const files = await getAllFilesFromGithub(GITHUB_REPO_URL);
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
};

async function getAllFilesFromGithub(GITHUB_REPO_URL: string): Promise<FileStructure> {
    const folders = ['server', 'client', 'utils', 'web'];
    const files: FileStructure = {};

    for (const folder of folders) {
        const folderFiles = await getFilesFromGithub(folder, GITHUB_REPO_URL);
        files[folder] = folderFiles;
    }

    const rootFiles = await getFilesFromGithub('', GITHUB_REPO_URL);
    for (const fileName in rootFiles) {
        if (fileName !== 'token.json') {
            files[fileName] = rootFiles[fileName];
        }
    }

    return files;
}

async function getFilesFromGithub(folder: string, GITHUB_REPO_URL: string): Promise<FileStructure> {
    const url = folder ? `${GITHUB_REPO_URL}/${folder}` : GITHUB_REPO_URL;
    const response = await axios.get(url, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`
        }
    });
    const files: FileStructure = {};

    for (const file of response.data) {
        if (file.type === 'file' && file.name !== 'token.json' && !file.path.includes('shared/')) {
            if (folder === 'web' && !file.name.endsWith('.html') && !file.name.endsWith('.js') && !file.name.endsWith('.css')) {
                continue;
            }
            const fileContentResponse = await axios.get(file.download_url, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`
                }
            });
            files[file.name] = fileContentResponse.data;
        }
    }

    return files;
}