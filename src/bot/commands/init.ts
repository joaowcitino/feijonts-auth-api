import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, PermissionsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Initializes the bot and sets up commands'),
    async execute(interaction: CommandInteraction) {
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Sistema de Autenticação de Scripts')
            .setDescription('Este sistema permite a criação, atualização, verificação e exclusão de tokens de autenticação para scripts.')
            .addFields(
                { name: 'Criação de Tokens', value: 'Permite criar novos tokens para autenticar scripts.' },
                { name: 'Atualização de Tokens', value: 'Permite atualizar tokens existentes.' },
                { name: 'Verificação de Tokens', value: 'Permite verificar a validade de um token.' },
                { name: 'Exclusão de Tokens', value: 'Permite excluir tokens que não são mais necessários.' }
            )
            .setFooter({ text: 'Use os botões abaixo para executar ações específicas.' });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('createToken')
                    .setLabel('Criar Token')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('updateToken')
                    .setLabel('Atualizar Token')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('verifyToken')
                    .setLabel('Verificar Token')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('deleteToken')
                    .setLabel('Excluir Token')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};