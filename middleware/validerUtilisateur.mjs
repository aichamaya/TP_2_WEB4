import User from "../models/user.mjs";

export const validateUtilisateur = async (req, res, next) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  // si mes Champs sont absents
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

  if (
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    email.trim() === "" ||
    phone.trim() === "" ||
    password.trim() === ""
  ) {
    return res.status(422).json({
      message: "Les champs ne doivent pas être vides",
    });
  }

 
  if (!email.includes("@")) {
    return res.status(422).json({
      message: "Email invalide",
    });
  }

  if (password.length < 8) {
    return res.status(422).json({
      message: "Mot de passe invalide",
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