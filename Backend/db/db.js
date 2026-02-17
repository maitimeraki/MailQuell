const { MongoClient, ObjectId } = require("mongodb");

let db;
const connectdb = async () => {
    try {
        const uri = `${process.env.MONGODB_URL}`;
        if (db) return db; // Return existing connection if already connected
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await client.connect();
        console.log("Database connected");
        db = client.db("mailquell");
        return db;
    } catch (e) {
        throw new Error("Database connection failed", e.message);
    }
};

const getdb = () => {  // If you provide db argument then it shows error if you didn't provide parameter during call but would be better no arguments
    if (!db) throw new Error("Database not connected");
    return db;
}

module.exports = { connectdb, getdb, ObjectId };
