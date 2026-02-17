
const { mongoose } = require("mongoose");

const IntegrationSchema = new mongoose.Schema({
    workspaceId: { type: String, index: true },
    provider: { type: String, enum: ["gmail"], default: "gmail" },
    accountEmail: { type: String, lowercase: true },
    refreshToken: String,
    accessToken: String,
    accessTokenExpiresAt: Date,
    watch: {
        enabled: { type: Boolean, default: false },
        historyId: String,
        channelId: String,
        resourceId: String,
        expiration: Date
    },
    lastSyncAt: Date,
    syncStatus: { type: String, enum: ["idle", "running", "error"], default: "idle" },
    error: String
}, { timestamps: true });

IntegrationSchema.index({ workspaceId: 1, provider: 1 }, { unique: true });

module.exports.Integration = mongoose.model("Integration", IntegrationSchema);
