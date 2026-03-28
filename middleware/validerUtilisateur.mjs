import User from "../models/user.mjs";

export const validateUtilisateur = async (req, res, next) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  // Champs absents
  if (
    firstName === undefined ||
    lastName === undefined ||
    email === undefined ||
    phone === undefined ||
    password === undefined ||
    role === undefined
  ) {
    return res.status(400).json({
      message: "Tous les champs sont requis",
    });
  }

  // Champs vides
  if (
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    email.trim() === "" ||
    phone.trim() === "" ||
    password.trim() === "" ||
    role.trim() === ""
  ) {
    return res.status(422).json({
      message: "Les champs ne doivent pas être vides",
    });
  }

  // Email invalide
  if (!email.includes("@")) {
    return res.status(422).json({
      message: "Email invalide",
    });
  }

  // Mot de passe invalide
  const regexMotDePasse =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!regexMotDePasse.test(password)) {
    return res.status(422).json({
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email déjà utilisé",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      message: "Erreur validation utilisateur",
      error: err.message,
    });
  }
};