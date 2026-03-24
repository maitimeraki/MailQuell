
const { compressAndEncryptOfBody, decryptAndDecompressOfBody } = require('../../utils/CompressMail'); // Adjust path

// const testMessages = [
//     "I’ll trace how the encrypted buffer is produced and consumed in your test so we can pinpoint why AES-GCM authentication fails in this path. I found the likely fault line in the decryption helper and I’m now checking one real call site to confirm the same buffer-shape issue would trigger this exact auth error. I confirmed another risk: your schema stores body as string, while encryption returns a binary buffer,",
//     "Your OTP code is 123456. Do not share it.",
//     "Meeting scheduled for tomorrow at 10 AM regarding the project.",
//     "The secret password for the vault is 'Blue-Monkey-99'.",
//     "<html><body><h1>Invoice #9921</h1><p>Amount due: $50.00</p></body></html>"
// ];

// testMessages.forEach((msg, i) => {
//     const encrypted = compressAndEncryptOfBody(msg);
//     console.log(`Payload ${i+1}:`, encrypted);
// });

// testMessages.forEach((msg, i) => {
//     const encrypted = compressAndEncryptOfBody(msg);
//     const decrypted = decryptAndDecompressOfBody(encrypted);
//     console.log(`Decrypted Payload ${i+1}:`, decrypted);
// });

describe('Email Security Utilities', () => {
    const rawText = "This is a highly sensitive email body with $249.99 invoice.";

    test('should encrypt and decrypt back to original text', () => {
        // 1. Encrypt
        const encrypted = compressAndEncryptOfBody(rawText);
        expect(typeof encrypted).toBe('string'); // Expecting Base64 string

        // 2. Decrypt
        const decrypted = decryptAndDecompressOfBody(encrypted);
        
        // 3. Assert
        expect(decrypted).toBe(rawText);
    });

    test('should return error message for corrupted data', () => {
        const corruptedData = "not-a-valid-base64-string!!!";
        const result = decryptAndDecompressOfBody(corruptedData);
         expect(result).toContain("Corrupted");
    });
});