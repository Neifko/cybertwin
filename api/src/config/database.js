const mysql = require("mysql2");

const pool = mysql.createPool({ 
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

db.getConnection()
  .then((connection) => {
    console.log("Connecté à la base de données MySQL avec succès !");
    connection.release();
  })
  .catch((err) => {
    console.error("Erreur critique : Impossible de se connecter à MySQL.", err);
  });

module.exports = db;
