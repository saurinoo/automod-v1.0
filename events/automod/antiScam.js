const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const automodSchema = require('../../Schemas/automodSchema');
const AntiScam = require("../../Data/scamLinks.json");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        if (message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) return;

        if (!message.content == "@everyone") return

        const guild = message.guild;
        const scamlinks = AntiScam.known_links;

        automodSchema.findOne({ guildId: guild.id }, async (err, data) => {
            if (err) throw err;
            if (!data) return;
            if (data.plugins.AntiScam === false) return;
            if (data) {

                for (let i in scamlinks) {

                    if (message.content.toLowerCase().includes(scamlinks[i].toLowerCase())) {
                        try {
                            await message.delete();
                        } catch (error) {
                            return;
                        }

                        const buttons = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel("Kick")
                                .setEmoji("⚒️")
                                .setCustomId("kick")
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setLabel("Ban")
                                .setEmoji("🔨")
                                .setCustomId("ban")
                                .setStyle(ButtonStyle.Danger)
                        );

                        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor('ffb703').setDescription(`\`⚠️\` | ${message.author} has sent a **harmful link**.`)] });
                        setTimeout(async () => {
                            await msg.delete();
                        }, 5000);

                        try {
                            const text = await guild.channels.cache.get(data.channelId).send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('ffb703')
                                        .setDescription(`${message.author} has sent a **harmful link**.\n\`\`\`${message.content}\`\`\``)
                                ],
                                components: [buttons]
                            });

                            const col = text.createMessageComponentCollector();
                            col.on("collect", async (m) => {
                                switch (m.customId) {
                                    case "kick":
                                        if (!m.member.permissions.has(PermissionFlagsBits.KickMembers))
                                            return m.reply({
                                                content: "You don't have permission to kick",
                                                ephemeral: true,
                                            });
                                        const embed = new EmbedBuilder()
                                            .setTitle("Kicked")
                                            .setDescription(
                                                `You have been kicked from \`${message.guild.name}\` for sending scam links`
                                            )
                                            .setColor("0x2f3136");

                                        m.message.edit({ components: [] });

                                        m.reply({
                                            content: `Kicked ${message.author.tag}`,
                                            ephemeral: true,
                                        });

                                        message.member
                                            .send({
                                                embeds: [embed],
                                            })
                                            .then(() => {
                                                message.member.kick({ reason: "Sending scam links" });
                                            });
                                        break;
                                    case "ban":
                                        if (!m.member.permissions.has(PermissionFlagsBits.KickMembers))
                                            return m.reply({
                                                content: "You don't have permission to ban",
                                                ephemeral: true,
                                            });
                                        const embedss = new EmbedBuilder()
                                            .setTitle("Kicked")
                                            .setDescription(
                                                `You have been banned from \`${message.guild.name}\` for sending scam links`
                                            )
                                            .setColor("0x2f3136");

                                        m.message.edit({ components: [] });

                                        m.reply({
                                            content: `Banned ${message.author.tag}`,
                                            ephemeral: true,
                                        });

                                        message.member
                                            .send({
                                                embeds: [embedss],
                                            })
                                            .then(() => {
                                                message.member.ban({ reason: "Sending scam links" });
                                            });
                                        break;
                                }
                            });
                        } catch (error) {
                            return;
                        }
                    }

                }

            }
        })
    },
};
