import { Client, GatewayIntentBits, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BOT_TOKEN } from '../config/botConfig';
import { registerCommands } from './utils/registerCommands';
import { handleCommand } from './utils/handleCommand';
import { errorHandler } from './utils/errorHandler';
import pool from '../config/database';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    registerCommands(client);
});

client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
        try {
            await handleCommand(interaction);
        } catch (error) {
            errorHandler(error, interaction);
        }
    } else if (interaction.isButton()) {
        try {
            await handleButtonInteraction(interaction);
        } catch (error) {
            errorHandler(error, interaction);
        }
    } else if (interaction.isModalSubmit()) {
        try {
            await handleModalSubmit(interaction);
        } catch (error) {
            errorHandler(error, interaction);
        }
    }
});

const handleButtonInteraction = async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'createToken') {
        const modal = new ModalBuilder()
            .setCustomId('createTokenModal')
            .setTitle('Criar Novo Token');

        const discordIdInput = new TextInputBuilder()
            .setCustomId('discordId')
            .setLabel('Discord ID do Cliente')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const ipInput = new TextInputBuilder()
            .setCustomId('clientIp')
            .setLabel('IP do Cliente')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const scriptNameInput = new TextInputBuilder()
            .setCustomId('scriptName')
            .setLabel('Nome do Script')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const validityInput = new TextInputBuilder()
            .setCustomId('validityDays')
            .setLabel('Validade do Token (em dias)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(discordIdInput);
        const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ipInput);
        const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(scriptNameInput);
        const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(validityInput);

        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

        await interaction.showModal(modal);
    } else if (interaction.customId === 'updateToken') {
        const modal = new ModalBuilder()
            .setCustomId('updateTokenModal')
            .setTitle('Atualizar Token');

        const tokenInput = new TextInputBuilder()
            .setCustomId('token')
            .setLabel('Token')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput);

        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    } else if (interaction.customId === 'verifyToken') {
        const modal = new ModalBuilder()
            .setCustomId('verifyTokenModal')
            .setTitle('Verificar Token');

        const tokenInput = new TextInputBuilder()
            .setCustomId('token')
            .setLabel('Token')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput);

        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    } else if (interaction.customId === 'deleteToken') {
        const modal = new ModalBuilder()
            .setCustomId('deleteTokenModal')
            .setTitle('Excluir Token');

        const tokenInput = new TextInputBuilder()
            .setCustomId('token')
            .setLabel('Token')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput);

        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    } else if (interaction.customId.startsWith('updateTokenDetails-')) {
        const token = interaction.customId.split('-')[1];
        const [rows] = await pool.query('SELECT * FROM tokens WHERE token = ?', [token]);

        if (Array.isArray(rows) && rows.length > 0) {
            const tokenData: any = rows[0];

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Detalhes do Token')
                .setAuthor({ name: 'Sistema de Autenticação de Scripts', iconURL: client.user?.displayAvatarURL() })
                .setDescription('Informações detalhadas sobre o token de autenticação.')
                .addFields(
                    { name: 'Discord ID', value: tokenData.discordId, inline: false },
                    { name: 'IP do Cliente', value: tokenData.clientIp, inline: false },
                    { name: 'Nome do Script', value: tokenData.scriptName, inline: false },
                    { name: 'Validade', value: `${new Date(tokenData.expirationDate).toLocaleDateString()} (${calculateDaysRemaining(new Date(tokenData.expirationDate))} dias restantes)`, inline: false }
                )
                .setFooter({ text: 'Sistema de Autenticação de Scripts - Bot', iconURL: client.user?.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`updateDiscordId-${token}`)
                        .setLabel('Atualizar Discord ID')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`updateClientIp-${token}`)
                        .setLabel('Atualizar IP do Cliente')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`updateScriptName-${token}`)
                        .setLabel('Atualizar Nome do Script')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        } else {
            await interaction.reply({ content: 'Token não encontrado.', ephemeral: true });
        }
    } else if (interaction.customId.startsWith('confirmDelete-')) {
        const token = interaction.customId.split('-')[1];

        try {
            const query = `DELETE FROM tokens WHERE token = ?`;
            const connection = await pool.getConnection();
            await connection.query(query, [token]);
            connection.release();
            await interaction.reply({ content: 'Token excluído com sucesso!', ephemeral: true });
        } catch (error) {
            console.error('Error deleting token:', error);
            await interaction.reply({ content: 'Ocorreu um erro ao excluir o token.', ephemeral: true });
        }
    } else if (interaction.customId.startsWith('updateDiscordId-')) {
        const token = interaction.customId.split('-')[1];
        const modal = new ModalBuilder()
            .setCustomId(`updateDiscordIdModal-${token}`)
            .setTitle('Atualizar Discord ID');

        const discordIdInput = new TextInputBuilder()
            .setCustomId('newDiscordId')
            .setLabel('Novo Discord ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(discordIdInput);

        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    } else if (interaction.customId.startsWith('updateClientIp-')) {
        const token = interaction.customId.split('-')[1];
        const modal = new ModalBuilder()
            .setCustomId(`updateClientIpModal-${token}`)
            .setTitle('Atualizar IP do Cliente');

        const clientIpInput = new TextInputBuilder()
            .setCustomId('newClientIp')
            .setLabel('Novo IP do Cliente')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(clientIpInput);

        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    } else if (interaction.customId.startsWith('updateScriptName-')) {
        const token = interaction.customId.split('-')[1];
        const modal = new ModalBuilder()
            .setCustomId(`updateScriptNameModal-${token}`)
            .setTitle('Atualizar Nome do Script');

        const scriptNameInput = new TextInputBuilder()
            .setCustomId('newScriptName')
            .setLabel('Novo Nome do Script')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(scriptNameInput);

        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
};

const handleModalSubmit = async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'createTokenModal') {
        const discordId = interaction.fields.getTextInputValue('discordId');
        const clientIp = interaction.fields.getTextInputValue('clientIp');
        const scriptName = interaction.fields.getTextInputValue('scriptName');
        const validityDays = parseInt(interaction.fields.getTextInputValue('validityDays'));

        const token = createToken();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + validityDays);

        try {
            await saveTokenToDatabase(token, discordId, clientIp, scriptName, expirationDate);
            await interaction.reply({ content: `Token criado com sucesso! Token: ${token}`, ephemeral: true });
        } catch (error) {
            console.error('Error saving token to database:', error);
            await interaction.reply({ content: 'Ocorreu um erro ao salvar o token no banco de dados.', ephemeral: true });
        }
    } else if (interaction.customId === 'verifyTokenModal' || interaction.customId === 'deleteTokenModal') {
        const token = interaction.fields.getTextInputValue('token');

        try {
            const [rows] = await pool.query('SELECT * FROM tokens WHERE token = ?', [token]);
            if (Array.isArray(rows) && rows.length > 0) {
                const tokenData: any = rows[0];
                const expirationDate = new Date(tokenData.expirationDate);
                const daysRemaining = calculateDaysRemaining(expirationDate);

                const embed = new EmbedBuilder()
                    .setColor(interaction.customId === 'verifyTokenModal' ? '#0099ff' : '#FF0000')
                    .setTitle(interaction.customId === 'verifyTokenModal' ? 'Detalhes do Token' : 'Confirmar Exclusão do Token')
                    .setAuthor({ name: 'Sistema de Autenticação de Scripts', iconURL: client.user?.displayAvatarURL() })
                    .setDescription(interaction.customId === 'verifyTokenModal' ? 'Informações detalhadas sobre o token de autenticação.' : 'Você tem certeza que deseja excluir este token?')
                    .addFields(
                        { name: 'Discord ID', value: tokenData.discordId, inline: false },
                        { name: 'IP do Cliente', value: tokenData.clientIp, inline: false },
                        { name: 'Nome do Script', value: tokenData.scriptName, inline: false },
                        { name: 'Validade', value: `${expirationDate.toLocaleDateString()} (${daysRemaining} dias restantes)`, inline: false }
                    )
                    .setFooter({ text: 'Sistema de Autenticação de Scripts - Bot', iconURL: client.user?.displayAvatarURL() })
                    .setTimestamp();

                if (interaction.customId === 'verifyTokenModal') {
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else if (interaction.customId === 'deleteTokenModal') {
                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`confirmDelete-${token}`)
                                .setLabel('Confirmar Exclusão')
                                .setStyle(ButtonStyle.Danger)
                        );

                    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
                }
            } else {
                await interaction.reply({ content: 'Token não encontrado.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error querying token:', error);
            await interaction.reply({ content: 'Ocorreu um erro ao verificar o token.', ephemeral: true });
        }
    } else if (interaction.customId === 'updateTokenModal') {
        const token = interaction.fields.getTextInputValue('token');

        try {
            const [rows] = await pool.query('SELECT * FROM tokens WHERE token = ?', [token]);
            if (Array.isArray(rows) && rows.length > 0) {
                const tokenData: any = rows[0];

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Detalhes do Token')
                    .setAuthor({ name: 'Sistema de Autenticação de Scripts', iconURL: client.user?.displayAvatarURL() })
                    .setDescription('Informações detalhadas sobre o token de autenticação.')
                    .addFields(
                        { name: 'Discord ID', value: tokenData.discordId, inline: false },
                        { name: 'IP do Cliente', value: tokenData.clientIp, inline: false },
                        { name: 'Nome do Script', value: tokenData.scriptName, inline: false },
                        { name: 'Validade', value: `${new Date(tokenData.expirationDate).toLocaleDateString()} (${calculateDaysRemaining(new Date(tokenData.expirationDate))} dias restantes)`, inline: false }
                    )
                    .setFooter({ text: 'Sistema de Autenticação de Scripts - Bot', iconURL: client.user?.displayAvatarURL() })
                    .setTimestamp();

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`updateDiscordId-${token}`)
                            .setLabel('Atualizar Discord ID')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`updateClientIp-${token}`)
                            .setLabel('Atualizar IP do Cliente')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`updateScriptName-${token}`)
                            .setLabel('Atualizar Nome do Script')
                            .setStyle(ButtonStyle.Primary)
                    );

                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            } else {
                await interaction.reply({ content: 'Token não encontrado.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error querying token:', error);
            await interaction.reply({ content: 'Ocorreu um erro ao verificar o token.', ephemeral: true });
        }
    } else if (interaction.customId.startsWith('updateDiscordIdModal-') || interaction.customId.startsWith('updateClientIpModal-') || interaction.customId.startsWith('updateScriptNameModal-')) {
        const token = interaction.customId.split('-')[1];
        let newValue;
        if (interaction.customId.startsWith('updateDiscordIdModal-')) {
            newValue = interaction.fields.getTextInputValue('newDiscordId');
        } else if (interaction.customId.startsWith('updateClientIpModal-')) {
            newValue = interaction.fields.getTextInputValue('newClientIp');
        } else if (interaction.customId.startsWith('updateScriptNameModal-')) {
            newValue = interaction.fields.getTextInputValue('newScriptName');
        }

        let query: any, field;
        if (interaction.customId.startsWith('updateDiscordIdModal-')) {
            query = `UPDATE tokens SET discordId = ? WHERE token = ?`;
            field = 'discordId';
        } else if (interaction.customId.startsWith('updateClientIpModal-')) {
            query = `UPDATE tokens SET clientIp = ? WHERE token = ?`;
            field = 'clientIp';
        } else if (interaction.customId.startsWith('updateScriptNameModal-')) {
            query = `UPDATE tokens SET scriptName = ? WHERE token = ?`;
            field = 'scriptName';
        }

        try {
            const connection = await pool.getConnection();
            await connection.query(query, [newValue, token]);
            connection.release();
            await interaction.reply({ content: `${field} atualizado com sucesso!`, ephemeral: true });
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            await interaction.reply({ content: `Ocorreu um erro ao atualizar o ${field}.`, ephemeral: true });
        }
    }
};

const calculateDaysRemaining = (expirationDate: Date): number => {
    const now = new Date();
    const timeDiff = expirationDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Converte de milissegundos para dias
};

const createToken = () => {
    return require('crypto').randomBytes(16).toString('hex');
};

const saveTokenToDatabase = async (token: string, discordId: string, clientIp: string, scriptName: string, expirationDate: Date) => {
    const query = `
        INSERT INTO tokens (token, discordId, clientIp, scriptName, expirationDate)
        VALUES (?, ?, ?, ?, ?)
    `;
    const connection = await pool.getConnection();
    await connection.query(query, [token, discordId, clientIp, scriptName, expirationDate]);
    connection.release();
};

client.login(BOT_TOKEN).catch(console.error);