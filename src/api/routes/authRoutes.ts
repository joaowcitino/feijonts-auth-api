import { FastifyInstance } from 'fastify';
import { verifyToken } from '../controllers/authController';

const authRoutes = async (server: FastifyInstance) => {
    server.post('/verify', verifyToken);
};

export default authRoutes;