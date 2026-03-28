import express from "express";
import * as campsiteController from "../controllers/campsiteController.mjs";
import { auth } from "../middleware/auth.mjs";

const router = express.Router();

router.get("/", campsiteController.getAllCampsites);
router.get("/:id", campsiteController.getCampsiteById);
router.post("/", auth, adminOnly, campsiteController.createCampsite);
router.post("/", auth, campsiteController.createCampsite);
router.put("/:id", auth, campsiteController.updateCampsite);
router.delete("/:id", auth, campsiteController.deleteCampsite);

export default router;