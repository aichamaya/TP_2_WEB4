const TYPES_VALIDES = ["tente", "rv", "chalet", "glamping", "arrière-pays", "autre"];

/**
 * Middleware de validation des paramètres de recherche de disponibilité.
 * Vérifie que les dates `startDate` et `endDate` sont présentes et non vides.
 * Valide également le filtre `type` s'il est fourni.
 *
 * @param {import('express').Request} req - La requête HTTP avec les paramètres de requête :
 *   `startDate` (requis), `endDate` (requis), `type` (optionnel)
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {void} Passe au middleware suivant si valide, ou retourne une réponse 400/422 si invalide
 */
export function validerDisponibilite(req, res, next) {
  const { startDate, endDate, type } = req.query;

  if (startDate === undefined || endDate === undefined) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Les dates sont obligatoires",
    });
  }

  if (startDate.trim() === "" || endDate.trim() === "") {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Les dates ne doivent pas être vides",
    });
  }

  if (type && !TYPES_VALIDES.includes(type)) {
    return res.status(400).json({
      status: 400,
      error: "BadRequest",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Type invalide",
    });
  }

  next();
}
