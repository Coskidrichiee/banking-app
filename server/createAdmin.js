const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function createAdmin() {

    const connection = await mysql.createConnection({

        host: "localhost",

        user: "root",

        password: "",

        database: "banking_app"

    });

    const password = await bcrypt.hash(

        "Admin@123",

        10

    );

    await connection.execute(

        `INSERT INTO admins
        (
            full_name,
            email,
            password_hash,
            role
        )
        VALUES
        (?,?,?,?)`,

        [

            "Super Administrator",

            "admin@richieebank.com",

            password,

            "SUPER_ADMIN"

        ]

    );

    console.log("Admin created successfully");

    process.exit();

}

createAdmin();