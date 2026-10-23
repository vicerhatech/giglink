import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to start the API.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.info("MongoDB connected");
}
