const pool = require("../config/db");

// =====================================================
// GET ADMIN IDENTITY
// =====================================================

const getAdminIdentity = (req) => {

    return String(
        req.admin?.email ||
        req.admin?.username ||
        req.admin?.name ||
        req.admin?.id ||
        "ADMIN"
    );

};


// =====================================================
// GET PENDING TRANSACTIONS
// =====================================================

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
                t.approved_by,
                t.approved_at,

                u.full_name,
                u.account_number

            FROM transactions t

            INNER JOIN users u
                ON u.id = t.user_id

            WHERE t.status = 'PENDING'

            ORDER BY t.created_at DESC
            `
        );


        return res.status(200).json({

            success: true,

            transactions: rows

        });

    }

    catch (error) {

        console.error(
            "Get pending transactions error:",
            error
        );

        next(error);

    }

};


// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

const getAllTransactions = async (
    req,
    res,
    next
) => {

    try {

        let limit =
            Number(req.query.limit) || 100;


        // Prevent invalid limits

        if (
            !Number.isInteger(limit) ||
            limit <= 0
        ) {

            limit = 100;

        }


        // Maximum 500 records

        limit = Math.min(
            limit,
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


        return res.status(200).json({

            success: true,

            count: rows.length,

            transactions: rows

        });

    }

    catch (error) {

        console.error(
            "Get all transactions error:",
            error
        );

        next(error);

    }

};


// =====================================================
// APPROVE TRANSACTION
// =====================================================
//
// DEPOSIT
//     balance + amount
//
// WITHDRAWAL
//     balance - amount
//
// TRANSFER
//     sender - amount
//     receiver + amount
//
// =====================================================

const approveTransaction = async (
    req,
    res,
    next
) => {

    const transactionId =
        Number(req.params.id);


    // Validate ID

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


        // =================================================
        // LOCK TRANSACTION
        // =================================================

        const [transactionRows] =
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
            transactionRows[0];


        if (!transaction) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found."

            });

        }


        // =================================================
        // PREVENT DOUBLE APPROVAL
        // =================================================

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


        // =================================================
        // REJECTED TRANSACTION
        // =================================================

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


        // =================================================
        // ONLY PENDING TRANSACTIONS
        // =================================================

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


        // =================================================
        // DEPOSIT
        // =================================================

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


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid transaction amount."

                });

            }


            const newBalance =
                currentBalance + amount;


            // Update balance

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


            // Approve transaction

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


            return res.status(200).json({

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


        // =================================================
        // WITHDRAWAL
        // =================================================

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


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid transaction amount."

                });

            }


            // Check balance again

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


            // Deduct money

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


            // Approve transaction

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


            return res.status(200).json({

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


        // =================================================
        // TRANSFER
        // =================================================

        if (
            transaction.type ===
            "TRANSFER_OUT"
        ) {

            const inReference =
                `${transaction.reference}-IN`;


            // Find matching transfer-in

            const [transferRows] =
                await connection.execute(
                    `
                    SELECT *
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


            // Both must be pending

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


            const senderId =
                Number(transaction.user_id);


            const receiverId =
                Number(transferIn.user_id);


            if (
                !senderId ||
                !receiverId ||
                senderId === receiverId
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid transfer accounts."

                });

            }


            // Lock both accounts in ID order

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


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid transfer amount."

                });

            }


            const senderBalance =
                Number(sender.balance);


            const receiverBalance =
                Number(receiver.balance);


            // Check sender balance

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


            // Update sender

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


            // Update receiver

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


            // Approve transfer out

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


            // Approve transfer in

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


            return res.status(200).json({

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


        // =================================================
        // UNKNOWN TYPE
        // =================================================

        await connection.rollback();


        return res.status(400).json({

            success: false,

            message:
                "Unsupported transaction type."

        });

    }

    catch (error) {

        await connection.rollback();

        console.error(
            "Approve transaction error:",
            error
        );

        next(error);

    }

    finally {

        connection.release();

    }

};


// =====================================================
// REJECT TRANSACTION
// =====================================================

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


        // =================================================
        // LOCK TRANSACTION
        // =================================================

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


        // =================================================
        // ALREADY APPROVED
        // =================================================

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


        // =================================================
        // ALREADY REJECTED
        // =================================================

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


        // =================================================
        // ONLY PENDING
        // =================================================

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


        // =================================================
        // NORMAL TRANSACTION
        // =================================================

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


            return res.status(200).json({

                success: true,

                message:
                    "Transaction rejected successfully.",

                reference:
                    transaction.reference,

                status:
                    "REJECTED"

            });

        }


        // =================================================
        // TRANSFER REJECTION
        // =================================================

        let transferOut =
            transaction;


        let transferIn =
            null;


        // -----------------------------------------------
        // If selected transaction is TRANSFER_OUT
        // -----------------------------------------------

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

        }


        // -----------------------------------------------
        // If selected transaction is TRANSFER_IN
        // -----------------------------------------------

        else {

            transferIn =
                transaction;


            const reference =
                String(
                    transaction.reference ||
                    ""
                );


            const baseReference =
                reference.endsWith("-IN")
                    ? reference.slice(
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


        // =================================================
        // MATCHING TRANSFER NOT FOUND
        // =================================================

        if (
            !transferOut ||
            !transferIn
        ) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Matching transfer transaction not found."

            });

        }


        // =================================================
        // BOTH MUST BE PENDING
        // =================================================

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


        // =================================================
        // REJECT BOTH SIDES
        // =================================================

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


        return res.status(200).json({

            success: true,

            message:
                "Transfer rejected successfully.",

            reference:
                transferOut.reference,

            status:
                "REJECTED"

        });

    }

    catch (error) {

        await connection.rollback();

        console.error(
            "Reject transaction error:",
            error
        );

        next(error);

    }

    finally {

        connection.release();

    }

};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {

    getPendingTransactions,

    getAllTransactions,

    approveTransaction,

    rejectTransaction

};