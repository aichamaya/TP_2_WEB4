import Reservation from "../models/reservation.mjs";
import Campsite from "../models/campsite.mjs";

const STATUTS_VALIDES = ["pending", "confirmed", "cancelled"];

export async function createReservation(req, res, next) {
  const { campsite, startDate, endDate, guests } = req.body;

  try {
    const existingCampsite = await Campsite.findById(campsite);

    if (!existingCampsite) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Campsite introuvable",
      });
    }

    if (guests > existingCampsite.capacity) {
      return res.status(400).json({
        status: 400,
        error: "BadRequest",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Le nombre de personnes dépasse la capacité du campsite",
      });
    }

    const conflit = await Reservation.findOne({
      campsite,
      status: { $in: ["pending", "confirmed"] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });

    if (conflit) {
      return res.status(409).json({
        status: 409,
        error: "Conflict",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Ce campsite est déjà réservé pour cette période",
      });
    }

    const nbNuits = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = nbNuits * existingCampsite.pricePerNight;

    const reservation = await Reservation.create({
      campsite,
      user: req.user.userId,
      startDate,
      endDate,
      guests,
      totalPrice,
      status: "pending",
    });

    res.location(`/api/reservations/${reservation._id}`);

    return res.status(201).json({
      status: 201,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Réservation créée",
      data: reservation,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllReservations(req, res, next) {
  const { status } = req.query;

  if (status && !STATUTS_VALIDES.includes(status)) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Statut invalide",
    });
  }

  try {
    const filtre = {};
    if (status) filtre.status = status;

    const reservations = await Reservation.find(filtre);

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Liste des réservations",
      data: reservations,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReservationById(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Réservation introuvable",
      });
    }

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Réservation trouvée",
      data: reservation,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateReservation(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Réservation introuvable",
      });
    }

    if (req.user.role !== "admin" && reservation.user.toString() !== req.user.userId) 
       {
        return res.status(403).json({
          status: 403,
          error: "Forbidden",
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
          message: "Accès refusé",
        });
      }

      if (reservation.status !== "pending") {
        return res.status(403).json({
          status: 403,
          error: "Forbidden",
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
          message: "Cette réservation  ne peut pas être modifiée",
        });
      }
    

    const { startDate, endDate, guests, campsite } = req.body;

    const campsiteId = campsite || reservation.campsite;
    const existingCampsite = await Campsite.findById(campsiteId);

    if (!existingCampsite) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Campsite introuvable",
      });
    }

    if (guests > existingCampsite.capacity) {
      return res.status(422).json({
        status: 422,
        error: "ValidationError",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Le nombre de personnes dépasse la capacité du campsite",
      });
    }

    const conflit = await Reservation.findOne({
      _id: { $ne: reservation._id },
      campsite: campsiteId,
      status: { $in: ["pending", "confirmed"] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });

    if (conflit) {
      return res.status(409).json({
        status: 409,
        error: "Conflict",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Conflit de réservation pour cette période",
      });
    }

    const nbNuits = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );

    reservation.campsite = campsiteId;
    reservation.startDate = startDate;
    reservation.endDate = endDate;
    reservation.guests = guests;
    reservation.totalPrice = nbNuits * existingCampsite.pricePerNight;

    await reservation.save();

    res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Réservation modifiée",
      data: reservation,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStatutReservation(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: 404,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Réservation introuvable",
      });
    }

    if (req.user.role !== "admin" && reservation.user.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        error: "NotFound",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Réservation introuvable",
      });
    }

    const { status } = req.body;

    if (!status || !STATUTS_VALIDES.includes(status)) {
      return res.status(422).json({
        status: 422,
        error: "ValidationError",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Statut invalide",
      });
    }

    const transitionsInvalides = [
      { from: "confirmed", to: "pending" },
      { from: "cancelled", to: "pending" },
      { from: "cancelled", to: "confirmed" },
    ];

    const estInvalide = transitionsInvalides.some(
      (t) => t.from === reservation.status && t.to === status
    );

    if (estInvalide) {
      return res.status(400).json({
        status: 400,
        error: "BadRequest",
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        message: "Changement de statut invalide",
      });
    }

    reservation.status = status;
    await reservation.save();

    return res.status(200).json({
      status: 200,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      message: "Statut de la réservation modifié",
      data: reservation,
    });
  } catch (err) {
    next(err);
  }
}
