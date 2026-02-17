const { mongoose } = require("mongoose");


const EmailMatchSchema = new mongoose.Schema({
    workspaceId: { type: String, index: true },
    gmailMessageId: { type: String, index: true },//Unique identifier from Gmail API for the specific email message
    threadId: { type: String, index: true },//Gmail thread ID for grouping related emails
    senderEmail: { type: String, index: true },//Email address of the sender
    senderDomain: { type: String, index: true },//Domain of the email sender
    receivedAt: { type: Date, index: true },//Timestamp when the email was received
    processAt: { type: Date, index: true },//Timestamp when the email was processed
    matchedTagInput: [{ type: mongoose.Types.ObjectId, ref: "TagInput" }],
    matchDetails: [{ // diagnostics: which pattern matched and why
        tagInputId: { type: mongoose.Types.ObjectId, ref: "TagInput" },
        patternRaw: String,
        reason: String
    }],
    action: { type: String, enum: ["delete", "thrash"] }

}, { timestamps: true });

EmailMatchSchema.index({ workspaceId: 1, gmailMessageId: 1 }, { unique: true })

module.exports.EmailMatch = mongoose.model("EmailMatch", EmailMatchSchema);