// const mongoose = require("mongoose");
import { Schema,model } from "mongoose";

const campsiteSchema = new Schema(
  {
    name: { type: String,
    required:[true,"Le nom est obligatoire"],
     },
    location: { type: String,
       required:[true,"La location est obligatoire"],
     },
    description: { type: String },
    type: {
      type: String,
      enum: ["tent", "rv", "cabin", "glamping", "backcountry"],
    },
    pricePerNight: { type: Number, 
    required:[true,"Le prix est obligatoire"],
    min:[1,"le prix doit être un nombre positif supérieur à 0"]
    },

    maxVehicleLength: { type: Number,
    min:[1,"le prix doit être un nombre positif supérieur à 0"],
    required:[true,"Le nombre est obligatoire"],//requis si type =rv

     },

    capacity: { type: Number ,
      min:[1,"le prix doit être un nombre positif supérieur à 0"],
       required:[true,"Le nombre doit être positif"],
     
    },
    
    amenities: {
      type: [String],
      required : false,
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
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Campsite", campsiteSchema);
