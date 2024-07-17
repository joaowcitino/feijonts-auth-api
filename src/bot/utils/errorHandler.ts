import { CommandInteraction } from 'discord.js';

export const errorHandler = (error: any, interaction: any) => {
    console.error('Error occurred:', error);
    if (interaction.replied || interaction.deferred) {
        interaction.followUp({ content: 'An error occurred while executing the command.', ephemeral: true });
    } else {
        interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
    }
};