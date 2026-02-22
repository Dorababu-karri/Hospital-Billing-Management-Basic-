const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
    if (connected) {
        return mongoose.connection;
    }

    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/billing";
    if (!mongoUri) {
        throw new Error("MONGO_URI is not configured. Set it in the .env file.");
    }

    await mongoose.connect(mongoUri);
    connected = true;
    console.log("MongoDB connected");

    return mongoose.connection;
}

module.exports = connectDB;
