let activeTags = new Map();
module.exports.activeTags = activeTags;
module.exports.updateTags = (auth, newTags) => {
    if (auth && Array.isArray(newTags)) {
        activeTags.set(auth, newTags);
        console.log('Tags updated:', newTags);
        return true;
    }
    return false;
};