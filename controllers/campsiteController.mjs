import Campsite from "../models/campsite.mjs";
import Reservation from "../models/reservation.mjs";


export async function createCampsite(req, res) {
  try {
    const campsite = await Campsite.create(req.body);

    res.status(201).json({
      message: "Campsite créé",
      data: campsite,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création",
      error: err.message,
    });
  }
}

// Voir tous les campsites
export async function getAllCampsites(req, res) {
  try {
    const campsites = await Campsite.find();

    res.status(200).json({
      message: "Liste des campsites",
      data: campsites,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération campsites",
      error: err.message,
    });
  }
}

// Voir les campsites disponibles

export async function getAvailableCampsites(req, res) {
  try {
    const { type } = req.query;

    const typesValides = ["tent", "rv", "cabin"];

    if (type && !typesValides.includes(type)) {
      return res.status(400).json({
        message: "Type invalide",
      });
    }

    const filtre = {};

    if (type) {
      filtre.type = type;
    }

    const campsites = await Campsite.find(filtre);

    res.status(200).json({
      message: "Campsites disponibles",
      data: campsites,
    });

  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération campsites",
      error: err.message,
    });
  }
}

// Voir un campsite par id
export async function getCampsiteById(req, res) {
  try {
    const campsite = await Campsite.findById(req.params.id);

    if (!campsite) {
      return res.status(404).json({
        message: "Campsite introuvable",
      });
    }

    res.status(200).json({
      message: "Campsite trouvé",
      data: campsite,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération campsite",
      error: err.message,
    });
  }
}

// Modifier un campsite
export async function updateCampsite(req, res) {
  try {
    const campsite = await Campsite.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!campsite) {
      return res.status(404).json({
        message: "Campsite introuvable",
      });
    }

    res.status(200).json({
      message: "Campsite modifié",
      data: campsite,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur modification",
      error: err.message,
    });
  }
}


// Supprimer un campsite
export async function deleteCampsite(req, res) {
  try {
    const campsite = await Campsite.findByIdAndDelete(req.params.id);

    if (!campsite) {
      return res.status(404).json({
        message: "Campsite introuvable",
      });
    }

    res.status(200).json({
      message: "Campsite supprimé",
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur suppression",
      error: err.message,
    });
  }
}