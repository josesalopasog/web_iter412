import { Router } from "express";
import soldadoRoutes from "./soldados/soldado.routes.js";
import servidorRoutes from "./servidores/servidor.routes.js";
import eliminadoRoutes from "./eliminados/eliminado.routes.js";

const router = Router();

// POST /api/users/soldados
router.use("/soldados", soldadoRoutes);

// POST /api/users/servidores
router.use("/servidores", servidorRoutes);

// GET /api/users/eliminados
router.use("/eliminados", eliminadoRoutes);

export default router;