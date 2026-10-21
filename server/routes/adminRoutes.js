const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

/*
==================================================
ADMIN TRANSACTION CONTROLLER
==================================================
*/

const {
    getPendingTransactions,
    getAllTransactions,
    approveTransaction,
    rejectTransaction
} = require("../controllers/adminTransactionController");


/*
==================================================
ADMIN LOGIN
==================================================
*/

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /*
        =========================================
        VALIDATION
        =========================================
        */

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();


        console.log(
            "Admin login attempt:",
            cleanEmail
        );


        console.log(
            "JWT_SECRET loaded:",
            !!process.env.JWT_SECRET
        );


        /*
        =========================================
        FIND ADMIN
        =========================================
        */

        const [admins] = await db.query(

            `
            SELECT
                id,
                full_name,
                email,
                role,
                status,
                profile_picture
            FROM admins
            WHERE LOWER(email) = ?
            LIMIT 1
            `,

            [cleanEmail]

        );


        if (
            !admins ||
            admins.length === 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin credentials."

            });

        }


        const admin =
            admins[0];


        /*
        =========================================
        TEMPORARY ADMIN PASSWORD
        =========================================

        Change this to bcrypt later.
        =========================================
        */

        if (
            cleanEmail !==
            "admin@richieebank.com" ||

            password !==
            "Admin@123"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin credentials."

            });

        }


        /*
        =========================================
        CHECK ADMIN STATUS
        =========================================
        */

        if (
            admin.status &&
            String(admin.status)
                .toUpperCase() !==
            "ACTIVE"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Admin account has been disabled."

            });

        }


        /*
        =========================================
        CHECK JWT SECRET
        =========================================
        */

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is missing from .env"
            );

            return res.status(500).json({

                success: false,

                message:
                    "JWT_SECRET is not configured on the server."

            });

        }


        /*
        =========================================
        CREATE JWT
        =========================================
        */

        const token =
            jwt.sign(

                {
                    id:
                        admin.id,

                    email:
                        admin.email,

                    role:
                        admin.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN ||
                        "7d"
                }

            );


        /*
        =========================================
        SUCCESS
        =========================================
        */

        return res.status(200).json({

            success: true,

            message:
                "Admin login successful.",

            token,

            admin: {

                id:
                    admin.id,

                name:
                    admin.full_name ||
                    "Administrator",

                email:
                    admin.email,

                role:
                    admin.role,

                status:
                    admin.status,

                profile_picture:
                    admin.profile_picture ||
                    null

            }

        });

    }

    catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "ADMIN LOGIN ERROR"
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "SQL State:",
            error.sqlState
        );

        console.error(
            "Stack:",
            error.stack
        );

        console.error(
            "=========================================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during admin login.",

            error:
                error.message

        });

    }

});


/*
==================================================
ADMIN TRANSACTIONS
==================================================
*/

/*
GET ALL TRANSACTIONS

GET:
 /api/admin/transactions

Example:
 /api/admin/transactions?limit=100
*/

router.get(
    "/transactions",
    getAllTransactions
);


/*
GET PENDING TRANSACTIONS

GET:
 /api/admin/transactions/pending
*/

router.get(
    "/transactions/pending",
    getPendingTransactions
);


/*
APPROVE TRANSACTION

PUT:
 /api/admin/transactions/:id/approve
*/

router.put(
    "/transactions/:id/approve",
    approveTransaction
);


/*
REJECT TRANSACTION

PUT:
 /api/admin/transactions/:id/reject
*/

router.put(
    "/transactions/:id/reject",
    rejectTransaction
);


/*
==================================================
EXPORT ROUTER
==================================================
*/

module.exports = router;