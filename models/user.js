const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const regexCourriel = new RegExp(
 
  /^(?<localPart>(?<dotString>[0-9a-z!#$%&'*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+(\.[0-9a-z!#$%&'*+-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+)*)|(?<quotedString>"([\x20-\x21\x23-\x5B\x5D-\x7E\u{80}-\u{10FFFF}]|\\[\x20-\x7E])*"))(?<!.{64,})@(?<domainOrAddressLiteral>(?<addressLiteral>\[((?<IPv4>\d{1,3}(\.\d{1,3}){3})|(?<IPv6Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){7})|(?<IPv6Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?)|(?<IPv6v4Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){5}:\d{1,3}(\.\d{1,3}){3})|(?<IPv6v4Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3}:)?\d{1,3}(\.\d{1,3}){3})|(?<generalAddressLiteral>[a-z0-9-]*[[a-z0-9]:[\x21-\x5A\x5E-\x7E]+))\])|(?<Domain>(?!.{256,})(([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))(\.([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))*))$/iu
);
const regexPhone = /[0-9]/;

const userSchema = new mongoose.Schema(
  {
    username:{type: String,
      unique:[true,"ce nom d'utilisateur existe déja"],
      required :[true,"le nom d'utilisateur est obligatoire"],
      trim:true,

    },
     email: { type: String,
     unique:[true,"L'adresse courriel est déja utilisé"],
     match:[regexCourriel, "le format de l'adresse courriel est invalid"],
     required:[true,"L'adresse courriel est obligatoire"],
     trim:true,
     lowercase:true,

    },
    phone: { type: Number,
    maxLength :[10,"le numéro de téléphone ne doit pas depassé 10 chiffres"],
    minLength :[10,"le numéro de téléphone ne doit être au minimun 10 chiffres"],
    match:[regexPhone,"le numéro de téléphone n'est pas correct"]
    
    },
    password: { type: String ,
    select : false,
    },
    role :{ type : String,
      enum :["user","admin"],
      default : "user",

    },

    firstName: { type: String },
    lastName: { type: String }, 
    
  },
  { timestamps: true },

);
userSchema.pre("save", async function (next) {
  if(!this.isModified("password")){
    return next();
  }
  this.password = await bcrypt.hash(this.password,10);
  next();
})

module.exports = mongoose.model("User", userSchema);
