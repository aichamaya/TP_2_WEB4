// import express from "express";
// import mongoose from "mongoose";
// // import seed from
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();

// app.use(express.json());

// //LE CORS en classe

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   // res.setHeader('Access-Control-Allow-Origin', 'https://cdpn.io');

//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE",
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

// // Routes
// import dbRoutes from "./routes/db.mjs";

// app.use("/api/db", dbRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`API available at http://localhost:${PORT}`);
// });


// export default app;


import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import dbRoutes from "./routes/db.mjs";
import userRoutes from "./routes/user.mjs";
import campsiteRoutes from "./routes/campsite.mjs";
import reservationRoutes from "./routes/reservation.mjs";

dotenv.config();

const app = express();

app.use(express.json());


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


app.use("/api/db", dbRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/campsites", campsiteRoutes);
app.use("/api/reservations", reservationRoutes);


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

export default app;