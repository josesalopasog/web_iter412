import mongoose, { Schema } from "mongoose";

// Calificación de una reunión: cada servidor califica una vez cada reunión (la puede cambiar).
const RatingSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { timestamps: true, collection: "ratings" }
);

RatingSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", RatingSchema);
