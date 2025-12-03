/*Acá configuro Express, conecto a la base de datos y publico las rutas que va a usar el frontend*/
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./database/connect.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const puerto = process.env.PORT || 3000;

/*Conexión a MongoDB*/
connectDB(process.env.MONGODB_URI);

/*Configuración básica de Express*/
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/gallery", galleryRoutes);

/*Ruta para comprobar que el backend responde. Ejemplo: http://localhost:3000/test*/
app.get("/test", (req, res) => {
  res.send("Backend funcionando");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaFrontend = path.join(__dirname, "../Frontend");
const rutaAdmin = path.join(__dirname, "../Admin");

app.use(express.static(rutaFrontend));

app.get("/admin", (req, res) => {
  res.redirect("/admin/pages/login.html");
});

app.use("/admin", express.static(rutaAdmin));

/*Arranco el servidor*/
app.listen(puerto, () => {
  console.log(`🚀 Servidor Yuquerí escuchando en http://localhost:${puerto}`);
});