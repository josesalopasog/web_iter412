import { Router } from "express";
import { createUserFromForm } from "./user.controller.js";

const router = Router();

//Create a new user from form
router.post("/register", createUserFromForm);

export default router;