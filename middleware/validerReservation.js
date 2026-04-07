/**
 * Middleware de validation des données de création d'une réservation.
 * Vérifie la présence et la validité des champs : campsite, startDate, endDate et guests.
 * S'assure que le nombre de personnes est au moins 1 et que la date de début est avant la date de fin.
 *
 * @param {import('express').Request} req - La requête HTTP avec dans `req.body` :
 *   `campsite`, `startDate`, `endDate`, `guests`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 400/422 si invalide
 */
export function validerReservation(req, res, next) {
  const { campsite, startDate, endDate, guests } = req.body;

  if (
    campsite === undefined ||
    startDate === undefined ||
    endDate === undefined ||
    guests === undefined
  ) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Tous les champs requis sont obligatoires",
    });
  }

  if (String(campsite).trim() === "" || String(startDate).trim() === "" || String(endDate).trim() === "") {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Les champs ne doivent pas être vides",
    });
  }

  if (guests < 1) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Le nombre de personnes doit être au moins 1",
    });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "La date de début doit être avant la date de fin",
    });
  }

  next();
}

/**
 * Middleware de validation des données de modification d'une réservation.
 * Vérifie la présence et la validité des champs : startDate, endDate et guests.
 * S'assure que le nombre de personnes est au moins 1 et que la date de début est avant la date de fin.
 *
 * @param {import('express').Request} req - La requête HTTP avec dans `req.body` :
 *   `startDate`, `endDate`, `guests`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 400/422 si invalide
 */
export function validerModificationReservation(req, res, next) {
  const { startDate, endDate, guests } = req.body;

  if (startDate === undefined || endDate === undefined || guests === undefined) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Tous les champs requis sont obligatoires",
    });
  }

  if (String(startDate).trim() === "" || String(endDate).trim() === "") {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Les champs ne doivent pas être vides",
    });
  }

  if (guests < 1) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Le nombre de personnes doit être au moins 1",
    });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "La date de début doit être avant la date de fin",
    });
  }

  next();
}
