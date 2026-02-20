import { Router } from "express";
import { createServidorFromForm } from "./servidor.controller.js";

const router = Router();

router.post("/", createServidorFromForm);

export default router;