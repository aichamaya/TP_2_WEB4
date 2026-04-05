const TYPES_VALIDES = ["tente", "rv", "chalet", "glamping", "arrière-pays", "autre"];

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
