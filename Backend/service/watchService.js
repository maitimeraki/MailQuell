
const { getdb } = require("../db/db");
// removed dependence on Mongoose model to avoid strict-mode upsert errors

async function startWatch({ createdBy, channelId, resourceId, expiration, historyId }) {
  if (!createdBy) throw new Error("createdBy is required");

  const users = getdb().collection("users"); // native driver
  const now = new Date();

  // store watch metadata under user's document using workspaceId = createdBy (as used elsewhere)
  const filter = { workspaceId: String(createdBy) };
  const update = {
    $set: {
      lastWatch: {
        channelId,
        resourceId,
        expiration: expiration ? new Date(Number(expiration)) : null,
        historyId: historyId || null,
        updatedAt: now
      },
      updatedAt: now
    },
    $setOnInsert: {
      workspaceId: String(createdBy),
      createdAt: now
    }
  };

  await users.updateOne(filter, update, { upsert: true });
  return true;
}

async function stopWatch({ createdBy }) {
  if (!createdBy) throw new Error("createdBy is required");

  const users = getdb().collection("users");
  const now = new Date();

  // clear lastWatch or mark stopped
  await users.updateOne(
    { workspaceId: String(createdBy) },
    {
      $unset: { lastWatch: "" },
      $set: { updatedAt: now }
    }
  );
  return true;
}

async function getStatus({ createdBy }) {
  if (!createdBy) throw new Error("createdBy is required");
  const users = getdb().collection("users");
  const doc = await users.findOne({ workspaceId: String(createdBy) }, { projection: { lastWatch: 1 } });
  return doc?.lastWatch ?? null;
}

module.exports = { startWatch, stopWatch, getStatus };
