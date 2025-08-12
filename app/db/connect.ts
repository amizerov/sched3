
import sql from 'mssql';

const {
  DB_USER,
  DB_PASSWORD,
  DB_SERVER,
  DB_DATABASE
} = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_SERVER || !DB_DATABASE) {
  throw new Error('One or more required DB environment variables are missing');
}

const config = {
  user: DB_USER,
  password: DB_PASSWORD,
  server: DB_SERVER,
  database: DB_DATABASE,
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