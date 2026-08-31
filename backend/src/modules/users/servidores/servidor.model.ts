import mongoose, { Schema } from "mongoose";
import { USER_ROLES } from "../roles.js";

export type ServidorDoc = mongoose.InferSchemaType<typeof ServidorSchema>;

const ServidorSchema = new Schema(
  {
    registrationNumber: { type: Number, required: true, unique: true },

    role: { type: String, enum: USER_ROLES, required: true, default: "SERVIDOR" },
    gender: { type: String, enum: ["Mujer", "Hombre"], required: true },

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
    merchSize: { type: String, default: "" },
    merchSizeOther: { type: String, trim: true, default: "" },

    emergencyFirstName: { type: String, required: true, trim: true },
    emergencyLastName: { type: String, required: true, trim: true },
    emergencyDocumentType: { type: String, required: true },
    emergencyDocumentTypeOther: { type: String, trim: true, default: "" },
    emergencyDocumentNumber: { type: String, required: true, trim: true },
    emergencyPhone: { type: String, required: true, trim: true },
    emergencyRelation: { type: String, required: true, trim: true },
    emergencyEmail: { type: String, required: true, lowercase: true, trim: true },
    emergencyAddress: { type: String, required: true, trim: true },

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