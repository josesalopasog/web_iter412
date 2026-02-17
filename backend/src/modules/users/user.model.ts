import mongoose, { Schema } from "mongoose";
import { USER_ROLES } from "./user.types.js";

const UserSchema = new Schema(
    {
        //Auth 
        gender: { type: String, required: true },

        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        role: { type: String, enum: USER_ROLES, required: true, default: "SOLDADO" },

        firstNames: { type: String, required: true, trim: true },
        lastNames: { type: String, required: true, trim: true },
        preferredName: { type: String, required: true, trim: true },

        documentType: { type: String, required: true },
        documentTypeOther: { type: String, default: "", trim: true },
        documentNumber: { type: String, required: true, trim: true },

        age: { type: Number, required: true, min: 1 },
        birthDate: { type: String, required: true },

        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        neighborhood: { type: String, required: true, trim: true },

        phone: { type: String, required: true, trim: true },

        eps: { type: String, required: true, trim: true },
        bloodType: { type: String, required: true, trim: true },

        practicesReligion: { type: String, required: true, enum: ["SI", "NO"] },
        whichReligion: { type: String, default: "", trim: true },

        occupation: { type: String, required: true },
        occupationOther: { type: String, default: "", trim: true },
        occupationPlace: { type: String, required: true, trim: true },

        sacraments: { type: [String], required: true, default: [] },

        restrictions: { type: [String], required: true, default: [] },
        restrictionsOther: { type: String, default: "", trim: true },
        medicationsDetail: { type: String, default: "", trim: true },

        shirtSize: { type: String, required: true },
        shirtSizeOther: { type: String, default: "", trim: true },

        isSurprise: { type: String, required: true, enum: ["SI", "NO"] },

        emergencyName: { type: String, required: true, trim: true },
        emergencyPhone: { type: String, required: true, trim: true },
        emergencyRelation: { type: String, required: true, trim: true },
        emergencyEmail: { type: String, required: true, lowercase: true, trim: true },

        hearAbout: { type: String, required: true },
        hearAboutOther: { type: String, default: "", trim: true },

        invitedByCommunity: { type: String, required: true, enum: ["SI", "NO"] },
        invitedByName: { type: String, default: "", trim: true },

        acceptTerms: { type: Boolean, required: true },
        acceptDataPolicy: { type: Boolean, required: true },
    },
    { timestamps: true }
);


export const User = mongoose.model("User", UserSchema);