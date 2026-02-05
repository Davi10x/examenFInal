const { getConnection } = require('../config/db');

async function createUser(req, res) {
  let connection;
  try {
    const { username, password, role } = req.body;
    const saPassword = req.headers['x-user-password'] || (req.body && req.body.saPassword);

    if (!username || !password || !role) {
      return res.status(400).json({
        error: 'Username, password y role son requeridos',
        ejemplo: {
          username: 'nuevo_usuario',
          password: 'password123',
          role: 'lector' // lector, writer u owner
        }
      });
    }

    const rolesValidos = ['lector', 'writer', 'owner'];
    if (!rolesValidos.includes(role)) {
      return res.status(400).json({
        error: 'Rol inválido',
        rolesPermitidos: rolesValidos
      });
    }

    connection = await getConnection(req.user.username, saPassword);

    await connection.request()
      .input('username', username)
      .input('password', password)
      .query(`
        IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = @username)
        BEGIN
          CREATE LOGIN [${username}] WITH PASSWORD = '${password}'
        END
      `);

    await connection.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = '${username}')
      BEGIN
        CREATE USER [${username}] FOR LOGIN [${username}]
      END
    `);

    let sqlRole = '';
    switch (role) {
      case 'lector':
        sqlRole = 'db_datareader';
        break;
      case 'writer':
        sqlRole = 'db_datawriter, db_datareader';
        break;
      case 'owner':
        sqlRole = 'db_owner';
        break;
    }

    const roles = sqlRole.split(',').map(r => r.trim());
    for (const dbRole of roles) {
      await connection.request().query(`
        ALTER ROLE [${dbRole}] ADD MEMBER [${username}]
      `);
    }

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        username,
        role,
        rolesDB: roles
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'El usuario ya existe'
      });
    }

    if (error.message.includes('permission')) {
      return res.status(403).json({
        error: 'Permiso denegado',
        mensaje: 'Solo el usuario SA puede crear usuarios'
      });
    }

    res.status(500).json({
      error: 'Error al crear usuario',
      mensaje: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
}

async function getUsers(req, res) {
  let connection;
  try {
    const saPassword = req.headers['x-user-password'] || (req.body && req.body.password);
    
    console.log('🔍 getUsers - Usuario:', req.user.username);
    console.log('🔍 getUsers - Password recibido:', saPassword ? 'Sí' : 'No');
    
    connection = await getConnection(req.user.username, saPassword);

    const result = await connection.request().query(`
      SELECT 
        dp.name as username,
        dp.type_desc,
        CASE 
          WHEN IS_ROLEMEMBER('db_owner', dp.name) = 1 THEN 'owner'
          WHEN IS_ROLEMEMBER('db_datawriter', dp.name) = 1 THEN 'writer'
          WHEN IS_ROLEMEMBER('db_datareader', dp.name) = 1 THEN 'lector'
          ELSE 'none'
        END as role
      FROM sys.database_principals dp
      WHERE dp.type IN ('S', 'U')
        AND dp.name NOT IN ('dbo', 'guest', 'INFORMATION_SCHEMA', 'sys')
        AND dp.name NOT LIKE '##%'
      ORDER BY dp.name
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      error: 'Error al listar usuarios',
      mensaje: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteUser(req, res) {
  let connection;
  try {
    const { username } = req.params;
    const saPassword = req.headers['x-user-password'] || (req.body && req.body.password);

    const systemUsers = ['sa', 'dbo', 'guest'];
    if (systemUsers.includes(username.toLowerCase())) {
      return res.status(400).json({
        error: 'No se puede eliminar este usuario del sistema'
      });
    }

    connection = await getConnection(req.user.username, saPassword);

    await connection.request().query(`
      IF EXISTS (SELECT * FROM sys.database_principals WHERE name = '${username}')
      BEGIN
        DROP USER [${username}]
      END
    `);

    await connection.request().query(`
      IF EXISTS (SELECT * FROM sys.server_principals WHERE name = '${username}')
      BEGIN
        DROP LOGIN [${username}]
      END
    `);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      error: 'Error al eliminar usuario',
      mensaje: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  createUser,
  getUsers,
  deleteUser
};
