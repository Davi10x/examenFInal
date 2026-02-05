const { getConnection } = require('../config/db');

async function getAllLibros(req, res) {
  let connection;
  try {

    const password = req.headers['x-user-password'] || (req.body && req.body.password);
    
    console.log('🔍 getAllLibros - Usuario:', req.user.username);
    console.log('🔍 getAllLibros - Password recibido:', password ? 'Sí' : 'No');
    console.log('🔍 getAllLibros - Header password:', req.headers['x-user-password']);
    
    connection = await getConnection(req.user.username, password);
    
    console.log('✅ Conexión establecida, ejecutando query...');
    const result = await connection.request().query('SELECT * FROM Libro ORDER BY id_libro DESC');
    
    console.log('✅ Query ejecutada, registros encontrados:', result.recordset.length);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('❌ Error al obtener libros:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      error: 'Error al obtener libros',
      mensaje: error.message,
      detalles: error.toString()
    });
  } finally {
    if (connection) await connection.close();
  }
}

async function getLibroById(req, res) {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection(req.user.username, req.body.password || req.headers['x-user-password']);
    
    const result = await connection.request()
      .input('id', id)
      .query('SELECT * FROM Libro WHERE id_libro = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Libro no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({
      error: 'Error al obtener libro',
      mensaje: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
}

async function createLibro(req, res) {
  let connection;
  try {
    const { titulo, autor, editorial, anio_publicacion, categoria, password } = req.body;

    if (!titulo || !autor) {
      return res.status(400).json({
        error: 'Título y autor son requeridos'
      });
    }

    connection = await getConnection(req.user.username, password || req.headers['x-user-password']);
    
    const result = await connection.request()
      .input('titulo', titulo)
      .input('autor', autor)
      .input('editorial', editorial)
      .input('anio_publicacion', anio_publicacion)
      .input('categoria', categoria)
      .query(`
        INSERT INTO Libro (titulo, autor, editorial, anio_publicacion, categoria)
        OUTPUT INSERTED.*
        VALUES (@titulo, @autor, @editorial, @anio_publicacion, @categoria)
      `);

    res.status(201).json({
      success: true,
      message: 'Libro creado exitosamente',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error al crear libro:', error);
    
    if (error.message.includes('permission')) {
      return res.status(403).json({
        error: 'Permiso denegado',
        mensaje: 'Su rol no permite crear registros'
      });
    }

    res.status(500).json({
      error: 'Error al crear libro',
      mensaje: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
}

async function updateLibro(req, res) {
  let connection;
  try {
    const { id } = req.params;
    const { titulo, autor, editorial, anio_publicacion, categoria, password } = req.body;

    connection = await getConnection(req.user.username, password || req.headers['x-user-password']);
    
    const result = await connection.request()
      .input('id', id)
      .input('titulo', titulo)
      .input('autor', autor)
      .input('editorial', editorial)
      .input('anio_publicacion', anio_publicacion)
      .input('categoria', categoria)
      .query(`
        UPDATE Libro 
        SET titulo = @titulo,
            autor = @autor,
            editorial = @editorial,
            anio_publicacion = @anio_publicacion,
            categoria = @categoria
        OUTPUT INSERTED.*
        WHERE id_libro = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Libro no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Libro actualizado exitosamente',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    
    if (error.message.includes('permission')) {
      return res.status(403).json({
        error: 'Permiso denegado',
        mensaje: 'Su rol no permite actualizar registros'
      });
    }

    res.status(500).json({
      error: 'Error al actualizar libro',
      mensaje: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteLibro(req, res) {
  let connection;
  try {
    const { id } = req.params;
    const password = req.body.password || req.headers['x-user-password'];

    connection = await getConnection(req.user.username, password);
    
    const result = await connection.request()
      .input('id', id)
      .query('DELETE FROM Libro WHERE id_libro = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Libro no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Libro eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    
    if (error.message.includes('permission')) {
      return res.status(403).json({
        error: 'Permiso denegado',
        mensaje: 'Su rol no permite eliminar registros'
      });
    }

    res.status(500).json({
      error: 'Error al eliminar libro',
      mensaje: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getAllLibros,
  getLibroById,
  createLibro,
  updateLibro,
  deleteLibro
};
