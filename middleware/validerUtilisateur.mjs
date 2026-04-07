import User from "../models/user.mjs";

const REGEX_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const regexCourriel = new RegExp(
  /^(?<localPart>(?<dotString>[0-9a-z!#$%&'*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+(\.[0-9a-z!#$%&'*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+)*)|(?<quotedString>"([\x20-\x21\x23-\x5B\x5D-\x7E\u{80}-\u{10FFFF}]|\\[\x20-\x7E])*"))(?<!.{64,})@(?<domainOrAddressLiteral>(?<addressLiteral>\[((?<IPv4>\d{1,3}(\.\d{1,3}){3})|(?<IPv6Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){7})|(?<IPv6Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?)|(?<IPv6v4Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){5}:\d{1,3}(\.\d{1,3}){3})|(?<IPv6v4Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3}:)?\d{1,3}(\.\d{1,3}){3})|(?<generalAddressLiteral>[a-z0-9-]*[[a-z0-9]:[\x21-\x5A\x5E-\x7E]+))\])|(?<Domain>(?!.{256,})(([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))(\.([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))*))$/iu
);
/**
 * Middleware de validation des données d'inscription d'un utilisateur.
 * Vérifie la présence et la validité de tous les champs requis : firstName, lastName,
 * email, phone, password et role. Valide le format de l'email et la complexité du mot de passe.
 * Vérifie également que l'email n'est pas déjà utilisé dans la base de données.
 *
 * @async
 * @param {import('express').Request} req - La requête HTTP avec les données utilisateur dans `req.body`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {Promise<void>} Passe au middleware suivant si valide, ou retourne une réponse 400/409/422 si invalide
 */
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

  if (!regexCourriel.test(email)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Email invalide",
    });
  }

  if (!REGEX_MOT_DE_PASSE.test(password)) {
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

/**
 * Middleware de validation des données de connexion.
 * Vérifie que l'email et le mot de passe sont présents et non vides.
 *
 * @param {import('express').Request} req - La requête HTTP avec `req.body.email` et `req.body.password`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 400/422 si invalide
 */
export function validerLogin(req, res, next) {
  const { email, password } = req.body;

  if (email === undefined || password === undefined) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Email et mot de passe sont requis",
    });
  }

  if (email.trim() === "" || password.trim() === "") {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Email et mot de passe ne doivent pas être vides",
    });
  }

  next();
}

/**
 * Middleware de validation des données de modification du profil utilisateur.
 * Vérifie que les champs firstName, lastName, phone et role sont présents et non vides.
 *
 * @param {import('express').Request} req - La requête HTTP avec dans `req.body` :
 *   `firstName`, `lastName`, `phone`, `role`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 400/422 si invalide
 */
export function validerProfil(req, res, next) {
  const { firstName, lastName, phone, role } = req.body;

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

  next();
}

/**
 * Middleware de validation des données de changement de mot de passe.
 * Vérifie que `currentPassword` et `newPassword` sont présents et non vides.
 * Valide également la complexité du nouveau mot de passe (min. 8 caractères,
 * majuscule, minuscule, chiffre et caractère spécial).
 *
 * @param {import('express').Request} req - La requête HTTP avec `req.body.currentPassword` et `req.body.newPassword`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 400/422 si invalide
 */
export function validerMotDePasse(req, res, next) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Tous les champs sont requis",
    });
  }

  if (currentPassword.trim() === "" || newPassword.trim() === "") {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Les champs ne doivent pas être vides",
    });
  }

  if (!REGEX_MOT_DE_PASSE.test(newPassword)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Le nouveau mot de passe est invalide",
    });
  }

  next();
}
