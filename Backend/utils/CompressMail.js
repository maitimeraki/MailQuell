const zlib = require('zlib');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

// It must be exactly 32 characters for AES-256.
console.log("Master key length check (should be 32):", process.env.ENCRYPTED_KEY ? process.env.ENCRYPTED_KEY.length : "No key found");
// const MASTER_KEY = Buffer.from(process.env.ENCRYPTED_KEY, 'utf8');
const MASTER_KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTED_KEY)).digest();  
const ALGORITHM = 'aes-256-gcm';

/**
 * FULL PIPELINE: Compress -> Encrypt
 */
function compressAndEncryptOfBody(data) {
    // 1. COMPRESS
    const compressed = zlib.brotliCompressSync(Buffer.from(data, 'utf8'));

    // 2. ENCRYPT
    const iv = crypto.randomBytes(12); // GCM standard IV length
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
    const authTag = cipher.getAuthTag(); // Required for GCM to prevent tampering

    // 3. PACKAGE (Return as a single Buffer to store in one DB column)
    // Format: [IV (12 bytes)][AuthTag (16 bytes)][EncryptedData (rest)]
    return Buffer.concat([iv, authTag, encrypted]).toString('base64'); // Store as base64 string for safe transport/storage
};

function decryptAndDecompressOfBody(combinedBuffer) {
    const actualBuffer = Buffer.isBuffer(combinedBuffer) ? combinedBuffer : Buffer.from(combinedBuffer, 'base64');
    // const actualBuffer = Buffer.from(combinedBuffer.buffer || combinedBuffer);
    if (actualBuffer.length < 28) return "[Corrupted Data]";
    // 1. EXTRACT pieces from the buffer
    const iv = actualBuffer.subarray(0, 12);
    const authTag = actualBuffer.subarray(12, 28);
    const encryptedData = actualBuffer.subarray(28);

    // 2. DECRYPT
    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
    decipher.setAuthTag(authTag);

    const decompressed = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);
    // 3. DECOMPRESS
    return zlib.brotliDecompressSync(decompressed).toString('utf8');
};

module.exports = {
    compressAndEncryptOfBody,
    decryptAndDecompressOfBody
};