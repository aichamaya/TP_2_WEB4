
import User from "../models/user.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export async function register(req, res) {
  const { firstName, lastName, email, phone, password, role } = req.body;

  try {
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
    });

    res.location(`/api/auth/${newUser._id}`);

    res.status(201).json({
      status: 201,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Utilisateur créé",
      data: {
        user: {
          _id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Erreur lors de la création de l'utilisateur",
      error: err.message,
    });
  }
}
export async function login(req, res) {
  const { email, password } = req.body;

  // Champs absents
  if (email === undefined || password === undefined) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Email et mot de passe sont requis",
    });
  }

  // Champs vides
  if (email.trim() === "" || password.trim() === "") {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Email et mot de passe ne doivent pas être vides",
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Identifiants invalides",
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Identifiants invalides",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Connexion réussie",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: "InternalServerError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Erreur lors de la connexion",
    });
  }
}


export async function consulterProfil(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Utilisateur introuvable",
      });
    }

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Profil récupéré",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: "InternalServerError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Erreur lors de la récupération du profil",
    });
  }
}

export async function modifierProfil(req, res) {
  const { firstName, lastName, phone, role } = req.body;

  // Champs absents
  if (
    firstName === undefined ||
    lastName === undefined ||
    phone === undefined ||
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

  // Champs vides
  if (
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    phone.trim() === "" ||
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

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        firstName,
        lastName,
        phone,
        role,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Utilisateur introuvable",
      });
    }

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Profil modifié",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: "InternalServerError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Erreur lors de la modification du profil",
    });
  }
}
export async function modifierMotDePasse(req, res) {
  const { currentPassword, newPassword } = req.body;

  // Champs absents
  if (currentPassword === undefined || newPassword === undefined) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Tous les champs sont requis",
    });
  }

  try {
    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Utilisateur introuvable",
      });
    }

    const regexMotDePasse =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    // Champs vides
    if (currentPassword.trim() === "" || newPassword.trim() === "") {
      return res.status(422).json({
        status: 422,
        error: "ValidationError",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Les champs ne doivent pas être vides",
      });
    }

    // Nouveau mot de passe invalide
    if (!regexMotDePasse.test(newPassword)) {
      return res.status(422).json({
        status: 422,
        error: "ValidationError",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Le nouveau mot de passe est invalide",
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        error: "Unauthorized",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Mot de passe actuel invalide",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Mot de passe modifié",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: "InternalServerError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Erreur lors de la modification du mot de passe",
    });
  }
}