import { Schema, model } from "mongoose";

// const { validate } = require("./user");

// const Campsite = mongoose.model("Campsite");

const reservationSchema = new mongoose.Schema(
  {
    campsite:{
      type: Schema.Types.ObjectId,
      ref: "Campsite",
      required : true,// à regarder
    },
    user: { type: Schema.Types.ObjectId,
    ref: "User",
   required:true,
   },
    
    startDate: { type: Date,
    required : [true,"La date de debut est obligatoire"],
    validate : {
      validator: function(value){
        return value >= new Date();
      },
      message : "la date de début est irreversible"

    }

     },
    endDate: { type: Date,
       required : [true,"La date de fin est obligatoire"],
      validate : {
      validator: function(){
        return this.startDate <= endDate;
      },
      message : "la date de fin doit être supérieur ou égal à la date de début",
     }
    },
    guests: { type: Number, 
    validate: {
      validator : function(value){
         return value > Campsite.capacity
        },
        message : "La valeur ne doit pas depasser la capacité du site",

      }

    },
    
    
    totalPrice: { type: Number,
    required : [true,"Le prix est obligatoire et doit être superieur à zéro"],
    validate:{
      validator : function (valeur){
        return valeur<0
      },
      message : "la valeur doit être positive"
    }
     },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
    },
  },
  { timestamps: true },
);


  



module.exports = mongoose.model("Reservation", reservationSchema);
