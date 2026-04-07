const TYPES_VALIDES = ["tente", "rv", "chalet", "glamping", "arrière-pays", "autre"];

/**
 * Middleware de validation des données d'un campsite.
 * Vérifie la présence et la validité des champs obligatoires : name, location, description,
 * type, pricePerNight et capacity. Pour les campsites de type "rv", la longueur maximale
 * du véhicule est requise et doit être supérieure à 0.
 *
 * @param {import('express').Request} req - La requête HTTP avec les données du campsite dans `req.body`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 400/422 si invalide
 */
export function validerCampsite(req, res, next) {
  const { name, location, description, type, pricePerNight, capacity } = req.body;
  const longueurVehicule = req.body.maxVehiculeLength ?? req.body.maxVehicleLength;

  if (
    name === undefined ||
    location === undefined ||
    description === undefined ||
    type === undefined ||
    pricePerNight === undefined ||
    capacity === undefined
  ) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Tous les champs requis sont obligatoires",
    });
  }

  if (
    name.trim() === "" ||
    location.trim() === "" ||
    description.trim() === "" ||
    type.trim() === ""
  ) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Les champs ne doivent pas être vides",
    });
  }

  if (!TYPES_VALIDES.includes(type)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Type invalide",
    });
  }

  if (type === "rv" && longueurVehicule === undefined) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "La longueur maximale du véhicule est obligatoire pour un campsite de type rv",
    });
  }

  if (type === "rv" && longueurVehicule <= 0) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "La longueur maximale du véhicule doit être supérieure à 0",
    });
  }

  if (pricePerNight < 0 || capacity < 1) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Valeurs numériques invalides",
    });
  }
  req.body.maxVehicleLength = longueurVehicule;
  next();
}

/**
 * Middleware de validation du filtre par type dans les paramètres de requête.
 * Si le paramètre `type` est présent, vérifie qu'il appartient à la liste des types valides.
 *
 * @param {import('express').Request} req - La requête HTTP avec `req.query.type` optionnel
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 422 si le type est invalide
 */
export function validerFiltreType(req, res, next) {
  const { type } = req.query;

  if (type && !TYPES_VALIDES.includes(type)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Type invalide",
    });
  }

  next();
}
