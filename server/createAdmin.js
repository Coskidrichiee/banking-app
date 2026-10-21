
require("dotenv").config();
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function createAdmin() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 11094),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                rejectUnauthorized: true
            }
        });

        const email = "admin@richieebank.com";

        // Avoid inserting the same administrator twice.
        const [existing] = await connection.execute(
            "SELECT id FROM admins WHERE email = ? LIMIT 1",
            [email]
        );

        if (existing.length > 0) {
            console.log("Admin already exists. No changes made.");
            return;
        }

        const password = await bcrypt.hash(
            process.env.INITIAL_ADMIN_PASSWORD,
            10
        );

        await connection.execute(
            `INSERT INTO admins
                (full_name, email, password_hash, role)
             VALUES (?, ?, ?, ?)`,
            [
                "Super Administrator",
                email,
                password,
                "SUPER_ADMIN"
            ]
        );

        console.log("Admin created successfully.");
    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (connection) await connection.end();
    }
}

if (!process.env.INITIAL_ADMIN_PASSWORD) {
    console.error("INITIAL_ADMIN_PASSWORD is not configured.");
    process.exitCode = 1;
} else {
    createAdmin();
}
