import { FastifyReply, FastifyRequest } from 'fastify';
import { getToken } from '../services/authService';

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token, clientIp, scriptName } = request.body as { token: string, clientIp: string, scriptName: string };

    if (!token || !clientIp) {
        return reply.status(400).send({ message: 'Missing required fields: token, clientIp' });
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

    const now = new Date();
    const expirationDate = new Date(tokenData.expirationDate);
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    const clientIp2 = request.ip;

    const response = {
        message: 'Token is valid',
        tokenInfo: {
            discordId: tokenData.discordId,
            clientIp: tokenData.clientIp,
            scriptName: tokenData.scriptName,
            createdAt: tokenData.createdAt,
            expirationDate: tokenData.expirationDate,
            daysRemaining: daysRemaining,
            ip: clientIp2
        }
    };

    return reply.status(200).send(response);
};