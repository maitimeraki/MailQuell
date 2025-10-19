const { mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
    workspaceId: { type: mongoose.Types.ObjectId, index: true },
    name: {type:String, required: true},
    email:{type:String, lowercase:true,unique:true},
    avatarUrl: { type: String },
    timezone: { type: String },
    roles: { type: String, enum: ["owner", "member"] },
    disabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports.User = mongoose.model("User", UserSchema );
