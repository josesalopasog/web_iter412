import { Router } from "express";
import soldadoRoutes from "./soldados/soldado.routes.js";
import servidorRoutes from "./servidores/servidor.routes.js";

const router = Router();

// POST /api/users/soldados
router.use("/soldados", soldadoRoutes);

// POST /api/users/servidores
router.use("/servidores", servidorRoutes);

export default router;