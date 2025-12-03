import mongoose from "mongoose";

/*Conecto a MongoDB usando la URI recibida*/
export const connectDB = async (uri) => {
  try {
    /*Intento conectar a la base*/
    await mongoose.connect(uri);

    console.log("✔️ Conexión a MongoDB realizada correctamente");
  } catch (error) {
    /*Si algo falla, lo muestro y paro el servidor*/
    console.error("❌ No se pudo conectar a MongoDB:", error.message);
    process.exit(1);
  }
};