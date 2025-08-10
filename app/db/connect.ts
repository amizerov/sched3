import sql from 'mssql';

const config = {
  user: 'msu',
  password: '160378',
  server: 'progerx.svr.vc',
  database: 'newstud',
  options: {
    encrypt: true, // если требуется для вашего сервера
    trustServerCertificate: true // если используется self-signed сертификат
  }
};

export async function connectToDb() {
  try {
    await sql.connect(config);
    // Ваши запросы
    // const result = await sql.query('SELECT * FROM ...');
    // return result;
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}