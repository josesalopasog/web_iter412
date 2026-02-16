import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDB = async (): Promise<void> => {
  try {
    // Allow only schema-defined fields in query filters
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};