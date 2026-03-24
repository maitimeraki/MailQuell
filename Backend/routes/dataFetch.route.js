const express = require('express');
const router = express.Router();
const { getdb } = require("../db/db");
const { processedMailFetchPipeline } = require("../aggregations/processedMailFetch");
// GET /api/processed-mail-stats?createdBy=USER_ID
router.get('/processed-mail-stats', async (req, res) => {
    try {
        const { createdBy } = req.query;
        if (!createdBy) return res.status(400).json({ error: "createdBy required" });

        const now = new Date();
        const daysAgo = d => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
        const pipeline = processedMailFetchPipeline(String(createdBy), daysAgo);
        const result = await getdb().collection("emailmatches").aggregate(pipeline).toArray();
        const stats = result[0] || {};

        res.json({
            total: stats.total[0]?.count || 0,
            last7: stats.last7[0]?.count || 0,
            last30: stats.last30[0]?.count || 0,
            last90: stats.last90[0]?.count || 0,
            tagInputStats: stats.tagInputStats,
            topPatterns: stats.topPatterns
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});


// GET /api/activity?limit=500&type=processed_mail&search=gmail&status=success&createdBy=abc
router.get("/mail-activity", async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || "200", 10), 1), 2000);
    // const type = (req.query.type || "").trim();
    // const search = (req.query.search || "").trim();
    // const status = (req.query.status || "").trim();
    const createdBy = (req.query.createdBy || "").trim();

    const filter = {};

    // Adjust these fields to your schema if needed
    if (createdBy) {
      filter.$or = [
        { owner: String(createdBy) },
        { workspaceId: String(createdBy) }
      ];
    }

    const docs = await getdb()
      .collection("emailmatches")
      .find(filter)
      .sort({ processAt: -1, createdAt: -1, receivedAt: -1 })
      .limit(limit)
      .toArray();

    const items = docs
      .map((d) => {
        const tagsFromMatchDetails = Array.isArray(d.matchDetails)
          ? d.matchDetails
              .map((m) => m?.patternRaw)
              .filter(Boolean)
          : [];

        const tagsFromMatchedTagInput = Array.isArray(d.matchedTagInput)
          ? d.matchedTagInput.map((x) => String(x))
          : [];

        const tags = tagsFromMatchDetails.length
          ? tagsFromMatchDetails
          : tagsFromMatchedTagInput;

        return {
          _id: d._id,
        //   type: type || "processed_mail",
          message: d.senderEmail
            ? `Processed mail from ${d.senderEmail}`
            : `Processed mail ${d.gmailMessageId || ""}`.trim(),
          tags,
        //   status: d.status || "success",
          actor: d.owner || d.workspaceId || "system",
          gmailMessageId: d.gmailMessageId || null,
          senderEmail: d.senderEmail || null,
        //   subject: d.subject || null,
          createdAt: d.processAt || d.createdAt || d.receivedAt || new Date(),
          meta: {
            action: d.action || null,
            threadId: d.threadId || null,
            receivedAt: d.receivedAt || null,
            processAt: d.processAt || null
          },
          relatedIds: []
        };
      })
    //   .filter((it) => {
    //     // if (!type || type === "all") return true;
    //     return String(it.type).toLowerCase() === String(type).toLowerCase();
    //   });

    res.json(items);
  } catch (e) {
    console.error("GET /processed/mail-activity failed:", e);
    res.status(500).json({ ok: false, error: "Failed to load activity" });
  }
});


module.exports = router;