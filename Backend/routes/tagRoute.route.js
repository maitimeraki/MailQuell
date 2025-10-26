const express = require('express');
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
<<<<<<< HEAD
const { getdb } = require("../db/db");
const { ObjectId } = require("mongodb");

=======
// const { processIncomingEmails} = require('../controllers/tags.controllers');
// const oAuth2Client = require("../controllers/oAuthClient");
// const {updateTags}= require('../service/updateTags');
const { getdb } = require("../db/db");
const { ObjectId } = require("mongodb");
// router.post('/processTags', async (req, res) => {
//     try {
//         const { tags } = req.body;
//         console.log(req.sessionID)
//         console.log("Received tags in route:", tags); // Debug log

//         if (!tags || !Array.isArray(tags)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid tags format"
//             });
//         }
//         const tokenData=req.session.token;
//         if (!tokenData) {
//             return res.status(401).json({
//                 success: false,
//                 message: "No valid token found"
//             });
//         }
//         const tokens = JSON.parse(tokenData);
//         oAuth2Client.setCredentials(tokens);
//         const updated = updateTags(oAuth2Client, tags);
//         console.log(updated);

//         if (updated) {
//             res.json({
//                 success: true,
//                 message: 'Tags updated successfully',
//                 tags: tags
//             });
//         } else {
//             throw new Error('Failed to update tags');
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// });


// function getCreatedBy(req) {
//   return req.session?.user?.sub || req.session?.profile?.sub || req.user?.sub || null;
// }



>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
router.get("/tag-inputs", async (req, res) => {
    try {
        const { createdBy } = req.query;
        if (!createdBy) return res.status(400).json({ error: "createdBy required" });
        const tagFetching = await getdb().collection("taginputs");
        const docs = await tagFetching.find({ createdBy: String(createdBy) }).sort({ createdAt: -1 }).toArray();
        res.json(docs);

    } catch (e) {
        if (!res.headersSent)
            res.status(500).json({ ok: false, error: "Fetch all input tags causes error!" });
    }
});
router.post("/create-tag-inputs", async (req, res) => {
    try {
        let { createdBy, patternRaw, tagsPageId } = req.body;
        if (!createdBy || !patternRaw) return res.status(400).json({ error: "workspaceId & patternRaw required" });
        const createInput = await getdb().collection("taginputs");
        const now = new Date();
        const doc = { createdBy: String(createdBy), patternRaw: String(patternRaw), tagsPageId: tagsPageId, createdAt: now, updatedAt: now };
        await createInput.insertOne(doc);
        console.log("Created tag input:", doc._id);
        // If linked to a page, append tag id to tagpages.tagInputIds
        if (tagsPageId) {
            console.log("Adding to page:", tagsPageId);
            console.log(typeof tagsPageId);
            tagsPageId = new ObjectId(String(tagsPageId));
            const pages = await getdb().collection("tagpages");
            const page = await pages.find({ _id: tagsPageId });
            if (page) {
                if (!Array.isArray(page.tagInputIds)) {
                    await pages.updateOne({ _id: tagsPageId }, { $set: { tagInputIds: [doc._id], updatedAt: now } });
                }else {
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

<<<<<<< HEAD

=======
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
router.delete("/remove-tag-inputs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
        const deleteTag = await getdb().collection("taginputs");
        const r = await deleteTag.deleteOne({ _id: new ObjectId(id) });
        if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
        const now = new Date();
        // Pull from any pages.tagInputIds
        //Used to remove all instances of a specified value or values from an array within a document. 
        await getdb().collection("tagpages").updateMany({}, { $pull: { tagInputIds: new ObjectId(id) } }, { $set: { updateAt: now } });
        res.json({ deleted: true });
    } catch (e) {
        throw e;
    }
});


router.delete('/clearall-tag-inputs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "id required" });
        const deleteTag = await getdb().collection("taginputs");
        const r = await deleteTag.deleteMany({ _id: String(id) });
        const now = new Date();
        // Pull from any pages.tagInputIds
        //Used to remove all instances of a specified value or values from an array within a document. 
        await getdb().collection("tagpages").updateMany({}, { $pull: { tagInputIds: new ObjectId(id) } }, { $set: { updateAt: now } });
        res.json({ deleted: true });
    } catch (e) {
        throw e;
    }
});



// ---------- PANELS (TAG PAGES) CRUD ----------
router.get("/tag-pages", async (req, res) => {
    try {
        const { createdBy } = req.query;
        if (!createdBy) return res.status(400).json({ error: "createdBy required" });
        const tagPageFetching = await getdb().collection("tagpages");
        const docs = await tagPageFetching.find({ createdBy: String(createdBy) }).sort({ order: 1, createdAt: -1 }).toArray();
        res.json(docs);
    } catch (e) {
        console.log("Fetch tag pages error:", e);
        if (!res.headersSent)
            res.status(500).json({ ok: false, error: "Fetch all tag pages causes error!" });
    }
});


router.post("/create-tag-page", async (req, res) => {
    try {
        const { name, createdBy, order } = req.body;
        if (!name || !createdBy) return res.status(400).json({ error: "name & createdBy required" });
        const create = await getdb().collection("tagpages");
        const now = new Date();
        const doc = {
            name: String(name),
            createdBy: String(createdBy),
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
router.patch("/update-tag-page/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
        const { name, order } = req.body;
        if (!name && (order === undefined || order === null)) return res.status(400).json({ error: "Nothing to update" });
        const updateData = await getdb().collection("tagpages");
        const docs = await updateData.findOneAndUpdate({ _id: new ObjectId(id) },
            { $set: { name: name } },
            { returnDocument: 'after' });
        return res.json(docs.value);
    } catch (e) {
        throw e;
    }

});

router.delete("/remove-tag-page/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    try {
        const deletePage = await getdb().collection("tagpages");
        const deleteInput = await getdb().collection("taginputs");

        // Remove all tag inputs in this page
        const r = await deletePage.deleteOne({ _id: new ObjectId(id) });
        if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
        const deleteTagInputs = await deleteInput.deleteMany({ tagsPageId: String(id) });
        // optional: remove all tag inputs in this page
        res.json({ deleted: true, deletedTagInputs: deleteTagInputs.deletedCount });
    } catch (e) {
        throw e;
    }
})

module.exports = router;