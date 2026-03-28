import jwt from "jsonwebtoken";


export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  
  if (!authHeader) {
    return res.status(401).json({
      message: "Non authentifié",
    });
  }

 
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token invalide",
    });
  }

  try {
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token invalide",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès refusé",
    });
  }
  next();
};