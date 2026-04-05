import express from "express";
import * as userControllers from "../controllers/userControllers.mjs";
import { validateUtilisateur, validerLogin, validerProfil, validerMotDePasse } from "../middleware/validerUtilisateur.mjs";
import { auth } from "../middleware/auth.mjs";

const router = express.Router();

router.post("/register", validateUtilisateur, userControllers.register);
router.post("/login", validerLogin, userControllers.login);

router.get("/profile", auth, userControllers.consulterProfil);
router.put("/profile", auth, validerProfil, userControllers.modifierProfil);

router.patch("/password", auth, validerMotDePasse, userControllers.modifierMotDePasse);

export default router;
