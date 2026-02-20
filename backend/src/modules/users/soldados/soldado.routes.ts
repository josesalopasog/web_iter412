import { Router } from "express";
import { createSoldadoFromForm } from "./soldado.controller.js";

const router = Router();

router.post("/", createSoldadoFromForm);

export default router;