

import express from "express";
import * as campsiteController from "../controllers/campsiteController.mjs";
import { auth, adminOnly } from "../middleware/auth.mjs";

const router = express.Router();


router.get("/", campsiteController.getAllCampsites);
router.get("/available", campsiteController.getAvailableCampsites);
router.get("/:id", campsiteController.getCampsiteById);


router.post("/", auth, adminOnly, campsiteController.createCampsite);
router.put("/:id", auth, adminOnly, campsiteController.updateCampsite);
router.delete("/:id", auth, adminOnly, campsiteController.deleteCampsite);

export default router;