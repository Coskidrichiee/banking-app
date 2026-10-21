const express = require("express");

const {
    getBalance,
    deposit,
    withdraw,
    transfer,
    transactions
} = require("../controllers/bankController");

const authenticate =
    require("../middleware/authMiddleware");

const router = express.Router();


router.get(
    "/balance",
    authenticate,
    getBalance
);


router.post(
    "/deposit",
    authenticate,
    deposit
);


router.post(
    "/withdraw",
    authenticate,
    withdraw
);


router.post(
    "/transfer",
    authenticate,
    transfer
);


router.get(
    "/transactions",
    authenticate,
    transactions
);


module.exports = router;