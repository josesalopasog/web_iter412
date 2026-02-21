import mongoose, { Schema } from "mongoose";

export type ServidorDoc = mongoose.InferSchemaType<typeof ServidorSchema>;

const ServidorSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    firstNames: { type: String, required: true, trim: true },
    lastNames: { type: String, required: true, trim: true },
    preferredName: { type: String, required: true, trim: true },
    referralNamePhone: { type: String, required: true, trim: true },

    documentType: { type: String, required: true },
    documentTypeOther: { type: String, trim: true, default: "" },
    documentNumber: { type: String, required: true, trim: true },

    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    birthDate: { type: String, required: true },
    age: { type: Number, required: true, min: 1 },
    phone: { type: String, required: true, trim: true },

    eps: { type: String, required: true, trim: true },
    bloodType: { type: String, required: true, trim: true },

    needsShirt: { type: String, required: true, enum: ["SI", "NO"] },
    shirtColors: { type: [String], required: true, default: [] }, 
    shirtSize: { type: String, required: true },
    shirtSizeOther: { type: String, trim: true, default: "" },

    merchItems: { type: [String], required: true, default: [] },
    merchSize: { type: String, required: true },
    merchSizeOther: { type: String, trim: true, default: "" },

    emergency1Name: { type: String, required: true, trim: true },
    emergency1Phone: { type: String, required: true, trim: true },
    emergency1Relation: { type: String, required: true, trim: true },
    emergency1Address: { type: String, required: true, trim: true },

    emergency2Name: { type: String, required: true, trim: true },
    emergency2Phone: { type: String, required: true, trim: true },
    emergency2Relation: { type: String, required: true, trim: true },
    emergency2Address: { type: String, required: true, trim: true },

    services: { type: [String], required: true, default: [] },
    lastService: { type: String, required: true },
    serviceLeaderOf: { type: String, required: true, trim: true },

    wentToOtherSedes: { type: String, required: true, enum: ["SI", "NO"] },
    otherSedesDetail: { type: String, trim: true, default: "" },

    formationOther: { type: String, required: true, trim: true },

    acceptTerms: { type: Boolean, required: true },
    acceptDataPolicy: { type: Boolean, required: true },
  },
  { timestamps: true, collection: "servidores" }
);

export const Servidor = mongoose.model("Servidor", ServidorSchema);