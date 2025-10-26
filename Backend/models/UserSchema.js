const { mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
    workspaceId: {type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, lowercase: true, unique: true },
    avatarUrl: { type: String },
    timezone: { type: String },
    refreshToken: String,
    accessToken: String,
    accessTokenExpiresAt: Date,
    watch: {
        enabled: { type: Boolean, default: false },
        historyId: String,
        expiration: Date
    },
    lastSyncAt: Date,
    syncStatus: { type: String, enum: ["idle", "running", "error"], default: "idle" },
    roles: { type: String, enum: ["owner", "member"], default: "owner" },
    disabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports.User = mongoose.model("User", UserSchema);
