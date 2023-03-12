const { Schema, model } = require("mongoose");
const automodSchema = new Schema({
    guildId: String,
    channelId: String,
    plugins: {
        AntiUnverifiedBot: { type: Boolean, default: true },
        AntiSwear: { type: Boolean, default: true },
        AntiScam: { type: Boolean, default: true },
        AntiLink: { type: Boolean, default: true },
        AntiPing: { type: Boolean, default: true },
        AntiAltAccount: { type: Boolean, default: true }
    }
}, { versionKey: false });

module.exports = model("automodSchema", automodSchema, "automodSchema");
