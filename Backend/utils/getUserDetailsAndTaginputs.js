const { getdb } = require("../db/db");
const { UserAndTaginputsAggregation } = require("../aggregations/UserAndTaginputsAggregation");
module.exports.getUserDetailsAndTaginputs = (emailAddress) => {
    const db = getdb();
    const results = db.collection("users").aggregate(UserAndTaginputsAggregation(emailAddress)).toArray();
    if (!results || results.length === 0) {
        throw new Error(`No user found for email: ${emailAddress}`);
    }
    const data = results[0];
    const tokens = {
            access_token: data.accessToken,
            refresh_token: data.refreshToken,
            expiry_date: data.accessTokenExpiresAt ? new Date(data.accessTokenExpiresAt).getTime() : undefined,
        }

    const rawTags = data.rawTags.map(tagDoc=>tagDoc.patternRaw);
    return {tokens, tags: rawTags};

};