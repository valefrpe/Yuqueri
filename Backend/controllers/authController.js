import User from "../models/User.js";

/*POST*/
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /*Datos mínimos para crear una cuenta*/
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Tenés que enviar un email y una contraseña" });
    }

    /*Reviso si ya hay alguien registrado con ese email*/
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res
        .status(409)
        .json({ message: "Ya hay un usuario registrado con ese email" });
    }

    /*Creo el usuario en la base*/
    const nuevoUsuario = await User.create({ name, email, password });

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        id: nuevoUsuario._id,
        name: nuevoUsuario.name,
        email: nuevoUsuario.email,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "No se pudo completar el registro" });
  }
};

/*POST*/
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    /*Verifico que vengan las credenciales*/
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Necesitás enviar email y contraseña" });
    }

    const usuario = await User.findOne({ email, password });

    if (!usuario) {
      return res
        .status(401)
        .json({ message: "Email o contraseña incorrectos" });
    }

    /*Genero un token de sesión simple*/
    const tokenSesion = Math.random().toString(36).slice(2);
    usuario.session = tokenSesion;
    await usuario.save();

    res.json({
      session: tokenSesion,
      user: {
        id: usuario._id,
        name: usuario.name,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "No se pudo iniciar sesión" });
  }
};

/*POST*/
export const logoutUser = async (req, res) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res
        .status(400)
        .json({ message: "No recibí el token de sesión" });
    }

    /*Busco al usuario que tenga esa sesión activa*/
    const usuario = await User.findOne({ session: token });

    if (!usuario) {
      return res
        .status(404)
        .json({ message: "No encontré ninguna sesión con ese token" });
    }

    /*Borro la sesión y guardo*/
    usuario.session = null;
    await usuario.save();

    res.json({ message: "Cerraste sesión correctamente" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ message: "No se pudo cerrar la sesión" });
  }
};