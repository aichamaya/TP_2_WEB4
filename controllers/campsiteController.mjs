import Campsite from "../models/campsite.mjs";
import Reservation from "../models/reservation.mjs";

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
