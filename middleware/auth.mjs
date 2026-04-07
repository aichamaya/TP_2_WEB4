import jwt from "jsonwebtoken";

/**
 * Middleware d'authentification JWT.
 * Vérifie la présence et la validité du token Bearer dans le header Authorization.
 * Si le token est valide, les informations décodées (userId, role) sont attachées à `req.user`.
 *
 * @param {import('express').Request} req - La requête HTTP avec le header `Authorization: Bearer <token>`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si authentifié, ou retourne une réponse 401 si non authentifié
 */
export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: 401,
      error: "Unauthorized",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Non authentifié",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      error: "Unauthorized",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Token invalide",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      error: "Unauthorized",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Token invalide",
    });
  }
};

/**
 * Middleware de restriction aux administrateurs.
 * Doit être utilisé après le middleware `auth`.
 * Refuse l'accès si l'utilisateur authentifié n'a pas le rôle "admin".
 *
 * @param {import('express').Request} req - La requête HTTP avec `req.user.role` défini par le middleware `auth`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si administrateur, ou retourne une réponse 403 si accès refusé
 */
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: 403,
      error: "Forbidden",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Accès refusé",
    });
  }

  next();
};