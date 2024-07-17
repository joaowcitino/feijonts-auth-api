import { Client } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { BOT_TOKEN } from '../../config/botConfig';
import { loadCommands } from './loadCommands';

const commands = loadCommands(__dirname + '/../commands');

export const registerCommands = (client: Client) => {
    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);
    const commandData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());

    client.guilds.cache.forEach(async (guild) => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(client.user?.id || '', guild.id),
                { body: commandData }
            );
            console.log(`Registered commands for guild ${guild.id}`);
        } catch (error) {
            console.error(`Failed to register commands for guild ${guild.id}:`, error);
        }
    });
};