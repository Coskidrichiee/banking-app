const jwt = require("jsonwebtoken");

const adminAuth = (
    req,
    res,
    next
) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    "Authorization header is missing."

            });

        }


        if (
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization format."

            });

        }


        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin token is missing."

            });

        }


        const secret =
            process.env.JWT_SECRET;


        if (!secret) {

            console.error(
                "JWT_SECRET is not configured."
            );


            return res.status(500).json({

                success: false,

                message:
                    "JWT authentication is not configured."

            });

        }


        const decoded =
            jwt.verify(
                token,
                secret
            );


        /*
        ==========================================
        CHECK ADMIN ROLE
        ==========================================
        */

        if (
            !decoded.role ||
            ![
                "ADMIN",
                "admin",
                "SUPER_ADMIN",
                "super_admin"
            ].includes(decoded.role)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Admin access required."

            });

        }


        req.admin = decoded;


        next();

    }

    catch (error) {

        console.error(
            "Admin authentication error:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired admin token."

        });

    }

};


module.exports = adminAuth;