const jwtDecode = require("jwt-decode");
const { getdb } = require("../db/db");


let activeTags = new Map();
module.exports.activeTags = activeTags;

function getSubIDFromAuth(auth){
    if(!auth || !auth.id_token) return null;
    try{
        const decoded = jwtDecode(auth.id_token);
        return decoded.sub || null;
    } catch (error) {
        console.error("Failed to decode auth token:", error);
        return null;
    }
}

/**
 * Fetches all tags for the user from the database and updates the in-memory map.
 * @param {string} auth - User identifier (e.g., workspaceId or userId)
 * @returns {Promise<Array>} - Array of tags
 */
module.exports.updateTags = async (auth) => {
    if (!auth) {
        console.warn("updateTags called without auth");
        return [];
    }
    const createdBy = getSubIDFromAuth(auth);
    try {
        // Fetch tags from DB (assume collection 'taginputs' with field 'workspaceId')
        const tagsCollection = getdb().collection("taginputs");
        const userTags = await tagsCollection.find({ createdBy: createdBy }).toArray();

        // Extract tag names or objects as needed
        const tags = userTags.map(tagDoc => tagDoc.patternRaw || tagDoc);

        // Update in-memory map
        activeTags.set(createdBy, tags);
        console.log('Tags updated from DB:', tags);

        return tags;
    } catch (err) {
        console.error("Failed to fetch tags from DB:", err);
        return [];
    }
};

// /**
//  * Removes a tag for the user from both DB and in-memory map.
//  * @param {string} auth - User identifier
//  * @param {string} tagToDelete - Tag name to delete
//  * @returns {Promise<boolean>}
//  */
// module.exports.deleteTag = async (auth, tagToDelete) => {
//     if (!auth || !tagToDelete) return false;
//     try {
//         const tagsCollection = getdb().collection("tags");
//         await tagsCollection.deleteOne({ workspaceId: String(auth), tagName: tagToDelete });

//         // Update in-memory map
//         const tags = activeTags.get(auth) || [];
//         const updatedTags = tags.filter(tag => tag !== tagToDelete);
//         activeTags.set(auth, updatedTags);

//         console.log(`Tag "${tagToDelete}" deleted for user ${auth}`);
//         return true;
//     } catch (err) {
//         console.error("Failed to delete tag:", err);
//         return false;
//     }
// };