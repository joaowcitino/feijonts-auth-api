import fastify from 'fastify';
import authRoutes from './api/routes/authRoutes';
import logger from './utils/logger';
import './bot';

const server = fastify({ logger });

server.register(authRoutes, { prefix: '/api/auth' });

const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;
        await server.listen({ port, host: '0.0.0.0' });
        server.log.info(`Server listening on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();