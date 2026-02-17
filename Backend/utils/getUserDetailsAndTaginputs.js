const { getdb } = require("../db/db");
const { UserAndTaginputsAggregation } = require("../aggregations/UserAndTaginputsAggregation");
module.exports.getUserDetailsAndTaginputs = async (emailAddress) => {
    const tokenData = await UserAndTaginputsAggregation(emailAddress);

    const results = await getdb().collection("users").aggregate(tokenData).toArray();
    if (!results || results.length === 0) {
        throw new Error(`No user found for email: ${emailAddress}`);
    }
    const data = results[0];
    const tokens = {
            access_token: data.tokens.accessToken,
            refresh_token: data.tokens.refreshToken,
            expiry_date: data.tokens.accessTokenExpiresAt ? new Date(data.tokens.accessTokenExpiresAt).getTime() : undefined,
        }

    const rawTags = data.rawTags.map(tagDoc=>tagDoc.patternRaw);
    return {tokens, tags: rawTags};

};