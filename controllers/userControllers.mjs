import User from "../models/user.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function register(req, res, next) {
  const { firstName, lastName, email, phone, password, role } = req.body;

  try {
    const newUser = await User.create({ firstName, lastName, email, phone, password, role });

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
    next(err);
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;

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
      { userId: user._id, role: user.role },
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
    next(err);
  }
}

export async function consulterProfil(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);

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
    next(err);
  }
}

export async function modifierProfil(req, res, next) {
  const { firstName, lastName, phone, role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, phone, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Utilisateur introuvable",
      });
    }

    return res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Profil modifié",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function modifierMotDePasse(req, res, next) {
  const { currentPassword, newPassword } = req.body;

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
    next(err);
  }
}
