import { Collection } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export const loadCommands = (dir: string) => {
    const commands = new Collection<string, any>();
    
    const loadDir = (directory: string) => {
        const files = readdirSync(directory);

        for (const file of files) {
            const filePath = join(directory, file);
            const stats = statSync(filePath);

            if (stats.isDirectory()) {
                loadDir(filePath);
            } else if (file.endsWith('.ts') || file.endsWith('.js')) {
                const command = require(filePath);
                commands.set(command.default.data.name, command.default);
            }
        }
    };

    loadDir(dir);
    return commands;
};
