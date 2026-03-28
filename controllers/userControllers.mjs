// import user from "../models/user";
// import user from "../models/user";
// import user from "../models/user";
// import user from "../models/user";
// import bcrypt from "bcryptjs/dist/bcrypt";

// export async function register(req,res,next) {
//     const {firstName,lastName, email, phone,password ,role}=req.body;
//     try{
//         const hashedPassword = await bcrypt.hash(password,12);
//         const user = await user.Create({
//            firstName, 
//            lastName,
//            email,
//            phone,
//            password: hashedPassword,
//            role
//         });
//         res.location(`/users/${user.id}`);
//         res.status (201).json({
//         message: "Utilisateur créé",
//         data: user,
//         });
//         await user.save();

//     }
//     // à mettre dans mon gestion d erreur
//     catch (err) {
//     res.status(500).json({
//       message: "Erreur lors de la création de l'utilisateur",
//       error: err.message
//     });
//   }   
// }

// export async function connexion(req,res) {
//     const {email, password}=req.body;
//     try{
//         const user = await user.findOne({where :{email}});
//         if (!user){
//             return res.status(401).json({
//                 message: "Mot de passe incorrect"
//             });
//         }
//         res.status(200).json({
//             message:"Connexion réeussi",
//             data : user
//         });

//     }
//      catch (err) {
//     res.status(500).json({
//       message: "Erreur lors de la connexion",
//       error: err.message
//     });
// }    
// }

// export async function consulterProfil(req,res) {
//     const id = req.params.id;
//     try{
//         const user = await user.findByPk(id)
//         if(!user){
//            return res.status(404).json({
//             message:"Utilisateur introuvable"
//            });
//         }
//         res.status(200).json({
//             message:"profil récupéré",
//             data : user
//         });
//     }
//      catch (err) {
//     res.status(500).json({
//       message: "Erreur lors de la consultation du profil",
//       error: err.message
//     });
//   }
    
// }


import User from "../models/user.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export async function register(req, res) {
  const { firstName, lastName, email, phone, password, role } = req.body;

  try {
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
    });

    res.location(`/api/auth/${newUser._id}`);

    res.status(201).json({
      message: "Utilisateur créé",
      data: {
        user: {
          _id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur",
      error: err.message,
    });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Identifiants invalides",
      });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "Connexion réussie",
      data: {
        user: {
          _id: existingUser._id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
        },
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la connexion",
      error: err.message,
    });
  }
}


export async function consulterProfil(req, res) {
  try {
    const existingUser = await User.findById(req.user.userId).select("-password");

    if (!existingUser) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    res.status(200).json({
      message: "Profil récupéré",
      data: existingUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la consultation du profil",
      error: err.message,
    });
  }
}