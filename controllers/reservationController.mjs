import Reservation from "../models/reservation.mjs";
import Campsite from "../models/campsite.mjs";

// Créer une réservation
export async function createReservation(req, res) {
  try {
    const { campsite, startDate, endDate, guests } = req.body;

    const existingCampsite = await Campsite.findById(campsite);

    if (!existingCampsite) {
      return res.status(404).json({
        message: "Campsite introuvable",
      });
    }

    // Vérifier capacité
    if (guests > existingCampsite.capacity) {
      return res.status(422).json({
        message: "Le nombre de personnes dépasse la capacité du campsite",
      });
    }

    // Vérifier chevauchement
    const conflit = await Reservation.findOne({
      campsite,
      status: { $in: ["pending", "confirmed"] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });

    if (conflit) {
      return res.status(409).json({
        message: "Ce campsite est déjà réservé pour cette période",
      });
    }

    
    const dateDebut = new Date(startDate);
    const dateFin = new Date(endDate);
    const differenceMs = dateFin - dateDebut;
    const nbNuits = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

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

    res.status(201).json({
      message: "Réservation créée",
      data: reservation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création de la réservation",
      error: err.message,
    });
  }
}


export async function getAllReservations(req, res) {
  try {
    const reservations = await Reservation.find()
      .populate("campsite")
      .populate("user", "-password");

    res.status(200).json({
      message: "Liste des réservations",
      data: reservations,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
      error: err.message,
    });
  }
}


export async function getReservationById(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("campsite")
      .populate("user", "-password");

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable",
      });
    }

    res.status(200).json({
      message: "Réservation trouvée",
      data: reservation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la réservation",
      error: err.message,
    });
  }
}

export async function updateReservation(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable",
      });
    }

    
    if (req.user.role !== "admin") {
      if (reservation.user.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "Accès refusé",
        });
      }

      if (reservation.status !== "pending") {
        return res.status(403).json({
          message: "Une réservation non pending ne peut pas être modifiée",
        });
      }
    }

    const { startDate, endDate, guests } = req.body;

    const existingCampsite = await Campsite.findById(reservation.campsite);

    if (!existingCampsite) {
      return res.status(404).json({
        message: "Campsite introuvable",
      });
    }

    if (guests > existingCampsite.capacity) {
      return res.status(422).json({
        message: "Le nombre de personnes dépasse la capacité du campsite",
      });
    }

    const conflit = await Reservation.findOne({
      _id: { $ne: reservation._id },
      campsite: reservation.campsite,
      status: { $in: ["pending", "confirmed"] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });

    if (conflit) {
      return res.status(409).json({
        message: "Conflit de réservation pour cette période",
      });
    }

    const dateDebut = new Date(startDate);
    const dateFin = new Date(endDate);
    const differenceMs = dateFin - dateDebut;
    const nbNuits = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    reservation.startDate = startDate;
    reservation.endDate = endDate;
    reservation.guests = guests;
    reservation.totalPrice = nbNuits * existingCampsite.pricePerNight;

    await reservation.save();

    res.status(200).json({
      message: "Réservation modifiée",
      data: reservation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la modification",
      error: err.message,
    });
  }
}


export async function confirmReservation(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable",
      });
    }

    if (req.user.role !== "admin") {
      if (reservation.user.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "Accès refusé",
        });
      }

      if (new Date(reservation.startDate) < new Date()) {
        return res.status(403).json({
          message: "Impossible de confirmer une réservation déjà commencée",
        });
      }
    }

    reservation.status = "confirmed";
    await reservation.save();

    res.status(200).json({
      message: "Réservation confirmée",
      data: reservation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la confirmation",
      error: err.message,
    });
  }
}


export async function cancelReservation(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: "Réservation introuvable",
      });
    }

    if (req.user.role !== "admin") {
      if (reservation.user.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "Accès refusé",
        });
      }

      if (new Date(reservation.startDate) < new Date()) {
        return res.status(403).json({
          message: "Impossible d'annuler une réservation déjà commencée",
        });
      }
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.status(200).json({
      message: "Réservation annulée",
      data: reservation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de l'annulation",
      error: err.message,
    });
  }
}