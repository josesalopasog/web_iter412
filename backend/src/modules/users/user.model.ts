import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "./user.types.js";

const UserSchema = new Schema(
    {
        //Auth 
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: USER_ROLES, required: true, default: "SOLDADO" },

        //Form
        firstNames: { type: String, required: true, trim: true },
        lastNames: { type: String, required: true, trim: true },
        preferredName: { type: String, required: true, trim: true },

    },
    { timestamps: true }
);

// Helpers

UserSchema.methods.comparePassword = async function (plain: string) {
    return bcrypt.compare(plain, this.passwordHash);
};

export const User = mongoose.model("User", UserSchema);