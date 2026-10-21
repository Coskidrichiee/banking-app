const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
    __dirname,
    "../uploads/profiles"
);


// Create folder automatically

if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive:true
        }
    );

}



// ======================================================
// STORAGE CONFIGURATION
// ======================================================

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(
            null,
            uploadDirectory
        );

    },


    filename:(req,file,cb)=>{


        const extension =
            path.extname(
                file.originalname
            )
            .toLowerCase();



        const filename =

            `profile_${Date.now()}_${Math.floor(
                Math.random()*1000000
            )}${extension}`;



        cb(
            null,
            filename
        );


    }


});





// ======================================================
// FILE VALIDATION
// ======================================================

const fileFilter = (req,file,cb)=>{


    const allowedTypes=[

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];



    if(
        allowedTypes.includes(
            file.mimetype
        )
    ){

        cb(
            null,
            true
        );


    }else{


        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            ),
            false
        );


    }


};





// ======================================================
// MULTER CONFIGURATION
// ======================================================

const uploadProfilePicture = multer({

    storage,


    fileFilter,


    limits:{

        fileSize:
            5 * 1024 * 1024

    }


});





module.exports =
    uploadProfilePicture;