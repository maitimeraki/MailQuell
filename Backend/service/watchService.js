
const { getdb } = require("../db/db");
// removed dependence on Mongoose model to avoid strict-mode upsert errors

async function startWatch({ createdBy, expiration, historyId }) {
  if (!createdBy) throw new Error("createdBy is required");

  const users = getdb().collection("users"); // native driver
  const now = new Date();

  // store watch metadata under user's document using workspaceId = createdBy (as used elsewhere)
  const filter = { workspaceId: String(createdBy) };
  const update = {
    $set: {
      "watch.enabled": true,
      "watch.historyId": historyId || null,
      "watch.expiration": expiration ? new Date(Number(expiration)) : null,
      "watch.lastSetupAt": now,
      "watch.webhookStatus": "pending",
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
      $set: {
        "watch.enabled": false,
        "watch.historyId": null,
        "watch.expiration": null,
        "watch.lastError": null,
        "watch.webhookStatus": "pending",
        updatedAt: now
      }
    }
  );
  return true;
}

async function getStatus({ createdBy }) {
  if (!createdBy) throw new Error("createdBy is required");
  const users = getdb().collection("users");
  //Limits the data returned to save memory and speed up the app -> projection.
  const doc = await users.findOne({ workspaceId: String(createdBy) }, { projection: { watch: 1 } });
  return doc?.watch ?? null;
}

module.exports = { startWatch, stopWatch, getStatus };
