const { getDb, ObjectId } = require("../db/db");
const { profileIn } = require("./profileData");
const { name, sub, email } = profileIn() || {};
exports.createTagInput = async (req, res) => {
    const { patternRaw } = req.body;
    if (!workspaceId || !patternRaw) return res.status(400).json({ error: "workspaceId & patternRaw required" });
    const doc = {
        workspaceId: ObjectId(sub),
        createdBy: email,
        patternRaw,
        patternNorm: norm,
        tagsPageId: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    try {
        await getDb().collection("taginputs").insertOne(doc);
        res.status(201).json(doc);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ error: "Duplicate pattern" });
        throw e;
    }
};

exports.listTagInputs = async (req, res) => {
    const { workspaceId, active } = req.query;
    const q = {};
    if (workspaceId) q.workspaceId = new ObjectId(workspaceId);
    if (active !== undefined) q.active = active === "true";
    const docs = await getDb().collection("tagInputs").find(q).sort({ createdAt: -1 }).toArray();
    res.json(docs);
};

exports.getTagInput = async (req, res) => {
    const doc = await getDb().collection("tagInputs").findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
};

exports.updateTagInput = async (req, res) => {
    const updates = { ...req.body, updatedAt: new Date() };
    if (updates.patternRaw) {
        const { type, norm } = normalizePattern(updates.patternRaw, updates.patternType);
        updates.patternType = type;
        updates.patternNorm = norm;
    }
    try {
        const r = await getDb().collection("tagInputs").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updates },
            { returnDocument: "after" }
        );
        if (!r.value) return res.status(404).json({ error: "Not found" });
        res.json(r.value);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ error: "Duplicate pattern" });
        throw e;
    }
};

exports.deleteTagInput = async (req, res) => {
    const r = await getDb().collection("tagInputs").deleteOne({ _id: new ObjectId(req.params.id) });
    if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
    // remove from any pages
    await getDb().collection("tagPages").updateMany({}, { $pull: { tagInputIds: new ObjectId(req.params.id) } });
    res.json({ deleted: true });
};