const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const automodSchema = require('../../Schemas/automodSchema');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        if (message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) return;

        if (!message.content == "@everyone") return

        const guild = message.guild;

        automodSchema.findOne({ guildId: guild.id }, async (err, data) => {
            if (err) throw err;
            if (!data) return;
            if (data.plugins.AntiPing === false) return;
            if (data) {

                if (message.content == "@everyone") {
                    try {
                        await message.delete();
                    } catch (error) {
                        return;
                    }

                    const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor('8ecae6').setDescription(`\`📌\` | ${message.author} has **pinged everyone**.`)] });
                    setTimeout(async () => {
                        await msg.delete();
                    }, 5000);

                    try {
                        guild.channels.cache.get(data.channelId).send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('8ecae6')
                                    .setDescription(`${message.author} has **pinged everyone**.\n\`\`\`${message.content}\`\`\``)
                            ]
                        });
                    } catch (error) {
                        return;
                    }
                }

            }
        })
    },
};
