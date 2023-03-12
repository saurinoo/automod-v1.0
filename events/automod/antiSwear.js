const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const automodSchema = require('../../Schemas/automodSchema');
const AntiSwear = require("../../Data/badWord.json");

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        if (message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) return;

        if (!message.content == "@everyone") return

        const guild = message.guild;
        const Swearlinks = AntiSwear.known_links;

        automodSchema.findOne({ guildId: guild.id }, async (err, data) => {
            if (err) throw err;
            if (!data) return;
            if (data.plugins.AntiSwear === false) return;
            if (data) {

                for (let i in Swearlinks) {

                    if (message.content.toLowerCase().includes(Swearlinks[i].toLowerCase())) {
                        try {
                            await message.delete();
                        } catch (error) {
                            return;
                        }

                        const buttons = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel("Timeout")
                                .setEmoji("⚒️")
                                .setCustomId("timeout")
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setLabel("Kick")
                                .setEmoji("🔨")
                                .setCustomId("kick")
                                .setStyle(ButtonStyle.Danger)
                        );

                        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor('ef233c').setDescription(`\`📛\` | ${message.author} has been warned for **bad word** usage.`)] });
                        setTimeout(async () => {
                            await msg.delete();
                        }, 5000);

                        try {
                            const text = await guild.channels.cache.get(data.channelId).send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('ef233c')
                                        .setDescription(`${message.author} has been warned for **bad word** usage.\n\`\`\`${message.content}\`\`\``)
                                ],
                                components: [buttons]
                            });

                            const col = text.createMessageComponentCollector();
                            col.on("collect", async (m) => {
                                const ms = require("ms");
                                switch (m.customId) {
                                    case "timeout":
                                        if (
                                            !m.member.permissions.has(PermissionFlagsBits.ModerateMembers)
                                        )
                                            return m.reply({
                                                content: "You don't have permission to timeout",
                                                ephemeral: true,
                                            });
                                        const embed = new EmbedBuilder()
                                            .setTitle("Timeout")
                                            .setDescription(
                                                `You have received a timeout from \`${message.guild.name}\` for sending scam links`
                                            )
                                            .setColor("0x2f3136");

                                        m.message.edit({ components: [] });

                                        m.reply({
                                            content: `Timeout ${message.author.tag} for ${data.timeout}`,
                                            ephemeral: true,
                                        });

                                        message.member
                                            .send({
                                                embeds: [embed],
                                            })
                                            .then(() => {
                                                const time = ms(data.timeout);
                                                message.member.timeout(time);
                                            });
                                        break;
                                    case "kick":
                                        if (!m.member.permissions.has(PermissionFlagsBits.KickMembers))
                                            return m.reply({
                                                content: "You don't have permission to kick",
                                                ephemeral: true,
                                            });
                                        const embedss = new EmbedBuilder()
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
                                                embeds: [embedss],
                                            })
                                            .then(() => {
                                                message.member.kick({ reason: "Sending scam links" });
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
