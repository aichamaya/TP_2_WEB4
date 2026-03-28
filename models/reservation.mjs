import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    campsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campsite",
      required: [true, "Le site de camping est obligatoire"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est obligatoire"],
    },

    startDate: {
      type: Date,
      required: [true, "La date de début est obligatoire"],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: "La date de début doit être aujourd'hui ou plus tard",
      },
    },

    endDate: {
      type: Date,
      required: [true, "La date de fin est obligatoire"],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "La date de fin doit être supérieure ou égale à la date de début",
      },
    },

    guests: {
      type: Number,
      required: [true, "Le nombre de personnes est obligatoire"],
      min: [1, "Le nombre de personnes doit être supérieur à 0"],
    },

    totalPrice: {
      type: Number,
      required: [true, "Le prix total est obligatoire"],
      min: [1, "La valeur doit être positive"],
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);