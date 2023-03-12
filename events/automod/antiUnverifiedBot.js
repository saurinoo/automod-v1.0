
const { UserFlags, EmbedBuilder } = require('discord.js');
const automodSchema = require('../../Schemas/automodSchema');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        if (!member.user.bot) return;
        automodSchema.findOne({ guildId: member.guild.id }, async (err, data) => {
            if (err) throw err;
            if (!data) return;
            if (data.plugins.AntiUnverifiedBot === false) return;
            if (!member.user.flags.has(UserFlags.VerifiedBot)) {
                try {
                    member.guild.channels.cache.get(data.channelId).send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Bot kicked`)
                                .setDescription(`${member.user.tag} was kicked from server for **being unverified**`)
                                .setColor('588157')
                        ]
                    })
                } catch (error) {
                    return
                }
                member.kick("No Unverified Bots Allowed");
            }
        })
    }
}
