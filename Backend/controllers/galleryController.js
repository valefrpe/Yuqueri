import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import GalleryItem from "../models/GalleryItem.js";

/*Configuración de Cloudinary*/
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function subirImagenDesdeBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "yuqueri/galeria" },
      (error, result) => {
        if (error) {
          console.error("Error subiendo imagen a Cloudinary:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

/*GET /api/gallery*/
export const getGallery = async (req, res) => {
  try {
    const filtro = {};

    /*Solo traigo las activas*/
    if (req.query.active === "true") {
      filtro.active = true;
    }

    const imagenes = await GalleryItem.find(filtro).sort({ createdAt: -1 });
    res.json(imagenes);
  } catch (error) {
    console.error("Error al obtener la galería:", error);
    res.status(500).json({ message: "Error al obtener la galería" });
  }
};

/*POST /api/gallery*/
export const createItem = async (req, res) => {
  try {
    const { title, active } = req.body;
    const tituloLimpio = (title || "").trim();

    if (!tituloLimpio) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ message: "Tenés que subir una imagen (campo 'image')" });
    }

    /*Subo la imagen a Cloudinary y me quedo con la URL*/
    const imageUrl = await subirImagenDesdeBuffer(req.file.buffer);

    const nuevaImagen = await GalleryItem.create({
      title: tituloLimpio,
      url: imageUrl,
      active:
        active === "true" ||
        active === true ||
        active === "on",
    });

    res.status(201).json(nuevaImagen);
  } catch (error) {
    console.error("Error al crear imagen en la galería:", error);
    res.status(500).json({ message: "Error al crear la imagen" });
  }
};

/*PUT /api/gallery/:id*/
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, active } = req.body;

    const imagen = await GalleryItem.findById(id);
    if (!imagen) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    const tituloLimpio = (title || "").trim();
    if (tituloLimpio) {
      imagen.title = tituloLimpio;
    }

    if (typeof active !== "undefined") {
      imagen.active =
        active === "true" ||
        active === true ||
        active === "on";
    }

    /*Si viene archivo nuevo, lo subo a Cloudinary y reemplazo la URL*/
    if (req.file && req.file.buffer) {
      const nuevaUrl = await subirImagenDesdeBuffer(req.file.buffer);
      imagen.url = nuevaUrl;
    }

    await imagen.save();
    res.json(imagen);
  } catch (error) {
    console.error("Error al actualizar imagen de la galería:", error);
    res.status(500).json({ message: "Error al actualizar la imagen" });
  }
};

/*DELETE /api/gallery/:id*/
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const imagenEliminada = await GalleryItem.findByIdAndDelete(id);
    if (!imagenEliminada) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    res.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar imagen de la galería:", error);
    res.status(500).json({ message: "Error al eliminar la imagen" });
  }
};