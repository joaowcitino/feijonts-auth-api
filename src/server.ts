import fastify from 'fastify';
import authRoutes from './api/routes/authRoutes';
import logger from './utils/logger';
import './bot';

const server = fastify({ logger });

server.register(authRoutes, { prefix: '/api/auth' });

const start = () => {
    try {
        server.listen({ port: 3333 }, () => {
            server.log.info(`Server listening on http://localhost:3333`);
        });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();