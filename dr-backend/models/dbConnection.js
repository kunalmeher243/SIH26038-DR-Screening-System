import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/retinatrack_db";

export async function connectToMongoDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected successfully to: ${MONGO_URI}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    throw err;
  }
}

export default connectToMongoDB;
