const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const automodSchema = require('../../Schemas/automodSchema');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const guild = message.guild;

        const ragex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;

        automodSchema.findOne({ guildId: guild.id }, async (err, data) => {
            if (err) throw err;
            if (!data) return;
            if (data.plugins.AntiLink === false) return;
            if (data) {

                if (ragex.test(message.content)) {
                    try {
                        await message.delete();
                    } catch (error) {
                        return;
                    }

                    const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor('8d99ae').setDescription(`\`🔗\` | ${message.author} has **sent a link**.`)] });
                    setTimeout(async () => {
                        await msg.delete();
                    }, 5000);

                    try {
                        guild.channels.cache.get(data.channelId).send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('8d99ae')
                                    .setDescription(`${message.author} has **sent a link**.\n\`\`\`${message.content}\`\`\``)
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
