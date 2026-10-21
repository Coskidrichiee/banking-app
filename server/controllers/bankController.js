const pool = require("../config/db");

const {
    findUserByAccountNumber
} = require("../models/userModel");

const {
    createTransaction,
    getUserTransactions
} = require("../models/transactionModel");

const generateReference = require(
    "../utils/generateReference"
);


/* =========================================
   GET BALANCE
========================================= */

const getBalance = async (
    req,
    res,
    next
) => {

    try {

        const [rows] =
            await pool.execute(
                `
                SELECT
                    account_number,
                    balance
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [
                    req.user.id
                ]
            );


        if (!rows[0]) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found"

            });

        }


        return res.json({

            success: true,

            accountNumber:
                rows[0].account_number,

            balance:
                Number(rows[0].balance)

        });

    } catch (error) {

        next(error);

    }

};


/* =========================================
   DEPOSIT REQUEST

   Creates PENDING transaction.

   IMPORTANT:
   Money is NOT added here.

   Admin approval will add the money.
========================================= */

const deposit = async (
    req,
    res,
    next
) => {

    const amount =
        Number(req.body.amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Deposit amount must be greater than zero"

        });

    }


    const connection =
        await pool.getConnection();


    try {

        await connection.beginTransaction();


        /*
        ==========================================
        LOCK USER
        ==========================================
        */

        const [users] =
            await connection.execute(
                `
                SELECT
                    id,
                    balance,
                    account_number
                FROM users
                WHERE id = ?
                LIMIT 1
                FOR UPDATE
                `,
                [
                    req.user.id
                ]
            );


        const user =
            users[0];


        if (!user) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Account not found"

            });

        }


        const currentBalance =
            Number(user.balance || 0);


        const reference =
            generateReference("DEP");


        /*
        ==========================================
        CREATE PENDING TRANSACTION
        ==========================================
        */

        await createTransaction(
            connection,
            {

                userId:
                    req.user.id,

                type:
                    "DEPOSIT",

                amount:
                    amount,

                balanceAfter:
                    currentBalance,

                reference:
                    reference,

                relatedAccount:
                    null,

                description:
                    "Account deposit",

                status:
                    "PENDING"

            }
        );


        await connection.commit();


        return res.status(201).json({

            success: true,

            message:
                "Deposit request submitted for approval",

            reference:

                reference,

            amount:

                amount,

            balance:

                currentBalance,

            status:

                "PENDING"

        });


    } catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "DEPOSIT ROLLBACK ERROR:",
                rollbackError
            );

        }


        next(error);

    } finally {

        connection.release();

    }

};


/* =========================================
   WITHDRAWAL REQUEST

   Creates PENDING transaction.

   IMPORTANT:
   Money is NOT deducted here.

   Admin approval will deduct the money.
========================================= */

const withdraw = async (
    req,
    res,
    next
) => {

    const amount =
        Number(req.body.amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Withdrawal amount must be greater than zero"

        });

    }


    const connection =
        await pool.getConnection();


    try {

        await connection.beginTransaction();


        /*
        ==========================================
        LOCK USER
        ==========================================
        */

        const [users] =
            await connection.execute(
                `
                SELECT
                    id,
                    balance,
                    account_number
                FROM users
                WHERE id = ?
                LIMIT 1
                FOR UPDATE
                `,
                [
                    req.user.id
                ]
            );


        const user =
            users[0];


        if (!user) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Account not found"

            });

        }


        const currentBalance =
            Number(user.balance || 0);


        /*
        ==========================================
        CHECK BALANCE
        ==========================================
        */

        if (
            currentBalance < amount
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Insufficient balance"

            });

        }


        const reference =
            generateReference("WDL");


        /*
        ==========================================
        CREATE PENDING TRANSACTION
        ==========================================
        */

        await createTransaction(
            connection,
            {

                userId:
                    req.user.id,

                type:
                    "WITHDRAWAL",

                amount:
                    amount,

                balanceAfter:
                    currentBalance,

                reference:
                    reference,

                relatedAccount:
                    null,

                description:
                    "Account withdrawal",

                status:
                    "PENDING"

            }
        );


        await connection.commit();


        return res.status(201).json({

            success: true,

            message:
                "Withdrawal request submitted for approval",

            reference:
                reference,

            amount:
                amount,

            balance:
                currentBalance,

            status:
                "PENDING"

        });


    } catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "WITHDRAWAL ROLLBACK ERROR:",
                rollbackError
            );

        }


        next(error);

    } finally {

        connection.release();

    }

};


/* =========================================
   TRANSFER REQUEST

   Creates TWO PENDING transactions:

   1. TRANSFER_OUT
   2. TRANSFER_IN

   IMPORTANT:
   NO BALANCE IS CHANGED HERE.

   Admin approval handles the actual
   balance movement.
========================================= */

const transfer = async (
    req,
    res,
    next
) => {

    const {
        accountNumber,
        amount,
        description
    } = req.body;


    const transferAmount =
        Number(amount);


    /*
    ==========================================
    VALIDATE RECIPIENT
    ==========================================
    */

    if (!accountNumber) {

        return res.status(400).json({

            success: false,

            message:
                "Recipient account number is required"

        });

    }


    /*
    ==========================================
    VALIDATE AMOUNT
    ==========================================
    */

    if (
        !Number.isFinite(transferAmount) ||
        transferAmount <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Transfer amount must be greater than zero"

        });

    }


    /*
    ==========================================
    FIND RECIPIENT
    ==========================================
    */

    const recipient =
        await findUserByAccountNumber(
            accountNumber.trim()
        );


    if (!recipient) {

        return res.status(404).json({

            success: false,

            message:
                "Recipient account not found"

        });

    }


    /*
    ==========================================
    PREVENT SELF TRANSFER
    ==========================================
    */

    if (
        Number(recipient.id) ===
        Number(req.user.id)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "You cannot transfer money to your own account"

        });

    }


    const connection =
        await pool.getConnection();


    try {

        await connection.beginTransaction();


        /*
        ==========================================
        LOCK BOTH ACCOUNTS
        ==========================================

        Always lock in ID order to reduce
        deadlock problems.
        */

        const firstId =
            Math.min(
                Number(req.user.id),
                Number(recipient.id)
            );


        const secondId =
            Math.max(
                Number(req.user.id),
                Number(recipient.id)
            );


        const [lockedUsers] =
            await connection.execute(
                `
                SELECT
                    id,
                    account_number,
                    balance,
                    full_name
                FROM users
                WHERE id IN (?, ?)
                ORDER BY id
                FOR UPDATE
                `,
                [
                    firstId,
                    secondId
                ]
            );


        const sender =
            lockedUsers.find(
                user =>
                    Number(user.id) ===
                    Number(req.user.id)
            );


        const receiver =
            lockedUsers.find(
                user =>
                    Number(user.id) ===
                    Number(recipient.id)
            );


        if (
            !sender ||
            !receiver
        ) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Unable to locate transfer accounts"

            });

        }


        const senderBalance =
            Number(sender.balance || 0);


        /*
        ==========================================
        CHECK SENDER BALANCE

        We do NOT deduct here.
        ==========================================
        */

        if (
            senderBalance <
            transferAmount
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Insufficient balance"

            });

        }


        /*
        ==========================================
        GENERATE TRANSFER REFERENCE
        ==========================================
        */

        const reference =
            generateReference("TRF");


        /*
        ==========================================
        TRANSFER OUT
        ==========================================
        */

        await createTransaction(
            connection,
            {

                userId:
                    sender.id,

                type:
                    "TRANSFER_OUT",

                amount:
                    transferAmount,

                balanceAfter:
                    senderBalance,

                reference:
                    reference,

                relatedAccount:
                    receiver.account_number,

                description:
                    description ||
                    `Transfer to ${receiver.account_number}`,

                status:
                    "PENDING"

            }
        );


        /*
        ==========================================
        TRANSFER IN
        ==========================================

        Uses reference-IN so the incoming
        transaction can be linked to the
        outgoing transaction.
        */

        await createTransaction(
            connection,
            {

                userId:
                    receiver.id,

                type:
                    "TRANSFER_IN",

                amount:
                    transferAmount,

                balanceAfter:
                    Number(receiver.balance || 0),

                reference:
                    `${reference}-IN`,

                relatedAccount:
                    sender.account_number,

                description:
                    description ||
                    `Transfer from ${sender.account_number}`,

                status:
                    "PENDING"

            }
        );


        /*
        ==========================================
        COMMIT
        ==========================================
        */

        await connection.commit();


        /*
        ==========================================
        RESPONSE
        ==========================================
        */

        return res.status(201).json({

            success: true,

            message:
                "Transfer request submitted for approval",

            reference:
                reference,

            amount:
                transferAmount,

            recipient: {

                accountNumber:
                    receiver.account_number,

                name:
                    receiver.full_name

            },

            balance:
                senderBalance,

            status:
                "PENDING"

        });


    } catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "TRANSFER ROLLBACK ERROR:",
                rollbackError
            );

        }


        next(error);

    } finally {

        connection.release();

    }

};


/* =========================================
   TRANSACTION HISTORY

   GET /api/bank/transactions
========================================= */

const transactions = async (
    req,
    res,
    next
) => {

    try {

        console.log(
            "=========================================="
        );

        console.log(
            "TRANSACTIONS API REQUEST"
        );

        console.log(
            "REQ.USER:",
            req.user
        );

        console.log(
            "REQ.USER.ID:",
            req.user?.id
        );


        const limit =
            Number(req.query.limit) || 50;


        const data =
            await getUserTransactions(
                req.user.id,
                limit
            );


        console.log(
            "DATA RETURNED:",
            data
        );


        return res.status(200).json({

            success: true,

            transactions: data

        });


    } catch (error) {

        console.error(
            "TRANSACTIONS CONTROLLER ERROR:",
            error
        );

        next(error);

    }

};


/* =========================================
   EXPORTS
========================================= */

module.exports = {

    getBalance,

    deposit,

    withdraw,

    transfer,

    transactions

};