const bcrypt = require("bcryptjs");

const pool = require("../config/db");


// ======================================
// GET USERS
// ======================================

exports.getUsers = async(req,res)=>{

    try{


        const [users] = await pool.query(

            `
            SELECT 
            id,
            full_name,
            email,
            phone,
            account_number,
            balance,
            address,
            city,
            state,
            country,
            profile_picture,
            status,
            created_at

            FROM users

            ORDER BY id DESC

            `

        );


        res.json({

            success:true,

            users

        });


    }
    catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:"Failed to fetch users"

        });

    }

};





// ======================================
// GET SINGLE USER
// ======================================

exports.getUser = async(req,res)=>{


    try{


        const {id}=req.params;


        const [user] =
        await pool.query(

            "SELECT * FROM users WHERE id=?",
            [id]

        );



        if(user.length===0){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }



        res.json({

            success:true,

            user:user[0]

        });


    }
    catch(error){

        console.log(error);

        res.status(500).json({

            message:"Server error"

        });

    }

};







// ======================================
// CREATE USER
// ======================================

exports.createUser = async(req,res)=>{


try{


const {

full_name,
email,
phone,
password,
balance,
address,
city,
state,
country,
status

}=req.body;



if(
!full_name ||
!email ||
!phone ||
!password
){

return res.status(400).json({

success:false,

message:"Required fields missing"

});

}




const [emailCheck]=
await pool.query(

"SELECT id FROM users WHERE email=?",
[email]

);



if(emailCheck.length){

return res.status(400).json({

message:"Email already exists"

});

}





let account_number;


while(true){


account_number =
Math.floor(
1000000000 +
Math.random()*9000000000
).toString();



const [check]=
await pool.query(

"SELECT id FROM users WHERE account_number=?",
[account_number]

);



if(check.length===0)
break;


}




const password_hash =
await bcrypt.hash(password,10);



let profile_picture=null;


if(req.file){

profile_picture =
"/uploads/profiles/"+req.file.filename;

}




const [result]=
await pool.query(

`
INSERT INTO users
(
full_name,
email,
phone,
account_number,
password_hash,
balance,
address,
city,
state,
country,
profile_picture,
status
)

VALUES(?,?,?,?,?,?,?,?,?,?,?,?)

`,

[

full_name,
email,
phone,
account_number,
password_hash,
balance || 0,
address || "",
city || "",
state || "",
country || "Nigeria",
profile_picture,
status || "active"

]


);





res.status(201).json({

success:true,

message:"User created successfully",

id:result.insertId

});



}
catch(error){

console.log(error);


res.status(500).json({

message:"Server error"

});


}


};







// ======================================
// UPDATE USER
// ======================================

exports.updateUser = async(req,res)=>{


try{


const {id}=req.params;


const {

full_name,
email,
phone,
address,
city,
state,
country,
status,
balance

}=req.body;



await pool.query(

`
UPDATE users SET

full_name=?,
email=?,
phone=?,
address=?,
city=?,
state=?,
country=?,
status=?,
balance=?

WHERE id=?

`,

[

full_name,
email,
phone,
address,
city,
state,
country,
status,
balance,
id

]

);



res.json({

success:true,

message:"User updated"

});


}
catch(error){

console.log(error);

res.status(500).json({

message:"Update failed"

});


}

};








// ======================================
// DELETE USER
// ======================================

exports.deleteUser = async(req,res)=>{


try{


await pool.query(

"DELETE FROM users WHERE id=?",

[req.params.id]

);



res.json({

success:true,

message:"User deleted"

});


}
catch(error){

res.status(500).json({

message:"Delete failed"

});

}


};








// ======================================
// BLOCK USER
// ======================================

exports.blockUser = async(req,res)=>{


await pool.query(

`
UPDATE users
SET status='blocked'
WHERE id=?

`,

[req.params.id]

);


res.json({

success:true,

message:"User blocked"

});


};







// ======================================
// UNBLOCK USER
// ======================================

exports.unblockUser = async(req,res)=>{


await pool.query(

`
UPDATE users
SET status='active'
WHERE id=?

`,

[req.params.id]

);



res.json({

success:true,

message:"User activated"

});


};