const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, Routes, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { token, clientId } = require('./config.json'); // Make sure to have your token and client ID in config.json

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers // Required for welcoming new members
    ] 
});

// Store warnings and welcome messages
const warnings = new Map(); // { guildId: { userId: [warnings] } }
const welcomeMessages = new Map(); // { guildId: { channelId: "Welcome message" } }

// ULTRA SIGMA MOD COMMANDS
const commands = [
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server (ULTRA SIGMA MOD ONLY).')
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for banning').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server (ULTRA SIGMA MOD ONLY).')
        .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for kicking').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes up to 100 messages (ULTRA SIGMA MOD ONLY).')
        .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user (ULTRA SIGMA MOD ONLY).')
        .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for warning').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Sets the welcome message for new members.')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send welcome messages').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The welcome message (use {user} for the username)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user (ULTRA SIGMA MOD ONLY).')
        .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for muting').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmutes a user (ULTRA SIGMA MOD ONLY).')
        .addUserOption(option => option.setName('user').setDescription('The user to unmute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for unmuting').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeouts a user (ULTRA SIGMA MOD ONLY).')
        .addUserOption(option => option.setName('user').setDescription('The user to timeout').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Duration in minutes').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for timeout').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Removes timeout from a user (ULTRA SIGMA MOD ONLY).')
        .addUserOption(option => option.setName('user').setDescription('The user to untimeout').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for untimeout').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Sends an announcement to a channel.')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the announcement').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The announcement message').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('cool')
        .setDescription('Replies with a SIGMA MOD message.')
        .toJSON()
];

// Register commands globally
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Registering ULTRA SIGMA MOD commands...');
        await rest.put(
            Routes.applicationCommands(clientId), // Register commands globally
            { body: commands },
        );
        console.log('ULTRA SIGMA MOD commands registered successfully!');
    } catch (error) {
        console.error('Failed to register ULTRA SIGMA MOD commands:', error);
    }
})();

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log(`ULTRA SIGMA MOD BOT is online! Logged in as ${client.user.tag}!`);
});

// Event listener for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, member, guild } = interaction;

    if (commandName === 'ban') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
        }

        try {
            await guild.members.ban(user, { reason });
            await interaction.reply(`Banned ${user.tag} for: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to ban the user.', ephemeral: true });
        }
    }

    if (commandName === 'kick') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: 'You do not have permission to kick members.', ephemeral: true });
        }

        try {
            await guild.members.kick(user, { reason });
            await interaction.reply(`Kicked ${user.tag} for: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to kick the user.', ephemeral: true });
        }
    }

    if (commandName === 'purge') {
        const amount = options.getInteger('amount');

        if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to manage messages.', ephemeral: true });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'You can only delete between 1 and 100 messages.', ephemeral: true });
        }

        try {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to delete messages.', ephemeral: true });
        }
    }

    if (commandName === 'warn') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: 'You do not have permission to warn members.', ephemeral: true });
        }

        // Initialize warnings for the guild if not already done
        if (!warnings.has(guild.id)) warnings.set(guild.id, new Map());
        const userWarnings = warnings.get(guild.id).get(user.id) || [];
        userWarnings.push(reason);
        warnings.get(guild.id).set(user.id, userWarnings);

        await interaction.reply(`Warned ${user.tag} for: ${reason}\nTotal warnings: ${userWarnings.length}`);
    }

    if (commandName === 'setwelcome') {
        const channel = options.getChannel('channel');
        const message = options.getString('message');

        if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: 'You do not have permission to set welcome messages.', ephemeral: true });
        }

        // Save the welcome message and channel for the guild
        welcomeMessages.set(guild.id, { channelId: channel.id, message });
        await interaction.reply(`Welcome message set in ${channel.name}: "${message}"`);
    }

    if (commandName === 'mute') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return interaction.reply({ content: 'You do not have permission to mute members.', ephemeral: true });
        }

        try {
            const memberToMute = await guild.members.fetch(user.id);
            await memberToMute.voice.setMute(true, reason);
            await interaction.reply(`Muted ${user.tag} for: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to mute the user.', ephemeral: true });
        }
    }

    if (commandName === 'unmute') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return interaction.reply({ content: 'You do not have permission to unmute members.', ephemeral: true });
        }

        try {
            const memberToUnmute = await guild.members.fetch(user.id);
            await memberToUnmute.voice.setMute(false, reason);
            await interaction.reply(`Unmuted ${user.tag} for: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to unmute the user.', ephemeral: true });
        }
    }

    if (commandName === 'timeout') {
        const user = options.getUser('user');
        const duration = options.getInteger('duration');
        const reason = options.getString('reason') || 'No reason provided';

        if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to timeout members.', ephemeral: true });
        }

        try {
            const memberToTimeout = await guild.members.fetch(user.id);
            await memberToTimeout.timeout(duration * 60 * 1000, reason); // Convert minutes to milliseconds
            await interaction.reply(`Timed out ${user.tag} for ${duration} minutes for: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to timeout the user.', ephemeral: true });
        }
    }

    if (commandName === 'untimeout') {
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No reason provided';

        if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to untimeout members.', ephemeral: true });
        }

        try {
            const memberToUntimeout = await guild.members.fetch(user.id);
            await memberToUntimeout.timeout(null, reason); // Remove timeout
            await interaction.reply(`Removed timeout from ${user.tag} for: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to untimeout the user.', ephemeral: true });
        }
    }

    if (commandName === 'announce') {
        const channel = options.getChannel('channel');
        const message = options.getString('message');

        if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to send announcements.', ephemeral: true });
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle('📢 Announcement')
                .setDescription(message)
                .setColor(0x00FF00)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Announcement sent!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to send the announcement.', ephemeral: true });
        }
    }

    if (commandName === 'cool') {
        await interaction.reply('You are the ULTRA SIGMA MOD! 😎');
    }
});

// Event listener for new members
client.on('guildMemberAdd', async member => {
    const welcomeConfig = welcomeMessages.get(member.guild.id);
    if (!welcomeConfig) return;

    const channel = member.guild.channels.cache.get(welcomeConfig.channelId);
    if (!channel) return;

    const welcomeMessage = welcomeConfig.message.replace(/{user}/g, member.user.toString());
    await channel.send(welcomeMessage);
});

// Log in to Discord
client.login(token);
