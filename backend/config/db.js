const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // DEBUG (VERY IMPORTANT)
    console.log("MONGO_URI =", JSON.stringify(process.env.MONGO_URI));

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check .env loading.");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;