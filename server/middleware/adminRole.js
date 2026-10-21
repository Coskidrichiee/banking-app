module.exports = (...roles) => {

    return (req, res, next) => {

        if (!req.admin) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized."

            });

        }

        if (!roles.includes(req.admin.role)) {

            return res.status(403).json({

                success: false,

                message: "You do not have permission to perform this action."

            });

        }

        next();

    };

};