
// import express from "express";
// import * as userControllers from "../controllers/userControllers.mjs";
// import { validateUtilisateur } from "../middleware/validerUtilisateur.mjs";
// import { auth } from "../middleware/auth.mjs";

// const router = express.Router();

// router.post("/register", validateUtilisateur, userControllers.register);
// router.post("/login", userControllers.login);
// router.get("/profile", auth, userControllers.consulterProfil);

// export default router;
import express from "express";
import * as userControllers from "../controllers/userControllers.mjs";
import { validateUtilisateur } from "../middleware/validerUtilisateur.mjs";
import { auth } from "../middleware/auth.mjs";

const router = express.Router();

router.post("/register", validateUtilisateur, userControllers.register);
router.post("/login", userControllers.login);

router.get("/profile", auth, userControllers.consulterProfil);
router.put("/profile", auth, userControllers.modifierProfil);
router.patch("/password", auth, userControllers.modifierMotDePasse);

export default router;