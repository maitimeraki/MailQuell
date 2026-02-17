const { getdb } = require("..db/db");
const { ObjectId } = require('mongodb');

async function incrementTagStats(createdBy, matchedTagIds = [], messageId, receivedAt = new Date()) {
    if (!createdBy || !Array.isArray(matchedTagIds) || matchedTagIds.length === 0) return;
    const col = getdb().collection("taginputs");

    const bulk = col.initializeUnorderedBulkOp();
    const now = receivedAt ? new Date(receivedAt) : new Date();

    for (const tid of matchedTagIds) {
        if (!tid) continue;
        const oid = ObjectId.isValid(String(tid)) ? new ObjectId(String(tid)) : null;
        const filter = oid ? { _id: oid, createdBy: String(createdBy) } : { _id: tid, createdBy: String(createdBy) };
        bulk.find(filter).upsert().updateOne({
            $inc: { processedCount: 1 },
            $set: { lastProcessedAt: now, lastMatchedMessageId: String(messageId) }
        });
    }

    if (bulk.length > 0) {
        try {
            await bulk.execute();
        } catch (e) {
            console.error("incrementTagStats bulk error:", e);
        }
    }
}

module.exports = { incrementTagStats };

