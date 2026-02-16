import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { User } from "./user.model.js";
import { CreateUserFromFormDTO } from "./user.types.js";

import bcrypt from "bcryptjs";

const requireFields = (body: any, fields: string[]) => {
    const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
    if (missing.length) throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
};

export const createUserFromForm = asyncHandler(async (req, res) => {
    const body = req.body as Partial<CreateUserFromFormDTO>;

    requireFields(body, [
        "password",
        "email",
        "firstNames",
        "lastNames",
        "preferredName"
    ]);

    const existing = await User.findOne({ email: body.email?.toLowerCase() });
    if (existing) throw new ApiError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(String(body.password), 12);

    const user = await User.create({
        email: String(body.email).toLowerCase(),
        passwordHash,

        // por defecto SOLDADO, luego un admin lo cambia
        role: "SOLDADO",

        firstNames: body.firstNames,
        lastNames: body.lastNames,
        preferredName: body.preferredName,
    });

    res.status(201).json({
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    });
});