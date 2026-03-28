import express from "express";
import * as reservationController from "../controllers/reservationController.mjs";
import { auth } from "../middleware/auth.mjs";

const router = express.Router();


router.get("/", auth, reservationController.getAllReservations);


router.get("/:id", auth, reservationController.getReservationById);


router.post("/", auth, reservationController.createReservation);


router.put("/:id", auth, reservationController.updateReservation);


router.patch("/:id/confirm", auth, reservationController.confirmReservation);


router.patch("/:id/cancel", auth, reservationController.cancelReservation);

export default router;