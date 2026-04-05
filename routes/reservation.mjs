import express from "express";
import * as reservationController from "../controllers/reservationController.mjs";
import { auth } from "../middleware/auth.mjs";
import { validerReservation, validerModificationReservation } from "../middleware/validerReservation.js";

const router = express.Router();

router.get("/", auth, reservationController.getAllReservations);
router.get("/:id", auth, reservationController.getReservationById);

router.post("/", auth, validerReservation, reservationController.createReservation);
router.put("/:id", auth, validerModificationReservation, reservationController.updateReservation);

router.patch("/:id", auth, reservationController.updateStatutReservation);

export default router;
