import Campsite from "../models/campsite.mjs";

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


export async function updateCampsite(req, res) {
  try {
    const campsite = await Campsite.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
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