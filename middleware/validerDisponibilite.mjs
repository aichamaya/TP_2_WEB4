const TYPES_VALIDES = ["tente", "rv", "chalet", "glamping", "arrière-pays", "autre"];

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
