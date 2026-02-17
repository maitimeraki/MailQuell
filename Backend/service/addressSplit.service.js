module.exports.addressSplit = (senderEmail) => {
    try {
        const emailAddresses = new Set();

        // Extract name and email using regex
        const match = senderEmail.match(/^(.*?)\s*<(.+?)>$/);
        if (match) {
            // Add email
            emailAddresses.add(match[2]);
            // Extract and add name parts
            match[1].trim().split(/\s+/).forEach(name => emailAddresses.add(name));
        } else {
            // If no email is found, split entire input into words
            senderEmail.trim().split(/\s+/).forEach(name => emailAddresses.add(name));
        }

        return Array.from(emailAddresses);
    } catch (error) {
        console.log(error);
        return [];
    }
};
