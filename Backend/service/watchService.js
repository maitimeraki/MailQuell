// ...new file...
const { Integration } = require("../models/IntegrationSchema");
const { ObjectId } = require("mongodb");

async function startWatch({ createdBy, accountEmail, channelId, resourceId, expiration, historyId }) {
    // idempotent: upsert integration and set watch metadata
    const update = {
        $set: {
            createdBy: String(createdBy),
            accountEmail,
            "watch.enabled": true,
            "watch.channelId": channelId,
            "watch.resourceId": resourceId,
            "watch.expiration": expiration ? new Date(expiration) : null,
            "watch.historyId": historyId || null,
            updatedAt: new Date()
        }
    };
    const opts = { upsert: true, new: true }; //"upsert" is a combination of an update and an insert operation
    await Integration.findOneAndUpdate({ createdBy: String(createdBy), provider: "gmail" }, update, { upsert: true });
    return { ok: true };
}

async function stopWatch({ createdBy }) {
    // idempotent: turn off watch fields
    await Integration.findOneAndUpdate(
        { createdBy: String(createdBy), provider: "gmail" },
        { $set: { "watch.enabled": false, "watch.channelId": null, "watch.resourceId": null, "watch.expiration": null, updatedAt: new Date() } },
        { upsert: false }
    );
    return { ok: true };
}

async function getStatus({ createdBy }) {
    const doc = await Integration.findOne({ createdBy: String(createdBy), provider: "gmail" }).lean();
    if (!doc) return { watching: false };
    return {
        watching: !!doc.watch?.enabled,
        watch: doc.watch || null,
        lastSyncAt: doc.lastSyncAt || null,
        syncStatus: doc.syncStatus || "idle"
    };
}

module.exports = { startWatch, stopWatch, getStatus };