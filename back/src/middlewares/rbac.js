const rolePermissions = {
  lector: ['GET'],
  reader: ['GET'],  // Alias para lector
  writer: ['GET', 'POST', 'PUT'],
  owner: ['GET', 'POST', 'PUT', 'DELETE'],
  sa: ['GET', 'POST', 'PUT', 'DELETE']
};

function checkPermission(requiredMethods) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const method = req.method;

    if (!rolePermissions[userRole]) {
      return res.status(403).json({
        error: 'Rol no reconocido',
        rol: userRole
      });
    }

    const allowedMethods = rolePermissions[userRole];
    
    if (!allowedMethods.includes(method)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: `Su rol '${userRole}' no tiene permisos para realizar esta operación (${method})`,
        permisosDisponibles: allowedMethods
      });
    }

    next();
  };
}

function onlySA(req, res, next) {
  const userRole = req.user.role;

  if (userRole !== 'sa') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo el usuario SA puede acceder a este recurso'
    });
  }

  next();
}

module.exports = {
  checkPermission,
  onlySA
};
