const express = require("express");

const router = express.Router();

const upload =
    require("../middleware/uploadMiddleware");


const {

    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser

} = require("../controllers/adminUsersController");



// ======================================
// GET ALL USERS
// ======================================

router.get(
    "/users",
    getUsers
);



// ======================================
// GET SINGLE USER
// ======================================

router.get(
    "/users/:id",
    getUser
);



// ======================================
// CREATE USER
// ======================================

router.post(
    "/users",
    upload.single("profile_picture"),
    createUser
);



// ======================================
// UPDATE USER
// ======================================

router.put(
    "/users/:id",
    upload.single("profile_picture"),
    updateUser
);



// ======================================
// DELETE USER
// ======================================

router.delete(
    "/users/:id",
    deleteUser
);



// ======================================
// BLOCK USER
// ======================================

router.patch(
    "/users/:id/block",
    blockUser
);



// ======================================
// UNBLOCK USER
// ======================================

router.patch(
    "/users/:id/unblock",
    unblockUser
);



module.exports = router;