import User from '../models/User.js';

export const requireSession = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ message: 'No autorizado, falta token de sesión' });
    }

    const user = await User.findOne({ session: token });
    if (!user) {
      return res.status(401).json({ message: 'No autorizado, sesión no válida' });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error('Error en requireSession:', e);
    res.status(500).json({ message: 'Error al validar sesión' });
  }
};