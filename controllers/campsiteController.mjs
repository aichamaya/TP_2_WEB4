import Campsite from "../models/campsite.mjs";
import Reservation from "../models/reservation.mjs";

/**
 * Crée un nouveau campsite.
 * Vérifie si un campsite avec le même nom existe déjà avant de le créer.
 *
 * @async
 * @param {import('express').Request} req - La requête HTTP contenant les données du campsite dans `req.body`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {Promise<void>} Réponse 201 avec le campsite créé, ou 409 si un conflit existe
 */
export async function createCampsite(req, res, next) {
  const { name, location, description, type, pricePerNight, maxVehicleLength, capacity, amenities } = req.body;

  try {
    const campsiteExistant = await Campsite.findOne({ name });

    if (campsiteExistant) {
      return res.status(409).json({
        status: 409,
        error: "Conflict",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Ce campsite existe déjà",
      });
    }

    const campsite = await Campsite.create({
      name,
      location,
      description,
      type,
      pricePerNight,
      maxVehicleLength,
      capacity,
      amenities,
    });

    res.location(`/api/campsites/${campsite._id}`);

    return res.status(201).json({
      status: 201,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Campsite créé",
      data: {
        _id: campsite._id,
        name: campsite.name,
        location: campsite.location,
        description: campsite.description,
        type: campsite.type,
        pricePerNight: campsite.pricePerNight,
        maxVehiculeLength: campsite.maxVehicleLength,
        capacity: campsite.capacity,
        amenities: campsite.amenities,
        createdAt: campsite.createdAt,
        updatedAt: campsite.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Récupère la liste de tous les campsites.
 * Supporte un filtre optionnel par type via le paramètre de requête `type`.
 *
 * @async
 * @param {import('express').Request} req - La requête HTTP avec `req.query.type` optionnel
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {Promise<void>} Réponse 200 avec la liste des campsites
 */
export async function getAllCampsites(req, res, next) {
  const { type } = req.query;

  try {
    const filtre = {};
    if (type) {filtre.type = type};

    const campsites = await Campsite.find(filtre);

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Liste des campsites",
      data: campsites,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Récupère les campsites disponibles pour une période donnée.
 * Exclut les campsites ayant des réservations actives (pending ou confirmed) qui chevauchent la période.
 * Supporte des filtres optionnels par type, nombre de personnes et longueur de véhicule.
 *
 * @async
 * @param {import('express').Request} req - La requête HTTP avec les paramètres de requête :
 *   `startDate`, `endDate`, `type` (optionnel), `guests` (optionnel), `vehicleLength` (optionnel)
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {Promise<void>} Réponse 200 avec la liste des campsites disponibles
 */
export async function getAvailableCampsites(req, res, next) {
  const { startDate, endDate, type, guests, vehicleLength } = req.query;

  try {
    const reservations = await Reservation.find({
      status: { $in: ["pending", "confirmed"] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });

    const campsiteIdsIndisponibles = reservations.map((r) => r.campsite);

    const filtre = { _id: { $nin: campsiteIdsIndisponibles } };

    if (type) filtre.type = type;
    if (guests) filtre.capacity = { $gte: Number(guests) };
    if (vehicleLength) filtre.maxVehicleLength = { $gte: Number(vehicleLength) };

    const campsites = await Campsite.find(filtre);

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Campsites disponibles",
      data: campsites,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Récupère un campsite par son identifiant.
 *
 * @async
 * @param {import('express').Request} req - La requête HTTP avec `req.params.id` comme identifiant du campsite
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {Promise<void>} Réponse 200 avec le campsite trouvé, ou 404 si introuvable
 */
export async function getCampsiteById(req, res, next) {
  try {
    const campsite = await Campsite.findById(req.params.id);

    if (!campsite) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Campsite introuvable",
      });
    }

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Campsite trouvé",
      data: campsite,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Met à jour les informations d'un campsite existant.
 * Vérifie qu'un autre campsite avec le même nom n'existe pas déjà.
 *
 * @async
 * @param {import('express').Request} req - La requête HTTP avec `req.params.id` et les nouvelles données dans `req.body`
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {Promise<void>} Réponse 200 avec le campsite modifié, 404 si introuvable, ou 409 si conflit de nom
 */
export async function updateCampsite(req, res, next) {
  const { name, location, description, type, pricePerNight, maxVehicleLength, capacity, amenities } = req.body;

  try {
    const campsiteExistant = await Campsite.findOne({ name, _id: { $ne: req.params.id } });

    if (campsiteExistant) {
      return res.status(409).json({
        status: 409,
        error: "Conflict",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Ce campsite existe déjà",
      });
    }

    const campsite = await Campsite.findByIdAndUpdate(
      req.params.id,
      { name, location, description, type, pricePerNight, maxVehicleLength, capacity, amenities },
      { new: true, runValidators: true }
    );

    if (!campsite) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Campsite introuvable",
      });
    }

    return res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Campsite modifié",
      data: {
        _id: campsite._id,
        name: campsite.name,
        location: campsite.location,
        description: campsite.description,
        type: campsite.type,
        pricePerNight: campsite.pricePerNight,
        maxVehiculeLength: campsite.maxVehicleLength,
        capacity: campsite.capacity,
        amenities: campsite.amenities,
        createdAt: campsite.createdAt,
        updatedAt: campsite.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Supprime un campsite par son identifiant.
 * Refuse la suppression si le campsite possède des réservations actives (pending ou confirmed).
 *
 * @async
 * @param {import('express').Request} req - La requête HTTP avec `req.params.id` comme identifiant du campsite
 * @param {import('express').Response} res - La réponse HTTP
 * @param {import('express').NextFunction} next - La fonction middleware suivante
 * @returns {Promise<void>} Réponse 204 si supprimé avec succès, ou 409 si des réservations actives existent
 */
export async function deleteCampsite(req, res, next) {
  try {
    const reservationActive = await Reservation.findOne({
      campsite: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (reservationActive) {
      return res.status(409).json({
        status: 409,
        error: "Conflict",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Impossible de supprimer ce campsite car il a une réservation active",
      });
    }

    await Campsite.findByIdAndDelete(req.params.id);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
