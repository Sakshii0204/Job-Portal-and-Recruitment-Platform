const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_portal_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test DB connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(' MySQL Database connected successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error(' MySQL Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
