const express = require('express');
const Crypto = require('crypto');
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const { getdb } = require("../db/db");
const { ObjectId } = require("mongodb");
const { createdByQuerySchema, createTagInputBodySchema, removeTagInputParamsSchema, clearAllTagInputParamsSchema, createTagPageBodySchema, updateTagPageParamsSchema, updateTagPageBodySchema, removeTagPageParamsSchema, validateBody, validateQuery, validateParams } = require('../validations/tag.route.validation');

router.get("/tag-inputs", validateQuery(createdByQuerySchema), async (req, res) => {
    try {
        const { createdBy } = req.query;
        // if (!createdBy) return res.status(400).json({ error: "createdBy required" });
        const tagFetching = await getdb().collection("taginputs");
        const docs = await tagFetching.find({ createdBy }).sort({ createdAt: -1 }).toArray();
        res.json(docs);

    } catch (e) {
        if (!res.headersSent)
            res.status(500).json({ ok: false, error: "Fetch all input tags causes error!" });
    }
});
router.post("/create-tag-inputs", validateBody(createTagInputBodySchema), async (req, res) => {
    try {
        let { createdBy, patternRaw, tagsPageId } = req.body;
        // if (!createdBy || !patternRaw) return res.status(400).json({ error: "workspaceId & patternRaw required" });
        const trackingId = crypto.randomUUID(); // Generate ID
        const createInput = await getdb().collection("taginputs");
        const now = new Date();
        const doc = { _id: trackingId, createdBy, patternRaw, tagsPageId: tagsPageId, createdAt: now, updatedAt: now };
        await createInput.insertOne(doc);
        console.log("Created tag input:", doc._id);
        // If linked to a page, append tag id to tagpages.tagInputIds
        if (tagsPageId) {
            console.log("Adding to page:", tagsPageId);
            // console.log(typeof tagsPageId);
            // tagsPageId = new ObjectId(String(tagsPageId));
            const pages = await getdb().collection("tagpages");
            const page = await pages.find({ _id: tagsPageId });
            if (page) {
                if (!Array.isArray(page?.tagInputIds)) {
                    await pages.updateOne({ _id: tagsPageId }, { $set: { tagInputIds: [doc._id], updatedAt: now } });
                } else {
                    await pages.updateOne(
                        { _id: tagsPageId },
                        //used to add a value to an array field only if the value does not already exist in the array
                        { $addToSet: { tagInputIds: doc._id }, $set: { updatedAt: now } }
                    );
                }
            }
        }
        res.status(201).json(doc);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ error: "Duplicate pattern" });
        throw e;
    }
});

router.delete("/remove-tag-inputs/:id", validateParams(removeTagInputParamsSchema), async (req, res) => {
    try {
        const { id } = req.params;
        // if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
        const deleteTag = await getdb().collection("taginputs");
        const r = await deleteTag.deleteOne({ _id: id });
        if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
        const now = new Date();
        // Pull from any pages.tagInputIds
        //Used to remove all instances of a specified value or values from an array within a document. 
        await getdb().collection("tagpages").updateMany({}, { $pull: { tagInputIds: id } }, { $set: { updateAt: now } });
        res.json({ deleted: true });
    } catch (e) {
        throw e;
    }
});


router.delete('/clearall-tag-inputs/:id', validateParams(clearAllTagInputParamsSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const deleteTag = await getdb().collection("taginputs");
        const r = await deleteTag.deleteMany({ _id: id });
        const now = new Date();
        // Pull from any pages.tagInputIds
        //Used to remove all instances of a specified value or values from an array within a document. 
        await getdb().collection("tagpages").updateMany({}, { $pull: { tagInputIds: id } }, { $set: { updateAt: now } });
        res.json({ deleted: true });
    } catch (e) {
        throw e;
    }
});



// ---------- PANELS (TAG PAGES) CRUD ----------
router.get("/tag-pages", validateQuery(createdByQuerySchema), async (req, res) => {
    try {
        const { createdBy } = req.query;
        const tagPageFetching = await getdb().collection("tagpages");
        const docs = await tagPageFetching.find({ createdBy }).sort({ order: 1, createdAt: -1 }).toArray();
        res.json(docs);
    } catch (e) {
        console.log("Fetch tag pages error:", e);
        if (!res.headersSent)
            res.status(500).json({ ok: false, error: "Fetch all tag pages causes error!" });
    }
});


router.post("/create-tag-page", validateBody(createTagPageBodySchema), async (req, res) => {
    try {
        const { name, createdBy, order } = req.body;
        // if (!name || !createdBy) return res.status(400).json({ error: "name & createdBy required" });
        const create = await getdb().collection("tagpages");
        const now = new Date();
        const tagPageId = crypto.randomUUID();
        const doc = {
            _id: tagPageId,
            name,
            createdBy,
            order: Number.isFinite(order) ? order : 1,
            tagInputIds: null, // initially null, becomes array once first tag is added
            createdAt: now,
            updatedAt: now
        };
        await create.insertOne(doc);
        res.status(201).json(doc);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ error: "Duplicate name" });
        throw e;
    }
});
router.patch("/update-tag-page/:id", validateParams(updateTagPageParamsSchema), validateBody(updateTagPageBodySchema), async (req, res) => {
    try {
        const id = req.params.id;
        // if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
        const { name, order } = req.body;
        // if (!name && (order === undefined || order === null)) return res.status(400).json({ error: "Nothing to update" });
        const updateData = await getdb().collection("tagpages");
        const docs = await updateData.findOneAndUpdate({ _id: id },
            { $set: { name: name } },
            { returnDocument: 'after' });
        return res.json(docs.value);
    } catch (e) {
        throw e;
    }

});

router.delete("/remove-tag-page/:id", validateParams(removeTagPageParamsSchema), async (req, res) => {
    const { id } = req.params;
    // if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    try {
        const deletePage = await getdb().collection("tagpages");
        const deleteInput = await getdb().collection("taginputs");

        // Remove all tag inputs in this page
        const r = await deletePage.deleteOne({ _id: id });
        if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
        const deleteTagInputs = await deleteInput.deleteMany({ tagsPageId:(id) });
        // optional: remove all tag inputs in this page
        res.json({ deleted: true, deletedTagInputs: deleteTagInputs.deletedCount });
    } catch (e) {
        throw e;
    }
})

module.exports = router;