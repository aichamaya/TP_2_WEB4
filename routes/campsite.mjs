import express from "express";
import * as campsiteController from "../controllers/campsiteController.mjs";
import { auth, adminOnly } from "../middleware/auth.mjs";
import { validerCampsite, validerFiltreType } from "../middleware/validerCampsite.mjs";
import { validerDisponibilite } from "../middleware/validerDisponibilite.mjs";

const router = express.Router();

router.get("/", validerFiltreType, campsiteController.getAllCampsites);
router.get("/available", validerDisponibilite, campsiteController.getAvailableCampsites);
router.get("/:id", campsiteController.getCampsiteById);

router.post("/", auth, adminOnly, validerCampsite, campsiteController.createCampsite);
router.put("/:id", auth, adminOnly, validerCampsite, campsiteController.updateCampsite);
router.delete("/:id", auth, adminOnly, campsiteController.deleteCampsite);

export default router;
