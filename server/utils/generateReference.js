const crypto = require("crypto");

const generateReference = (prefix = "TXN") => {
    const randomPart = crypto
        .randomBytes(8)
        .toString("hex")
        .toUpperCase();

    return `${prefix}-${Date.now()}-${randomPart}`;
};

module.exports = generateReference;