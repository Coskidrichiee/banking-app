const pool = require("../config/db");

/*
==================================================
HELPER
Get the admin identity from the JWT
==================================================
*/

const getAdminIdentity = (req) => {

    return String(
        req.admin?.email ||
        req.admin?.username ||
        req.admin?.name ||
        req.admin?.id ||
        "ADMIN"
    );

};


/*
==================================================
GET PENDING TRANSACTIONS
==================================================
*/

const getPendingTransactions = async (
    req,
    res,
    next
) => {

    try {

        const [rows] = await pool.execute(
            `
            SELECT
                t.id,
                t.user_id,
                t.type,
                t.amount,
                t.balance_after,
                t.reference,
                t.related_account,
                t.description,
                t.created_at,
                t.status,

                u.full_name,
                u.account_number

            FROM transactions t

            INNER JOIN users u
                ON u.id = t.user_id

            WHERE t.status = 'PENDING'

            ORDER BY t.created_at DESC
            `
        );


        return res.json({

            success: true,

            transactions: rows

        });

    } catch (error) {

        console.error(
            "Get pending transactions error:",
            error
        );

        next(error);

    }

};


/*
==================================================
GET ALL TRANSACTIONS
ADMIN
==================================================
*/

const getAllTransactions = async (
    req,
    res,
    next
) => {

    try {

        const limit =
            Math.min(
                Number(req.query.limit) || 100,
                500
            );


        const [rows] = await pool.execute(
            `
            SELECT
                t.id,
                t.user_id,
                t.type,
                t.amount,
                t.balance_after,
                t.reference,
                t.related_account,
                t.description,
                t.created_at,
                t.status,
                t.approved_by,
                t.approved_at,

                u.full_name,
                u.account_number

            FROM transactions t

            INNER JOIN users u
                ON u.id = t.user_id

            ORDER BY t.created_at DESC

            LIMIT ${limit}
            `
        );


        return res.json({

            success: true,

            transactions: rows

        });

    } catch (error) {

        console.error(
            "Get all transactions error:",
            error
        );

        next(error);

    }

};


/*
==================================================
APPROVE TRANSACTION
==================================================

DEPOSIT:
    balance + amount

WITHDRAWAL:
    balance - amount

TRANSFER:
    sender - amount
    receiver + amount

Everything happens inside ONE database
transaction.

==================================================
*/

