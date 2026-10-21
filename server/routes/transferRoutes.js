const express = require("express");

const router =
    express.Router();

const authenticate =
    require("../middleware/authMiddleware");

const adminAuth =
    require("../middleware/adminAuth");

const {

    createTransferRequest,

    getPendingTransfers,

    approveTransfer,

    rejectTransfer

} = require("../controllers/transferController");


/* =========================================================
   USER
========================================================= */

router.post(

    "/create",

    authenticate,

    createTransferRequest

);


/* =========================================================
   ADMIN
========================================================= */

router.get(

    "/pending",

    adminAuth,

    getPendingTransfers

);


router.put(

    "/:id/approve",

    adminAuth,

    approveTransfer

);


router.put(

    "/:id/reject",

    adminAuth,

    rejectTransfer

);


module.exports = router;