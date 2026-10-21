const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            success: false,
            message: "A record with this information already exists"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

module.exports = errorHandler;