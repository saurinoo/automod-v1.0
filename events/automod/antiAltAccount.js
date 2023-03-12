const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const automodSchema = require("../../Schemas/automodSchema");

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        if (!member.guild) return;
        if (member.user.bot) return;

        const guild = member.guild;
        const timeSpan = ms("7 days");

        automodSchema.findOne({ guildId: guild.id }, async (err, data) => {
            if (err) throw err;
            if (!data) return;
            if (data.plugins.AntiAltAccount === false) return;
            if (data) {
                const createdAt = new Date(member.user.createdAt).getTime();
                const difference = Date.now() - createdAt;
                if (difference < timeSpan) {
                    member.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("__Kicked__")
                                .setDescription("You were detected as an alt account")
                                .setColor("83c5be")
                                .setFooter({
                                    text: "If you are not an alt than your account must be older than 7 days",
                                })
                                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                        ]
                    }).then(() => {
                        member.kick("Kicked because of a ALT account");
                    });
                }

                try {
                    guild.channels.cache.get(data.channelId).send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("83c5be")
                                .setDescription(`${member} has a account older than 7 days and now has been kicked.`)
                        ]
                    })
                } catch (error) {
                    return;
                }
            }
        })
    }
}
