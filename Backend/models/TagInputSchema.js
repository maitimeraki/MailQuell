const { mongoose } = require("mongoose");


const TagInputSchema = new mongoose.Schema({
    // Google sub used consistently as a string
    workspaceId: { type: String, index: true, required: true },
    createdBy: { type: String, index: true }, // store profile.sub directly
    patternRaw: { type: String, required: true },
    tagsPageId: { type: mongoose.Types.ObjectId, ref: "TagPage", index: true },// returns the model class
    active: { type: Boolean, default: false },
    processedCount: { type: Number, default: 0, index: true }, // total processed mails matching this tag
    lastProcessedAt: { type: Date, default: null },            // last time a mail matched this tag
    lastMatchedMessageId: { type: String, default: null }      // last gmail messageId matched
}, { timestamps: true });
TagInputSchema.index({ _id: 1 }, { unique: true });


const TagPageSchema = new mongoose.Schema({
    // Google sub used consistently as a string
    workspaceId: { type: String, index: true, required: true },
    createdBy: { type: String, index: true }, // store profile.sub directly
    name: { type: String, required: true },
    tagInputIds: { type: [{ type: mongoose.Types.ObjectId, ref: "TagInput" }], default: null }, // array of TagInput ids
    order: { type: Number, default: 0, index: true }, // for sorting
}, { timestamps: true });


module.exports.TagInput = mongoose.model("TagInput", TagInputSchema);
module.exports.TagPage = mongoose.model("TagPage", TagPageSchema);