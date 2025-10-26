// ...new file...

const { User } = require("../models/UserSchema");
const { ObjectId } = require("mongodb");

async function startWatch({ createdBy, expiration, historyId }) {
    // idempotent: upsert User and set watch metadata
    const update = {
        $set: {
            createdBy: String(createdBy),
            "watch.enabled": true,
            "watch.expiration": expiration ? new Date(expiration) : null,
            "watch.historyId": historyId || null,
            updatedAt: new Date()
        }
    };
    const opts = { upsert: true, new: true }; //"upsert" is a combination of an update and an insert operation
    await User.findOneAndUpdate({ createdBy: String(createdBy) }, update, opts);

    return { ok: true };
}

async function stopWatch({ createdBy }) {
    // idempotent: turn off watch fields
    await User.findOneAndUpdate(
        { createdBy: String(createdBy) },
        { $set: { "watch.enabled": false, "watch.expiration": null, updatedAt: new Date() } },
        { upsert: false }
    );
    return { ok: true };
}

async function getStatus({ createdBy }) {
    const doc = await User.findOne({ createdBy: String(createdBy) }).lean();
    if (!doc) return { watching: false };
    return {
        watching: !!doc.watch?.enabled,
        watch: doc.watch || null,
        lastSyncAt: doc.lastSyncAt || null,
        syncStatus: doc.syncStatus || "idle"
    };
}

module.exports = { startWatch, stopWatch, getStatus };