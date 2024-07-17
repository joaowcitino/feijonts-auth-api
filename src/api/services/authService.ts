import pool from '../../config/database';
import { Token } from '../../models/token';

export const getToken = async (token: string): Promise<Token | null> => {
    const [rows] = await pool.query('SELECT * FROM tokens WHERE token = ?', [token]);
    if (Array.isArray(rows) && rows.length > 0) {
        const tokenData = rows[0] as Token;
        const now = new Date();
        const expirationDate = new Date(tokenData.expirationDate);

        tokenData.isExpired = now > expirationDate;

        return tokenData;
    }
    return null;
};
