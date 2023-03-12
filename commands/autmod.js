const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const automodSchema = require('../../Schemas/automodSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Enable a automod plugin in your server')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('setup')
                .setDescription('Setup your automod logs channel')
                .addChannelOption((options) =>
                    options
                        .setName('channel')
                        .setDescription('Add a log channel to send the logs')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('info')
                .setDescription('Show your automod system information')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Delete automod system')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('set-timeout')
                .setDescription('Set timout duration')
                .addStringOption((options) =>
                    options
                        .setName('duration')
                        .setDescription('Choice duration for timeout')
                        .addChoices(
                            { name: '1d', value: '1d' },
                            { name: '12h', value: '12h' },
                            { name: '3h', value: '3h' },
                            { name: '1h', value: '1h' },
                            { name: '30m', value: '30m' },
                            { name: '10m (default)', value: '10m' }
                        ))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('plugin')
                .setDescription('Select a plugin to enable with automod')
                .addStringOption((options) =>
                    options
                        .setName('plugin')
                        .setDescription('Choice the plugin to enable')
                        .addChoices(
                            { name: 'Anti unverified bot', value: 'AntiUnverifiedBot' },
                            { name: 'Anti swear', value: 'AntiSwear' },
                            { name: 'Anti scam', value: 'AntiScam' },
                            { name: 'Anti link', value: 'AntiLink' },
                            { name: 'Anti ping', value: 'AntiPing' },
                            { name: 'Anti alt account', value: 'AntiAltAccount' }
                        )
                )
        ),
    async execute(interaction) {
        const { guildId, options, guild } = interaction;

        const subcommand = options.getSubcommand();
        const channel = options.getChannel('channel');
        const plugin = options.getString('plugin');
        const timeout = options.getString('duration');

        const prefix = '\`Automod\`'

        if (subcommand === 'setup') {
            automodSchema.findOne({ guildId: guildId }, async (err, data) => {
                if (err) throw err;
                if (!data) {
                    automodSchema.create({
                        guildId: guildId,
                        channelId: channel.id
                    })
                    interaction.reply({ content: ` logs channel succesfull setup to ${channel}.`, ephemeral: true });

                    try {
                        guild.channels.cache.get(channel.id).send({
                            embeds: [new EmbedBuilder().setDescription(`\`✅\` This is the autmod logs channel.
                        
                        > In this channel all automod reports will\n> be sent, it is recommended to make this\n> channel visible only to moderators.`).setColor('Grey')]
                        });
                    } catch (error) {
                        return
                    }

                } else if (data) {
                    interaction.reply({ content: `${prefix} logs channel succesfull updated from <#${data.channelId}> to ${channel}.`, ephemeral: true });
                    data.channelId = channel.id;
                    data.save();
                }
            })
        }

        if (subcommand === 'info') {
            automodSchema.findOne({ guildId: guildId }, async (err, data) => {
                if (err) throw err;
                if (!data) return interaction.reply({ content: `No ${prefix} setup find, use </automod setup:1084256969789022338> to setup system.`, ephemeral: true });
                if (data) {
                    interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setDescription(`\`✅\` **| autmod system info**
                                            > The self-moderation system consists\n> of controlling users and their messages,\n> so as to be able to limit actions against the regulation\n> and reporting everything to the server moderators.
                                            
                                            \`#️⃣\` **| channel** <#${data.channelId}>
                                            
                                            \`📶\` **| plugin**
                                            > | Anti unverified bot - ${data.plugins.AntiUnverifiedBot == true ? '\`✅\`' : '\`❌\`'}
                                            > | Anti swear - ${data.plugins.AntiSwear == true ? '\`✅\`' : '\`❌\`'}
                                            > | Anti scam - ${data.plugins.AntiScam == true ? '\`✅\`' : '\`❌\`'}
                                            > | Anti link - ${data.plugins.AntiLink == true ? '\`✅\`' : '\`❌\`'}
                                            > | Anti ping - ${data.plugins.AntiPing == true ? '\`✅\`' : '\`❌\`'}
                                            > | Anti alt account - ${data.plugins.AntiAltAccount == true ? '\`✅\`' : '\`❌\`'}`)
                            .setColor('Blurple')
                            .setFooter({ text: `Automod | ${guild.name}`, iconURL: guild.iconURL() })
                        ],
                        ephemeral: true
                    })
                }
            })
        }

        if (subcommand === 'delete') {
            automodSchema.findOneAndDelete({ guildId: guildId }, async (err, data) => {
                if (err) throw err;
                if (!data) return interaction.reply({ content: `No ${prefix} setup find, use </automod setup:1084256969789022338> to setup system.`, ephemeral: true });
                if (data) interaction.reply({ content: `${prefix} system has been deleted.`, ephemeral: true });
            })
        }

        if (subcommand === 'set-timeout') {
            automodSchema.findOne({ guildId: guildId }, async (err, data) => {
                if (err) throw err;
                if (!data) return interaction.reply({ content: `No ${prefix} setup find, use </automod setup:1084256969789022338> to setup system.`, ephemeral: true });
                if (data) {
                    data.timeout = timeout;
                    data.save();
                    interaction.reply({ content: `${prefix} | timeout duration has been updated to **${timeout}**`, ephemeral: true });
                }
            })
        }

        if (subcommand === 'plugin') {
            automodSchema.findOne({ guildId: guildId }, async (err, data) => {
                if (err) throw err;
                if (!data) return interaction.reply({ content: `No ${prefix} setup find, use </automod setup:1084256969789022338> to setup system.`, ephemeral: true });
                if (data) {

                    let pname

                    switch (plugin) {
                        case 'AntiUnverifiedBot':
                            pname = 'Anti unverified bot';
                            break;
                        case 'AntiSwear':
                            pname = 'Anti swear';
                            break;
                        case 'AntiScam':
                            pname = 'Anti scam';
                            break;
                        case 'AntiLink':
                            pname = 'Anti link';
                            break;
                        case 'AntiPing':
                            pname = 'Anti ping';
                            break;
                        case 'AntiAltAccount':
                            pname = 'Anti alt account';
                            break;
                    }

                    data.plugins[plugin] = data.plugins[plugin] == false ? true : false;
                    data.save();

                    interaction.reply({ content: `> ${prefix} | Now the __${pname}__ plugin has been **${data.plugins[plugin] == false ? 'disabled' : 'enabled'}**.`, ephemeral: true });

                }
            })
        }
    }
}
