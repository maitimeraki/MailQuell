const { mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
<<<<<<< HEAD
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
=======
    workspaceId: { type: mongoose.Types.ObjectId, index: true },
    name: {type:String, required: true},
    email:{type:String, lowercase:true,unique:true},
    avatarUrl: { type: String },
    timezone: { type: String },
    roles: { type: String, enum: ["owner", "member"] },
    disabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports.User = mongoose.model("User", UserSchema );
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
