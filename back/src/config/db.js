const sql = require('mssql');

async function getConnection(user, password) {
  try {
    const config = {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT),
      user: user,
      password: password,
      options: {
        encrypt: false,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
      }
    };

    const pool = await sql.connect(config);
    console.log(`✅ Conexión establecida a SQL Server como usuario: ${user}`);
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    throw error;
  }
}

async function getUserRole(user, password) {
  let connection;
  try {
    connection = await getConnection(user, password);
    

    const result = await connection.request().query(`
      SELECT 
        CASE 
          WHEN IS_SRVROLEMEMBER('sysadmin', '${user}') = 1 THEN 'sa'
          WHEN IS_ROLEMEMBER('db_owner', '${user}') = 1 THEN 'owner'
          WHEN IS_ROLEMEMBER('db_datawriter', '${user}') = 1 THEN 'writer'
          WHEN IS_ROLEMEMBER('db_datareader', '${user}') = 1 THEN 'lector'
          ELSE 'none'
        END as rol
    `);

    return result.recordset[0].rol;
  } catch (error) {
    console.error('Error al obtener rol:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getConnection,
  getUserRole,
  sql
};
