import { createPool, Pool } from 'mysql2/promise';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const pool: Pool = createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const createTables = async () => {
    const createTokensTable = `
        CREATE TABLE IF NOT EXISTS tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            scriptName VARCHAR(255) NOT NULL,
            discordId VARCHAR(255) NOT NULL,
            clientIp VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expirationDate TIMESTAMP NOT NULL
        );
    `;

    try {
        const connection = await pool.getConnection();
        await connection.query(createTokensTable);
        connection.release();
        console.log('Tables created successfully if they did not exist.');
    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
};

createTables();

export default pool;