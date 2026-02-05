const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Token no proporcionado.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { username, role, iat, exp }
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido o expirado.' 
    });
  }
}

module.exports = { authenticateToken };
