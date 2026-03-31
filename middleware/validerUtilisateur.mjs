import User from "../models/user.mjs";

export const validateUtilisateur = async (req, res, next) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  
  if (
    firstName === undefined ||
    lastName === undefined ||
    email === undefined ||
    phone === undefined ||
    password === undefined ||
    role === undefined
  ) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Tous les champs sont requis",
    });
  }


  if (
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    email.trim() === "" ||
    phone.trim() === "" ||
    password.trim() === "" ||
    role.trim() === ""
  ) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Les champs ne doivent pas être vides",
    });
  }

  
  if (!email.includes("@")) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Email invalide",
    });
  }

  
  const regexMotDePasse =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!regexMotDePasse.test(password)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        status: 409,
        error: "Conflict",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Email déjà utilisé",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      status: 500,
      error: "InternalServerError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Erreur validation utilisateur",
    });
  }
};