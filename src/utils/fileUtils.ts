import { createReadStream } from 'fs';
import { join } from 'path';

const SCRIPT_PATH = join(__dirname, '../../scripts/latest.zip');

export const getLatestScript = () => {
    return createReadStream(SCRIPT_PATH);
};