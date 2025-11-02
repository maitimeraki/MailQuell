//This worker scans Redis keys prefixed with sess: and extracts session JSON, then upserts into users collection. Run as a separate process or cron.

const Redis = require("redis");
const { getdb } = require("../db/db");

async function sync() {
  const client = Redis.createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
  await client.connect();
  const db = getdb();
  const users = db.collection("users");

  // scan keys
  let cursor = 0;
  do {
    const reply = await client.scan(cursor, { MATCH: "sess:*", COUNT: 100 });
    cursor = Number(reply.cursor);
    const keys = reply.keys || reply[1] || [];
    for (const key of keys) {
      const raw = await client.get(key);
      if (!raw) continue;
      try {
        const sess = JSON.parse(raw);
        if (sess && sess.token) {
          // normalize token
          const tokens = typeof sess.token === "string" ? JSON.parse(sess.token) : sess.token;
          const access_token = tokens?.access_token;
          // Optionally fetch profile or store by known workspaceId if present
          // Example: if you stored workspaceId on session earlier:
          const workspaceId = sess.workspaceId || tokens?.workspaceId;
          if (workspaceId) {
            await users.updateOne(
              { workspaceId: String(workspaceId) },
              {
                $set: {
                  refreshToken: tokens?.refresh_token || null,
                  accessToken: access_token || null,
                  accessTokenExpiresAt: tokens?.expiry_date ? new Date(tokens.expiry_date) : null,
                  updatedAt: new Date()
                }
              },
              { upsert: true }
            );
          }
        }
      } catch (e) {
        console.warn("Failed to parse session", key, e);
      }
    }
  } while (cursor !== 0);
  await client.disconnect();
}

if (require.main === module) {
  sync().then(() => console.log("Sync done")).catch(console.error);
}