const approveTransaction = async (
    req,
    res,
    next
) => {

    const transactionId =
        Number(req.params.id);


    if (
        !Number.isInteger(transactionId) ||
        transactionId <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid transaction ID."

        });

    }


    const connection =
        await pool.getConnection();


    try {

        await connection.beginTransaction();


        /*
        ==========================================
        LOCK THE TRANSACTION
        ==========================================
        */

        const [transactionRows] =
            await connection.execute(
                `
                SELECT
                    *
                FROM transactions
                WHERE id = ?
                FOR UPDATE
                `,
                [transactionId]
            );


        const transaction =
            transactionRows[0];


        if (!transaction) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found."

            });

        }


        /*
        ==========================================
        PREVENT DOUBLE APPROVAL
        ==========================================
        */

        if (
            transaction.status ===
            "APPROVED"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "This transaction has already been approved."

            });

        }


        /*
        ==========================================
        PREVENT APPROVING REJECTED TRANSACTION
        ==========================================
        */

        if (
            transaction.status ===
            "REJECTED"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "A rejected transaction cannot be approved."

            });

        }


        /*
        ==========================================
        ONLY PENDING TRANSACTIONS CAN BE APPROVED
        ==========================================
        */

        if (
            transaction.status !==
            "PENDING"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Only pending transactions can be approved."

            });

        }


        const adminIdentity =
            getAdminIdentity(req);


        /*
        ==========================================
        DEPOSIT
        ==========================================
        */

        if (
            transaction.type ===
            "DEPOSIT"
        ) {

            const [users] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        balance
                    FROM users
                    WHERE id = ?
                    FOR UPDATE
                    `,
                    [transaction.user_id]
                );


            const user =
                users[0];


            if (!user) {

                await connection.rollback();

                return res.status(404).json({

                    success: false,

                    message:
                        "User account not found."

                });

            }


            const currentBalance =
                Number(user.balance);


            const amount =
                Number(transaction.amount);


            const newBalance =
                currentBalance + amount;


            /*
            Update actual account balance
            */

            await connection.execute(
                `
                UPDATE users
                SET balance = ?
                WHERE id = ?
                `,
                [
                    newBalance,
                    user.id
                ]
            );


            /*
            Update transaction
            */

            await connection.execute(
                `
                UPDATE transactions
                SET
                    balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    newBalance,
                    adminIdentity,
                    transaction.id
                ]
            );


            await connection.commit();


            return res.json({

                success: true,

                message:
                    "Deposit approved successfully.",

                reference:
                    transaction.reference,

                amount,

                balance:
                    newBalance,

                status:
                    "APPROVED"

            });

        }


        /*
        ==========================================
        WITHDRAWAL
        ==========================================
        */

        if (
            transaction.type ===
            "WITHDRAWAL"
        ) {

            const [users] =
                await connection.execute(
                    `
                    SELECT
                        id,
                        balance
                    FROM users
                    WHERE id = ?
                    FOR UPDATE
                    `,
                    [transaction.user_id]
                );


            const user =
                users[0];


            if (!user) {

                await connection.rollback();

                return res.status(404).json({

                    success: false,

                    message:
                        "User account not found."

                });

            }


            const currentBalance =
                Number(user.balance);


            const amount =
                Number(transaction.amount);


            /*
            IMPORTANT:

            Check the ACTUAL current balance
            again at approval time.
            */

            if (
                currentBalance < amount
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Insufficient balance. Withdrawal cannot be approved."

                });

            }


            const newBalance =
                currentBalance - amount;


            /*
            Deduct money
            */

            await connection.execute(
                `
                UPDATE users
                SET balance = ?
                WHERE id = ?
                `,
                [
                    newBalance,
                    user.id
                ]
            );


            /*
            Save actual balance_after
            */

            await connection.execute(
                `
                UPDATE transactions
                SET
                    balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    newBalance,
                    adminIdentity,
                    transaction.id
                ]
            );


            await connection.commit();


            return res.json({

                success: true,

                message:
                    "Withdrawal approved successfully.",

                reference:
                    transaction.reference,

                amount,

                balance:
                    newBalance,

                status:
                    "APPROVED"

            });

        }


        /*
        ==========================================
        TRANSFER
        ==========================================
        */

        if (
            transaction.type ===
            "TRANSFER_OUT"
        ) {

            /*
            The TRANSFER_IN transaction is linked
            using:

                TRANSFER_OUT reference
                TRANSFER_IN reference = reference-IN
            */

            const inReference =
                `${transaction.reference}-IN`;


            /*
            Lock the corresponding transfer-in
            */

            const [transferRows] =
                await connection.execute(
                    `
                    SELECT
                        *
                    FROM transactions
                    WHERE reference = ?
                    AND type = 'TRANSFER_IN'
                    FOR UPDATE
                    `,
                    [inReference]
                );


            const transferIn =
                transferRows[0];


            if (!transferIn) {

                await connection.rollback();

                return res.status(404).json({

                    success: false,

                    message:
                        "Matching transfer transaction was not found."

                });

            }


            /*
            Both sides must still be pending.
            */

            if (
                transferIn.status !==
                "PENDING"
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Matching transfer is no longer pending."

                });

            }


            /*
            Get both users.

            We lock them in ID order to reduce
            deadlock problems.
            */

            const senderId =
                Number(transaction.user_id);


            const receiverId =
                Number(transferIn.user_id);


            const firstId =
                Math.min(
                    senderId,
                    receiverId
                );


            const secondId =
                Math.max(
                    senderId,
                    receiverId
                );


            const [users] =
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
                users.find(
                    user =>
                        Number(user.id) ===
                        senderId
                );


            const receiver =
                users.find(
                    user =>
                        Number(user.id) ===
                        receiverId
                );


            if (
                !sender ||
                !receiver
            ) {

                await connection.rollback();

                return res.status(404).json({

                    success: false,

                    message:
                        "Unable to locate transfer accounts."

                });

            }


            const amount =
                Number(transaction.amount);


            const senderBalance =
                Number(sender.balance);


            const receiverBalance =
                Number(receiver.balance);


            /*
            Check sender's ACTUAL balance
            again at approval.
            */

            if (
                senderBalance < amount
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Insufficient sender balance. Transfer cannot be approved."

                });

            }


            const senderNewBalance =
                senderBalance - amount;


            const receiverNewBalance =
                receiverBalance + amount;


            /*
            ==========================================
            UPDATE SENDER
            ==========================================
            */

            await connection.execute(
                `
                UPDATE users
                SET balance = ?
                WHERE id = ?
                `,
                [
                    senderNewBalance,
                    sender.id
                ]
            );


            /*
            ==========================================
            UPDATE RECEIVER
            ==========================================
            */

            await connection.execute(
                `
                UPDATE users
                SET balance = ?
                WHERE id = ?
                `,
                [
                    receiverNewBalance,
                    receiver.id
                ]
            );


            /*
            ==========================================
            APPROVE TRANSFER OUT
            ==========================================
            */

            await connection.execute(
                `
                UPDATE transactions
                SET
                    balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    senderNewBalance,
                    adminIdentity,
                    transaction.id
                ]
            );


            /*
            ==========================================
            APPROVE TRANSFER IN
            ==========================================
            */

            await connection.execute(
                `
                UPDATE transactions
                SET
                    balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    receiverNewBalance,
                    adminIdentity,
                    transferIn.id
                ]
            );


            await connection.commit();


            return res.json({

                success: true,

                message:
                    "Transfer approved successfully.",

                reference:
                    transaction.reference,

                amount,

                sender: {

                    accountNumber:
                        sender.account_number,

                    balance:
                        senderNewBalance

                },

                receiver: {

                    accountNumber:
                        receiver.account_number,

                    balance:
                        receiverNewBalance

                },

                status:
                    "APPROVED"

            });

        }


        /*
        ==========================================
        UNKNOWN TRANSACTION TYPE
        ==========================================
        */

        await connection.rollback();

        return res.status(400).json({

            success: false,

            message:
                "Unsupported transaction type."

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            "Approve transaction error:",
            error
        );

        next(error);

    } finally {

        connection.release();

    }

};


/*
==================================================
REJECT TRANSACTION
==================================================

Rejecting a transaction does NOT change
the user's balance because the balance was
never changed while the transaction was pending.

For transfers, both TRANSFER_OUT and
TRANSFER_IN are rejected together.
==================================================
*/

const rejectTransaction = async (
    req,
    res,
    next
) => {

    const transactionId =
        Number(req.params.id);


    if (
        !Number.isInteger(transactionId) ||
        transactionId <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid transaction ID."

        });

    }


    const connection =
        await pool.getConnection();


    try {

        await connection.beginTransaction();


        /*
        Lock main transaction
        */

        const [rows] =
            await connection.execute(
                `
                SELECT *
                FROM transactions
                WHERE id = ?
                FOR UPDATE
                `,
                [transactionId]
            );


        const transaction =
            rows[0];


        if (!transaction) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found."

            });

        }


        if (
            transaction.status ===
            "APPROVED"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "An approved transaction cannot be rejected."

            });

        }


        if (
            transaction.status ===
            "REJECTED"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "This transaction has already been rejected."

            });

        }


        if (
            transaction.status !==
            "PENDING"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Only pending transactions can be rejected."

            });

        }


        const adminIdentity =
            getAdminIdentity(req);


        /*
        ==========================================
        NORMAL TRANSACTION
        ==========================================
        */

        if (
            transaction.type !==
            "TRANSFER_OUT" &&
            transaction.type !==
            "TRANSFER_IN"
        ) {

            await connection.execute(
                `
                UPDATE transactions
                SET
                    status = 'REJECTED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [
                    adminIdentity,
                    transaction.id
                ]
            );


            await connection.commit();


            return res.json({

                success: true,

                message:
                    "Transaction rejected successfully.",

                reference:
                    transaction.reference,

                status:
                    "REJECTED"

            });

        }


        /*
        ==========================================
        TRANSFER REJECTION
        ==========================================
        */

        let transferOut =
            transaction;


        let transferIn = null;


        if (
            transaction.type ===
            "TRANSFER_OUT"
        ) {

            const [rowsIn] =
                await connection.execute(
                    `
                    SELECT *
                    FROM transactions
                    WHERE reference = ?
                    AND type = 'TRANSFER_IN'
                    FOR UPDATE
                    `,
                    [
                        `${transaction.reference}-IN`
                    ]
                );


            transferIn =
                rowsIn[0];

        } else {

            transferIn =
                transaction;


            const baseReference =
                transaction.reference.endsWith(
                    "-IN"
                )
                    ? transaction.reference.slice(
                        0,
                        -3
                    )
                    : null;


            if (!baseReference) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid transfer reference."

                });

            }


            const [rowsOut] =
                await connection.execute(
                    `
                    SELECT *
                    FROM transactions
                    WHERE reference = ?
                    AND type = 'TRANSFER_OUT'
                    FOR UPDATE
                    `,
                    [baseReference]
                );


            transferOut =
                rowsOut[0];

        }


        if (!transferOut || !transferIn) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Matching transfer transaction not found."

            });

        }


        if (
            transferOut.status !==
                "PENDING" ||
            transferIn.status !==
                "PENDING"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "The transfer is no longer pending."

            });

        }


        /*
        Reject BOTH sides.
        */

        await connection.execute(
            `
            UPDATE transactions
            SET
                status = 'REJECTED',
                approved_by = ?,
                approved_at = CURRENT_TIMESTAMP
            WHERE id IN (?, ?)
            `,
            [
                adminIdentity,
                transferOut.id,
                transferIn.id
            ]
        );


        await connection.commit();


        return res.json({

            success: true,

            message:
                "Transfer rejected successfully.",

            reference:
                transferOut.reference,

            status:
                "REJECTED"

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            "Reject transaction error:",
            error
        );

        next(error);

    } finally {

        connection.release();

    }

};


module.exports = {

    getPendingTransactions,

    getAllTransactions,

    approveTransaction,

    rejectTransaction

};