import mongoose from "mongoose";

const campsiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "La localisation est obligatoire"],
      trim: true,
    },

    description: {
      type: String,
      required: false,
      trim: true,
    },

    type: {
      type: String,
      required: [true, "Le type est obligatoire"],
      enum: ["tente", "rv", "chalet", "glamping", "arrière-pays", "autre"],
    },

    pricePerNight: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: [1, "Le prix doit être un nombre positif supérieur à 0"],
    },

    maxVehicleLength: {
      type: Number,
      min: [1, "La longueur doit être un nombre positif supérieur à 0"],
      required: function () {
        return this.type === "rv";
      },
    },

    capacity: {
      type: Number,
      required: [true, "La capacité est obligatoire"],
      min: [1, "La capacité doit être un nombre positif supérieur à 0"],
    },

    amenities: {
      type: [String],
      enum: [
        "électricité",
        "eau",
        "égout",
        "feu de camp",
        "table de pique-nique",
        "abri",
        "wifi",
        "douche",
        "toilettes",
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Campsite", campsiteSchema);