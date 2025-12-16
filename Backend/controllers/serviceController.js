import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import Service from "../models/Service.js";

/*Configuro Cloudinary*/
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function esVerdadero(valor) {
  return valor === true || valor === "true" || valor === "on";
}

function subirImagenDesdeBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "yuqueri/servicios" },
      (error, result) => {
        if (error) {
          console.error("Error subiendo servicio a Cloudinary:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

/*GET*/
export const getServices = async (req, res) => {
  try {
    // Traigo todos y los ordeno del más nuevo al más viejo
    const servicios = await Service.find().sort({ createdAt: -1 });
    res.json(servicios);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ message: "Error al obtener los servicios" });
  }
};

/*GET*/
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const servicio = await Service.findById(id);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json(servicio);
  } catch (error) {
    console.error("Error al obtener servicio por id:", error);
    res.status(500).json({ message: "Error al obtener el servicio" });
  }
};

/*POST*/
export const createService = async (req, res) => {
  try {
    const {
      icon,
      title,
      description,
      price,
      priceText,
      includes,
      active,
      adicional,
      type,
      image,
    } = req.body;

    if (!icon || !icon.trim()) {
      return res.status(400).json({ message: "El ícono es obligatorio" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!description || !description.trim()) {
      return res
        .status(400)
        .json({ message: "La descripción es obligatoria" });
    }

    let precioNumero = null;
    if (price !== undefined && price !== null && price !== "") {
      precioNumero = Number(price);
    }

    if (precioNumero === null || Number.isNaN(precioNumero)) {
      return res.status(400).json({ message: "El precio es obligatorio" });
    }

    if (!priceText || !priceText.trim()) {
      return res
        .status(400)
        .json({ message: "El texto del precio es obligatorio" });
    }

    let imageUrl = "";

    if (req.file && req.file.buffer) {
      imageUrl = await subirImagenDesdeBuffer(req.file.buffer);
    } else if (typeof image === "string") {
      const limpia = image.trim();
      if (
        limpia.startsWith("http://") ||
        limpia.startsWith("https://")
      ) {
        imageUrl = limpia;
      }
    }

    /*Armo el array de includes según cómo venga*/
    const includesArray = [];

    if (Array.isArray(includes)) {
      includes.forEach((item) => {
        const texto = String(item).trim();
        if (texto) includesArray.push(texto);
      });
    } else if (typeof includes === "string") {
      includes.split(",").forEach((parte) => {
        const texto = parte.trim();
        if (texto) includesArray.push(texto);
      });
    }

    const estaActivo  = esVerdadero(active);
    const esAdicional = esVerdadero(adicional);

    let tipoFinal = "service";
    if (typeof type === "string" && type.trim()) {
      tipoFinal = type.trim();
    } else if (esAdicional) {
      tipoFinal = "addon";
    }

    /*Creo el servicio en la base*/
    const nuevoServicio = await Service.create({
      icon:        icon.trim(),
      title:       title.trim(),
      description: description.trim(),
      price:       precioNumero,
      priceText:   priceText.trim(),
      includes:    includesArray,
      image:       imageUrl,
      active:      estaActivo,
      adicional:   esAdicional,
      type:        tipoFinal,
    });

    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ message: "Error al crear el servicio" });
  }
};

/*PUT*/
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const servicio = await Service.findById(id);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    const {
      icon,
      title,
      description,
      price,
      priceText,
      includes,
      active,
      adicional,
      type,
      image,
    } = req.body;

    if (typeof icon === "string") {
      servicio.icon = icon;
    }

    if (typeof title === "string") {
      const tituloLimpio = title.trim();
      if (tituloLimpio) {
        servicio.title = tituloLimpio;
      }
    }

    if (typeof description === "string") {
      servicio.description = description;
    }

    if (typeof price !== "undefined") {
      servicio.price = price;
    }

    if (typeof priceText === "string") {
      servicio.priceText = priceText;
    }

    if (typeof includes === "string") {
      const nuevoIncludes = [];
      includes.split(",").forEach((parte) => {
        const texto = parte.trim();
        if (texto) nuevoIncludes.push(texto);
      });
      servicio.includes = nuevoIncludes;
    }

    if (typeof active !== "undefined") {
      servicio.active = esVerdadero(active);
    }

    let cambioAdicional = false;
    if (typeof adicional !== "undefined") {
      servicio.adicional = esVerdadero(adicional);
      cambioAdicional = true;
    }

    if (typeof type !== "undefined") {
      if (type) {
        servicio.type = type;
      } else {
        servicio.type = servicio.adicional ? "addon" : "service";
      }
    } else if (cambioAdicional) {
      servicio.type = servicio.adicional ? "addon" : "service";
    }

    if (req.file && req.file.buffer) {
      const nuevaUrl = await subirImagenDesdeBuffer(req.file.buffer);
      servicio.image = nuevaUrl;
    } else if (typeof image === "string") {
      const limpia = image.trim();
      if (
        limpia.startsWith("http://") ||
        limpia.startsWith("https://")
      ) {
        servicio.image = limpia;
      }
    }

    await servicio.save();
    res.json(servicio);
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ message: "Error al actualizar el servicio" });
  }
};

/*DELETE*/
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const servicioEliminado = await Service.findByIdAndDelete(id);
    if (!servicioEliminado) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ message: "Error al eliminar el servicio" });
  }
};