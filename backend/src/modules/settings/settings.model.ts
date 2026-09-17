import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    soldadoPrice: { type: Number, required: true, default: 435000, min: 0 },
    servidorPrice: { type: Number, required: true, default: 300000, min: 0 },
    fridayDate: { type: Number, required: true, default: 13, min: 1, max: 31 },
    saturdayDate: { type: Number, required: true, default: 14, min: 1, max: 31 },
    sundayDate: { type: Number, required: true, default: 15, min: 1, max: 31 },
    retreatMonth: { type: Number, required: true, default: 11, min: 1, max: 12 },
    retreatYear: { type: Number, required: true, default: 2026, min: 2000, max: 2100 },
    advanceStartDay: { type: Number, required: true, default: 1, min: 1, max: 31 },
    advanceEndDay: { type: Number, required: true, default: 15, min: 1, max: 31 },
    advanceMonth: { type: Number, required: true, default: 10, min: 1, max: 12 },
    finalPaymentStartDay: { type: Number, required: true, default: 1, min: 1, max: 31 },
    finalPaymentEndDay: { type: Number, required: true, default: 7, min: 1, max: 31 },
    finalPaymentMonth: { type: Number, required: true, default: 11, min: 1, max: 12 },
    subsidyCap: { type: Number, required: true, default: 100000, min: 0 },

    shirtPrice: { type: Number, required: true, default: 27000, min: 0 },
    busoChaquetaPrice: { type: Number, required: true, default: 52000, min: 0 },
    canguroPrice: { type: Number, required: true, default: 29000, min: 0 },
    tulaPrice: { type: Number, required: true, default: 7000, min: 0 },
    cachuchaPrice: { type: Number, required: true, default: 16000, min: 0 },
    extraSizePrice: { type: Number, required: true, default: 4000, min: 0 },
  },
  { timestamps: true, collection: "settings" }
);

export const Settings = mongoose.model("Settings", SettingsSchema);
