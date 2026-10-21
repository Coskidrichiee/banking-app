const pool = require("../config/db");


/* =========================================
   CREATE TRANSACTION
========================================= */

const createTransaction = async (
    connection,
    {
        userId,
        type,
        amount,
        balanceAfter,
        reference,
        relatedAccount,
        description,
        status = "PENDING",
        approvedBy = null,
        approvedAt = null
    }
) => {

    const [result] = await connection.execute(
        `
        INSERT INTO transactions
        (
            user_id,
            type,
            amount,
            balance_after,
            reference,
            related_account,
            description,
            status,
            approved_by,
            approved_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            type,
            amount,
            balanceAfter,
            reference,
            relatedAccount || null,
            description || null,
            status,
            approvedBy || null,
            approvedAt || null
        ]
    );


    return result;

};


/* =========================================
   GET USER TRANSACTIONS
========================================= */

const getUserTransactions = async (
    userId,
    limit = 50
) => {

    const safeLimit = Math.min(
        Math.max(
            Number(limit) || 50,
            1
        ),
        100
    );


    console.log(
        "=========================================="
    );

    console.log(
        "GET USER TRANSACTIONS"
    );

    console.log(
        "USER ID:",
        userId
    );

    console.log(
        "LIMIT:",
        safeLimit
    );


    const [rows] = await pool.execute(
        `
        SELECT
            id,
            user_id,
            type,
            amount,
            balance_after,
            reference,
            related_account,
            description,
            created_at,
            status,
            approved_by,
            approved_at
        FROM transactions
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ${safeLimit}
        `,
        [
            userId
        ]
    );


    console.log(
        "TRANSACTIONS FOUND:",
        rows.length
    );

    console.log(
        "TRANSACTIONS:",
        rows
    );

    console.log(
        "=========================================="
    );


    return rows;

};


module.exports = {

    createTransaction,

    getUserTransactions

};