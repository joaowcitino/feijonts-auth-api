import { CommandInteraction } from 'discord.js';
import fs from 'fs';
import path from 'path';

interface Command {
  execute: (interaction: CommandInteraction) => Promise<void>;
  data: any;
}

const loadCommands = (dir: string): Record<string, Command> => {
  const commands: Record<string, Command> = {};

  const load = (dir: string) => {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        load(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const commandName = path.basename(file, path.extname(file));
        const command = require(filePath).default as Command;
        commands[commandName] = command;
      }
    });
  };

  load(dir);
  return commands;
};

const commands = loadCommands(path.join(__dirname, '../commands'));

export const handleCommand = async (interaction: CommandInteraction) => {
  const command = commands[interaction.commandName];
  if (!command) return;

  await command.execute(interaction);
};
