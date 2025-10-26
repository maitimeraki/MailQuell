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
<<<<<<< HEAD
    name: { type: String, required: true },
    tagInputIds: { type: [{ type: mongoose.Types.ObjectId, ref: "TagInput" }], default: null }, // array of TagInput ids
    order: { type: Number, default: 0, index: true }, // for sorting
=======
    name: String,
    tagInputIds: { type: [{ type: mongoose.Types.ObjectId, ref: "TagInput" }], default: null }, // array of TagInput ids
    order: { type: Number, default: 0, index: true }, // for sorting
    
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
}, { timestamps: true });


module.exports.TagInput = mongoose.model("TagInput", TagInputSchema);
<<<<<<< HEAD
module.exports.TagPage = mongoose.model("TagPage", TagPageSchema);
=======
module.exports.TagPage = mongoose.model("TagPage", TagPageSchema);

>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
