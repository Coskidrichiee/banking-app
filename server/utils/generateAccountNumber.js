const crypto = require("crypto");

const generateAccountNumber = () => {
    let accountNumber = "";

    for (let i = 0; i < 10; i++) {
        accountNumber += crypto.randomInt(0, 10);
    }

    return accountNumber;
};

module.exports = generateAccountNumber;