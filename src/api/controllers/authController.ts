import { FastifyReply, FastifyRequest } from 'fastify';
import { getToken } from '../services/authService';

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token, scriptName } = request.body as { token: string, scriptName: string };

    const forwardedFor: any = request.headers['x-forwarded-for'];
    const clientIp = forwardedFor.split(',')[0]

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

    const now = new Date();
    const expirationDate = new Date(tokenData.expirationDate);
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

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