const jwt = require('jsonwebtoken');
const { getConnection, getUserRole } = require('../config/db');

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Usuario y contraseña son requeridos'
    });
  }

  try {

    console.log(`🔐 Intentando autenticar usuario: ${username}`);
    
    const connection = await getConnection(username, password);
    
    const role = await getUserRole(username, password);
    
    console.log(`✅ Usuario ${username} autenticado con rol: ${role}`);
    
    await connection.close();
    
    const token = jwt.sign(
      { username, role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        username,
        role
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error.message);
    
    if (error.message.includes('Login failed')) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

    res.status(500).json({
      error: 'Error en el servidor',
      mensaje: error.message
    });
  }
}

function verifyToken(req, res) {

  res.json({
    valid: true,
    user: req.user
  });
}

module.exports = {
  login,
  verifyToken
};
