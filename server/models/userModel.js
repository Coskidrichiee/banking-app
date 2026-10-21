const pool = require("../config/db");

// =========================================
// CREATE USER
// =========================================

const createUser = async ({
    fullName,
    email,
    phone,
    accountNumber,
    passwordHash
}) => {

    const [result] = await pool.execute(
        `
        INSERT INTO users
        (
            full_name,
            email,
            phone,
            account_number,
            password_hash
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            fullName,
            email,
            phone,
            accountNumber,
            passwordHash
        ]
    );

    return result.insertId;
};


// =========================================
// FIND USER BY EMAIL
// =========================================

const findUserByEmail = async (email) => {

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;
};


// =========================================
// FIND USER BY ID
// =========================================

const findUserById = async (id) => {

    const [rows] = await pool.execute(
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
            created_at,
            updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
};


// =========================================
// FIND USER WITH PASSWORD
// =========================================

const findUserWithPasswordById = async (id) => {

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
};


// =========================================
// FIND USER BY ACCOUNT NUMBER
// =========================================

const findUserByAccountNumber = async (accountNumber) => {

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM users
        WHERE account_number = ?
        LIMIT 1
        `,
        [accountNumber]
    );

    return rows[0] || null;
};


// =========================================
// UPDATE PROFILE PICTURE
// =========================================

const updateProfilePicture = async (
    userId,
    profilePicture
) => {

    await pool.execute(
        `
        UPDATE users
        SET profile_picture = ?
        WHERE id = ?
        `,
        [
            profilePicture,
            userId
        ]
    );

    return findUserById(userId);
};


// =========================================
// UPDATE PROFILE
// =========================================

const updateProfile = async (
    userId,
    {
        fullName,
        phone,
        address,
        city,
        state,
        country
    }
) => {

    await pool.execute(
        `
        UPDATE users
        SET
            full_name = ?,
            phone = ?,
            address = ?,
            city = ?,
            state = ?,
            country = ?
        WHERE id = ?
        `,
        [
            fullName,
            phone,
            address || null,
            city || null,
            state || null,
            country || "Nigeria",
            userId
        ]
    );

    return findUserById(userId);
};


// =========================================
// EXPORTS
// =========================================

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findUserWithPasswordById,
    findUserByAccountNumber,
    updateProfile,
    updateProfilePicture
};