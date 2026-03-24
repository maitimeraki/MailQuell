module.exports.getMailBody = (payload) => {
    let body = "";
    
    // 1. If the message is simple (not multipart)
    if (payload.body && payload.body.data) {
        body = payload.body.data;
    } 
    // 2. If the message is multipart, look through the parts
    else if (payload.parts) {
        // We prefer plain text, but you could change this to 'text/html'
        const part = payload.parts.find(p => p.mimeType === 'text/plain') || payload.parts[0];
        if (part.body && part.body.data) {
            body = part.body.data;
        } else if (part.parts) {
            // Sometimes parts are nested deeper
            return getMailBody(part);
        }
    }

    // Gmail uses Base64URL, so we must decode it correctly(gievs me base64 string to raw string)
    return Buffer.from(body, 'base64').toString('utf-8').slice(0, 600); // Limit to first 600 chars for safety
};