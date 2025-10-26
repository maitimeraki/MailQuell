// ...new file...
<<<<<<< HEAD
const { User } = require("../models/UserSchema");
const { ObjectId } = require("mongodb");

async function startWatch({ createdBy, expiration, historyId }) {
    // idempotent: upsert User and set watch metadata
    const update = {
        $set: {
            createdBy: String(createdBy),
            "watch.enabled": true,
=======
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
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
            "watch.expiration": expiration ? new Date(expiration) : null,
            "watch.historyId": historyId || null,
            updatedAt: new Date()
        }
    };
    const opts = { upsert: true, new: true }; //"upsert" is a combination of an update and an insert operation
<<<<<<< HEAD
    await User.findOneAndUpdate({ createdBy: String(createdBy) }, update, opts);
=======
    await Integration.findOneAndUpdate({ createdBy: String(createdBy), provider: "gmail" }, update, { upsert: true });
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
    return { ok: true };
}

async function stopWatch({ createdBy }) {
    // idempotent: turn off watch fields
<<<<<<< HEAD
    await User.findOneAndUpdate(
        { createdBy: String(createdBy) },
        { $set: { "watch.enabled": false, "watch.expiration": null, updatedAt: new Date() } },
=======
    await Integration.findOneAndUpdate(
        { createdBy: String(createdBy), provider: "gmail" },
        { $set: { "watch.enabled": false, "watch.channelId": null, "watch.resourceId": null, "watch.expiration": null, updatedAt: new Date() } },
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
        { upsert: false }
    );
    return { ok: true };
}

<<<<<<< HEAD

async function getStatus({ createdBy }) {
    const doc = await User.findOne({ createdBy: String(createdBy) }).lean();
=======
async function getStatus({ createdBy }) {
    const doc = await Integration.findOne({ createdBy: String(createdBy), provider: "gmail" }).lean();
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
    if (!doc) return { watching: false };
    return {
        watching: !!doc.watch?.enabled,
        watch: doc.watch || null,
        lastSyncAt: doc.lastSyncAt || null,
        syncStatus: doc.syncStatus || "idle"
    };
}

module.exports = { startWatch, stopWatch, getStatus };