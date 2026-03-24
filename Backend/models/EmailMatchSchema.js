const { mongoose } = require("mongoose");


const EmailMatchSchema = new mongoose.Schema({
    owner: { type: String, index: true },
    threadId: { type: String, index: true },//Gmail thread ID for grouping related emails
    gmailMessageId: { type: String, index: true },//Unique identifier from Gmail API for the specific email message
    senderEmail: { type: String, index: true },//Email address of the sender
    senderDomain: { type: String, index: true },//Domain of the email sender
    subject: { type: String },//Subject line of the email
    body: { type: String },//Compressed and encrypted email body
    receivedAt: { type: Date, index: true },//Timestamp when the email was received
    processAt: { type: Date, index: true },//Timestamp when the email was processed
    // matchedTagInput: [{ type: mongoose.Types.ObjectId, ref: "TagInput" }],
    matchDetails: [{ // diagnostics: which pattern matched and why
        // tagInputId: { type: mongoose.Types.ObjectId, ref: "TagInput" },
        patternRaw: String,
        reason: String
    }],
    action: { type: String, enum: ["delete", "thrash"] }

}, { timestamps: true });

EmailMatchSchema.index({ owner: 1, gmailMessageId: 1 }, { unique: true })

module.exports.EmailMatch = mongoose.model("EmailMatch", EmailMatchSchema);