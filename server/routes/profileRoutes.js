const express = require("express");

const {
    getProfile,
    updateUserProfile,
    uploadPicture
} = require("../controllers/profileController");

const authenticate =
    require("../middleware/authMiddleware");

const uploadProfilePicture =
    require("../middleware/uploadMiddleware");

const router = express.Router();


/* =========================================
   GET PROFILE
========================================= */

router.get(
    "/",
    authenticate,
    getProfile
);


/* =========================================
   UPDATE PROFILE
========================================= */

router.put(
    "/",
    authenticate,
    updateUserProfile
);


/* =========================================
   UPLOAD PROFILE PICTURE
========================================= */

router.post(
    "/picture",
    authenticate,
    uploadProfilePicture.single(
        "profilePicture"
    ),
    uploadPicture
);


module.exports = router;