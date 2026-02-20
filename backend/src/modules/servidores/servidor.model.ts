import mongoose, { Schema } from "mongoose";

const ServidorSchema = new Schema(
  {
    role: { type: String, default: "SERVIDOR", immutable: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    firstNames: { type: String, required: true, trim: true },
    lastNames: { type: String, required: true, trim: true },

    preferredName: { type: String, required: true, trim: true },
    referralNamePhone: { type: String, required: true, trim: true },

    documentType: { type: String, required: true },
    documentTypeOther: { type: String, required: true, trim: true },
    documentNumber: { type: String, required: true, trim: true },

    city: { type: String, required: true, trim: true },
    birthDate: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    phone: { type: String, required: true, trim: true },

    eps: { type: String, required: true, trim: true },
    bloodType: { type: String, required: true, trim: true },

    needsShirt: { type: String, required: true, enum: ["SI", "NO"] },
    shirtColor: { type: String, required: true, default: "" },
    shirtSize: { type: String, required: true },
    shirtSizeOther: { type: String, required: true, trim: true },

    merchItems: { type: [String], required: true, default: [] },
    merchSize: { type: String, required: true },
    merchSizeOther: { type: String, required: true, trim: true },

    emergency1Name: { type: String, required: true, trim: true },
    emergency1Phone: { type: String, required: true, trim: true },
    emergency1Relation: { type: String, required: true, trim: true },

    emergency2Name: { type: String, required: true, trim: true },
    emergency2Phone: { type: String, required: true, trim: true },
    emergency2Relation: { type: String, required: true, trim: true },

    services: { type: [String], required: true, default: [] },
    lastService: { type: String, required: true },
    serviceLeaderOf: { type: String, required: true, trim: true },

    wentToOtherSedes: { type: String, required: true, enum: ["SI", "NO"] },
    otherSedesDetail: { type: String, required: true, trim: true },

    formationOther: { type: String, required: true, trim: true },

    acceptTerms: { type: String, required: true, enum: ["SI", "NO"] },
    acceptDataPolicy: { type: String, required: true, enum: ["SI", "NO"] },
  },
  { timestamps: true }
);

export const Servidor = mongoose.model("Servidor", ServidorSchema);