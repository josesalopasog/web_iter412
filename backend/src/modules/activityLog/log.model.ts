import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

export const Log = mongoose.model("Log", logSchema, "logs");
