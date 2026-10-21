const path = require("path");
const fs = require("fs");

const {
    findUserById,
    updateProfile,
    updateProfilePicture
} = require("../models/userModel");


/* =========================================
   GET PROFILE
========================================= */

const getProfile = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await findUserById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================
   UPDATE PROFILE
========================================= */

const updateUserProfile = async (
    req,
    res,
    next
) => {
    try {
        const {
            fullName,
            phone,
            address,
            city,
            state,
            country
        } = req.body;


        if (!fullName || !phone) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name and phone are required"
            });
        }


        const user =
            await updateProfile(
                req.user.id,
                {
                    fullName:
                        fullName.trim(),

                    phone:
                        phone.trim(),

                    address:
                        address
                            ? address.trim()
                            : null,

                    city:
                        city
                            ? city.trim()
                            : null,

                    state:
                        state
                            ? state.trim()
                            : null,

                    country:
                        country
                            ? country.trim()
                            : "Nigeria"
                }
            );


        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully",
            user
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================
   UPLOAD PROFILE PICTURE
========================================= */

const uploadPicture = async (
    req,
    res,
    next
) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select an image."
            });
        }


        const existingUser =
            await findUserById(
                req.user.id
            );


        /*
            Delete the old picture
            when a new picture is uploaded.
        */

        if (
            existingUser &&
            existingUser.profile_picture
        ) {

            const oldFilePath =
                path.join(
                    __dirname,
                    "../uploads/profiles",
                    existingUser.profile_picture
                );


            if (
                fs.existsSync(
                    oldFilePath
                )
            ) {
                fs.unlinkSync(
                    oldFilePath
                );
            }
        }


        /*
            Save new filename
            in the database.
        */

        const user =
            await updateProfilePicture(
                req.user.id,
                req.file.filename
            );


        return res.status(200).json({
            success: true,

            message:
                "Profile picture updated successfully.",

            user
        });

    } catch (error) {
        next(error);
    }
};


/* =========================================
   EXPORT CONTROLLERS
========================================= */

module.exports = {
    getProfile,
    updateUserProfile,
    uploadPicture
};