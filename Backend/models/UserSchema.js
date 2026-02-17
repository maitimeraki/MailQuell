const { mongoose } = require("mongoose");

const WatchSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    historyId: String,
    expiration: Date,
    lastSetupAt: Date,
    lastError: String,
    webhookStatus: { type: String, enum: ["ok", "failed", "pending"], default: "pending" }
}, { _id: false });

const TokenSchema = new mongoose.Schema({
    accessToken: String,
    refreshToken: String,
    accessTokenExpiresAt: Date,
    lastRefreshAt: Date
}, { _id: false });

const UserSchema = new mongoose.Schema({
    workspaceId: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, lowercase: true, unique: true },
    avatarUrl: { type: String },
    timezone: { type: String },
    tokens: TokenSchema, // <-- nested for clarity
    watch: WatchSchema,  // <-- nested for clarity
    lastSyncAt: Date,
    syncStatus: { type: String, enum: ["idle", "running", "error"], default: "idle" },
    roles: { type: String, enum: ["owner", "member"], default: "owner" },
    disabled: { type: Boolean, default: false },
    lastLoginAt: Date,
    lastWebhookAt: Date,
    // tags: [{ type: String }], // or reference to tags collection
    audit: {
        createdAt: Date,
        updatedAt: Date
    }
}, { timestamps: true });

module.exports.User = mongoose.model("User", UserSchema);