const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const {
    testDatabaseConnection
} = require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const profileRoutes =
    require("./routes/profileRoutes");

const bankRoutes =
    require("./routes/bankRoutes");

const errorHandler =
    require("./middleware/errorMiddleware");

const adminRoutes =
    require("./routes/adminRoutes");

const adminUsersRoutes =
    require("./routes/adminUsersRoutes");

const transferRoutes =
    require("./routes/transferRoutes");


const app = express();

const PORT =
    process.env.PORT || 5000;


/* =========================================
   CORS
========================================= */

app.use(
    cors({
        origin:
            "http://localhost:5173",

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


/* =========================================
   BODY PARSING
========================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================
   STATIC UPLOADS
========================================= */

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


/* =========================================
   API HEALTH CHECK
========================================= */

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Richiee Banking API is running",

            version:
                "1.0.0"

        });

    }
);


/* =========================================
   API ROUTES
========================================= */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/profile",
    profileRoutes
);

app.use(
    "/api/bank",
    bankRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/admin",
    adminUsersRoutes
);


/* =========================================
   TRANSFER ROUTES
========================================= */

app.use(
    "/api/transfers",
    transferRoutes
);


/* =========================================
   404 HANDLER
========================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API route not found"

        });

    }
);


/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(
    errorHandler
);


/* =========================================
   START SERVER
========================================= */

const startServer = async () => {

    try {

        await testDatabaseConnection();

        app.listen(
            PORT,
            () => {

                console.log(
                    `Banking server running on http://localhost:${PORT}`
                );

                console.log(
                    `Profile uploads available at http://localhost:${PORT}/uploads`
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Failed to start server:",
            error
        );

        process.exit(1);

    }

};


startServer();