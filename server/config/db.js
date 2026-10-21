
const mysql = require("mysql2/promise");
require("dotenv").config();

const isCloudDatabase =
    process.env.DB_HOST &&
    process.env.DB_HOST !== "localhost" &&
    process.env.DB_HOST !== "127.0.0.1";

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "banking_app",
    port: Number(process.env.DB_PORT) || 3306,

    // Enable SSL for Aiven
    ...(isCloudDatabase && {
        ssl: {
            rejectUnauthorized: true
        }
    }),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testDatabaseConnection = async () => {
    let connection;

    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(
            "SELECT DATABASE() AS databaseName"
        );

        console.log("==========================================");
        console.log("DATABASE CONNECTED");
        console.log("Database:", rows[0].databaseName);
        console.log("Host:", process.env.DB_HOST);
        console.log("==========================================");

        return true;
    } catch (error) {
        console.error("==========================================");
        console.error("DATABASE CONNECTION ERROR");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("==========================================");

        throw error;
    } finally {
        if (connection) connection.release();
    }
};

module.exports = pool;
module.exports.testDatabaseConnection = testDatabaseConnection;
