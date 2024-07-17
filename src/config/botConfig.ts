import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export const BOT_TOKEN = process.env.BOT_TOKEN || '';