
const pool = require("../config/db");

/*
==================================================
CREATE TRANSFER REQUEST - USER
==================================================
POST /api/transfers/create
*/
exports.createTransferRequest = async (req, res) => {
    try {

        /*
        ==========================================
        USER AUTHENTICATION
        ==========================================
        */

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required."
            });
        }


        /*
        ==========================================
        REQUEST DATA
        ==========================================
        */

        const {
            country,
            bank,
            accountNumber,
            accountName,
            currency,
            amount,
            fee,
            description,
            transactionPin,
            reference
        } = req.body;


        /*
        ==========================================
        VALIDATION
        ==========================================
        */

        if (!country) {
            return res.status(400).json({
                success: false,
                message: "Recipient country is required."
            });
        }


        if (!bank) {
            return res.status(400).json({
                success: false,
                message: "Recipient bank is required."
            });
        }


        if (!accountNumber) {
            return res.status(400).json({
                success: false,
                message: "Recipient account number is required."
            });
        }


        if (!accountName) {
            return res.status(400).json({
                success: false,
                message: "Recipient account name is required."
            });
        }


        if (
            !amount ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid transfer amount."
            });
        }


        if (!transactionPin) {
            return res.status(400).json({
                success: false,
                message: "Transaction PIN is required."
            });
        }


        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Transfer reference is required."
            });
        }


        /*
        ==========================================
        CONVERT NUMBERS
        ==========================================
        */

        const transferAmount =
            Number(amount);


        /*
        ==========================================
        TRANSFER FEE
        15% OF TRANSFER AMOUNT
        ==========================================
        */

        const calculatedFee =
            transferAmount * 0.15;


        /*
        ==========================================
        TOTAL DEBIT
        ==========================================
        */

        const totalAmount =
            transferAmount +
            calculatedFee;


        /*
        ==========================================
        GET USER
        ==========================================
        */

        const [users] = await pool.query(
            `
            SELECT
                id,
                full_name,
                balance,
                transaction_pin
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [userId]
        );


        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }


        const user =
            users[0];


        /*
        ==========================================
        VERIFY TRANSACTION PIN
        ==========================================
        */

        if (
            String(user.transaction_pin || "") !==
            String(transactionPin)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid transaction PIN."
            });

        }


        /*
        ==========================================
        CHECK BALANCE
        ==========================================
        */

        if (
            Number(user.balance || 0) <
            totalAmount
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Insufficient account balance for the transfer amount and fee."
            });

        }


        /*
        ==========================================
        CHECK DUPLICATE REFERENCE
        ==========================================
        */

        const [existingTransfers] =
            await pool.query(
                `
                SELECT id
                FROM transfers
                WHERE reference = ?
                LIMIT 1
                `,
                [reference]
            );


        if (
            existingTransfers.length > 0
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "A transfer with this reference already exists."
            });

        }


        /*
        ==========================================
        CREATE PENDING TRANSFER
        ==========================================

        IMPORTANT:

        Money is NOT deducted here.

        It is deducted only when admin approves
        the transfer.
        ==========================================
        */

        const [result] =
            await pool.query(
                `
                INSERT INTO transfers
                (
                    user_id,
                    country,
                    bank,
                    account_number,
                    account_name,
                    currency,
                    amount,
                    fee,
                    description,
                    reference,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    country,
                    bank,
                    accountNumber,
                    accountName,
                    currency || "USD",
                    transferAmount,
                    calculatedFee,
                    description || "",
                    reference,
                    "PENDING"
                ]
            );


        /*
        ==========================================
        SUCCESS
        ==========================================
        */

        return res.status(201).json({

            success: true,

            message:
                "Transfer request submitted successfully and is awaiting admin approval.",

            transferId:
                result.insertId,

            reference,

            status:
                "PENDING",

            amount:
                transferAmount,

            fee:
                calculatedFee,

            total:
                totalAmount

        });

    }

    catch (error) {

        console.error(
            "CREATE TRANSFER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Server error while creating transfer."

        });

    }
};


/*
==================================================
GET USER'S OWN TRANSFERS
==================================================
GET /api/transfers/my
*/
exports.getUserTransfers = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id;


        if (!userId) {

            return res.status(401).json({
                success: false,
                message:
                    "User authentication required."
            });

        }


        const [transfers] =
            await pool.query(
                `
                SELECT
                    id,
                    country,
                    bank,
                    account_number,
                    account_name,
                    currency,
                    amount,
                    fee,
                    description,
                    reference,
                    status,
                    admin_note,
                    approved_by,
                    approved_at,
                    created_at
                FROM transfers
                WHERE user_id = ?
                ORDER BY created_at DESC
                `,
                [userId]
            );


        return res.status(200).json({

            success: true,

            count:
                transfers.length,

            transfers

        });

    }

    catch (error) {

        console.error(
            "GET USER TRANSFERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to retrieve transfers."

        });

    }

};


/*
==================================================
GET PENDING TRANSFERS - ADMIN
==================================================
GET /api/admin/transfers/pending
*/
exports.getPendingTransfers = async (
    req,
    res
) => {

    try {

        /*
        ==========================================
        ADMIN AUTHENTICATION
        ==========================================
        */

        if (!req.admin) {

            return res.status(401).json({

                success: false,

                message:
                    "Administrator authentication required."

            });

        }


        /*
        ==========================================
        GET PENDING TRANSFERS
        ==========================================
        */

        const [transfers] =
            await pool.query(
                `
                SELECT

                    transfers.id,

                    transfers.user_id,

                    transfers.country,

                    transfers.bank,

                    transfers.account_number,

                    transfers.account_name,

                    transfers.currency,

                    transfers.amount,

                    transfers.fee,

                    transfers.description,

                    transfers.reference,

                    transfers.status,

                    transfers.admin_note,

                    transfers.approved_by,

                    transfers.approved_at,

                    transfers.created_at,

                    users.full_name,

                    users.email,

                    users.phone,

                    users.account_number
                        AS sender_account_number

                FROM transfers

                INNER JOIN users
                    ON users.id =
                       transfers.user_id

                WHERE transfers.status =
                      'PENDING'

                ORDER BY
                    transfers.created_at DESC
                `
            );


        return res.status(200).json({

            success: true,

            count:
                transfers.length,

            transfers

        });

    }

    catch (error) {

        console.error(
            "GET PENDING TRANSFERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to retrieve pending transfers."

        });

    }

};


/*
==================================================
APPROVE TRANSFER - ADMIN
==================================================
PUT /api/admin/transfers/:id/approve
*/
// exports.approveTransfer = async (
//     req,
//     res
// ) => {

//     const connection =
//         await pool.getConnection();


//     try {

//         /*
//         ==========================================
//         ADMIN AUTHENTICATION
//         ==========================================
//         */

//         if (!req.admin) {

//             connection.release();

//             return res.status(401).json({

//                 success: false,

//                 message:
//                     "Administrator authentication required."

//             });

//         }


//         const {
//             id
//         } = req.params;


//         const adminId =
//             req.admin.id;


//         /*
//         ==========================================
//         START DATABASE TRANSACTION
//         ==========================================
//         */

//         await connection.beginTransaction();


//         /*
//         ==========================================
//         LOCK TRANSFER
//         ==========================================
//         */

//         const [transfers] =
//             await connection.query(
//                 `
//                 SELECT *
//                 FROM transfers
//                 WHERE id = ?
//                 LIMIT 1
//                 FOR UPDATE
//                 `,
//                 [id]
//             );


//         if (
//             transfers.length === 0
//         ) {

//             await connection.rollback();

//             connection.release();

//             return res.status(404).json({

//                 success: false,

//                 message:
//                     "Transfer not found."

//             });

//         }


//         const transfer =
//             transfers[0];


//         /*
//         ==========================================
//         CHECK STATUS
//         ==========================================
//         */

//         if (
//             transfer.status !==
//             "PENDING"
//         ) {

//             await connection.rollback();

//             connection.release();

//             return res.status(400).json({

//                 success: false,

//                 message:
//                     `Transfer is already ${transfer.status}.`

//             });

//         }


//         /*
//         ==========================================
//         LOCK USER ACCOUNT
//         ==========================================
//         */

//         const [users] =
//             await connection.query(
//                 `
//                 SELECT
//                     id,
//                     balance
//                 FROM users
//                 WHERE id = ?
//                 LIMIT 1
//                 FOR UPDATE
//                 `,
//                 [transfer.user_id]
//             );


//         if (
//             users.length === 0
//         ) {

//             throw new Error(
//                 "Sender account not found."
//             );

//         }


//         const user =
//             users[0];


//         /*
//         ==========================================
//         CALCULATE TOTAL
//         ==========================================
//         */

//         const transferAmount =
//             Number(
//                 transfer.amount || 0
//             );


//         const transferFee =
//             Number(
//                 transfer.fee || 0
//             );


//         const totalAmount =
//             transferAmount +
//             transferFee;


//         /*
//         ==========================================
//         CHECK BALANCE AGAIN
//         ==========================================
//         */

//         if (
//             Number(user.balance || 0) <
//             totalAmount
//         ) {

//             throw new Error(
//                 "Sender has insufficient balance."
//             );

//         }


//         /*
//         ==========================================
//         DEDUCT MONEY
//         ==========================================
//         */

//         await connection.query(
//             `
//             UPDATE users
//             SET balance =
//                 balance - ?
//             WHERE id = ?
//             `,
//             [
//                 totalAmount,
//                 transfer.user_id
//             ]
//         );


//         /*
//         ==========================================
//         UPDATE TRANSFER
//         ==========================================
//         */

//         await connection.query(
//             `
//             UPDATE transfers
//             SET
//                 status = 'APPROVED',
//                 approved_by = ?,
//                 approved_at =
//                     CURRENT_TIMESTAMP
//             WHERE id = ?
//             `,
//             [
//                 adminId,
//                 id
//             ]
//         );


//         /*
//         ==========================================
//         COMMIT
//         ==========================================
//         */

//         await connection.commit();


//         return res.status(200).json({

//             success: true,

//             message:
//                 "Transfer approved successfully.",

//             transferId:
//                 id,

//             status:
//                 "APPROVED"

//         });

//     }

//     catch (error) {

//         await connection.rollback();

//         console.error(
//             "APPROVE TRANSFER ERROR:",
//             error
//         );

//         return res.status(500).json({

//             success: false,

//             message:
//                 error.message ||
//                 "Failed to approve transfer."

//         });

//     }

//     finally {

//         connection.release();

//     }

// };

/*
==========================================
APPROVE TRANSFER - ADMIN

PUT /api/admin/transfers/:id/approve
==========================================
*/

exports.approveTransfer = async (req, res) => {

    const connection =
        await pool.getConnection();

    try {

        /*
        ==========================================
        ADMIN AUTHENTICATION
        ==========================================
        */

        if (!req.admin) {

            return res.status(401).json({

                success: false,

                message:
                    "Administrator authentication required."

            });

        }


        const { id } = req.params;

        const adminId =
            req.admin.id;


        /*
        ==========================================
        START DATABASE TRANSACTION
        ==========================================
        */

        await connection.beginTransaction();


        /*
        ==========================================
        GET AND LOCK TRANSFER
        ==========================================
        */

        const [transfers] =
            await connection.query(
                `
                SELECT
                    *
                FROM transfers
                WHERE id = ?
                LIMIT 1
                FOR UPDATE
                `,
                [id]
            );


        if (transfers.length === 0) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Transfer not found."

            });

        }


        const transfer =
            transfers[0];


        /*
        ==========================================
        CHECK STATUS
        ==========================================
        */

        if (
            String(transfer.status).toUpperCase() !==
            "PENDING"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    `Transfer is already ${transfer.status}.`

            });

        }


        /*
        ==========================================
        GET AND LOCK USER
        ==========================================
        */

        const [users] =
            await connection.query(
                `
                SELECT
                    id,
                    balance
                FROM users
                WHERE id = ?
                LIMIT 1
                FOR UPDATE
                `,
                [transfer.user_id]
            );


        if (users.length === 0) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Sender account not found."

            });

        }


        const user =
            users[0];


        /*
        ==========================================
        TRANSFER AMOUNT
        ==========================================
        */

        const transferAmount =
            Number(
                transfer.amount || 0
            );


        /*
        ==========================================
        TRANSFER FEE
        ==========================================
        */

        const transferFee =
            Number(
                transfer.fee || 0
            );


        /*
        ==========================================
        TOTAL AMOUNT TO DEDUCT
        ==========================================
        */

        const totalDebit =
            transferAmount +
            transferFee;


        /*
        ==========================================
        CURRENT BALANCE
        ==========================================
        */

        const currentBalance =
            Number(
                user.balance || 0
            );


        /*
        ==========================================
        CHECK BALANCE
        ==========================================
        */

        if (
            currentBalance <
            totalDebit
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Sender has insufficient balance for the transfer amount and fee."

            });

        }


        /*
        ==========================================
        NEW BALANCE
        ==========================================
        */

        const newBalance =
            currentBalance -
            totalDebit;


        /*
        ==========================================
        DEDUCT USER BALANCE
        ==========================================
        */

        await connection.query(
            `
            UPDATE users
            SET balance = ?
            WHERE id = ?
            `,
            [
                newBalance,
                transfer.user_id
            ]
        );


        /*
        ==========================================
        INSERT INTO TRANSACTIONS
        ==========================================

        This creates the user's transaction
        history record.

        ==========================================
        */

        const [transactionResult] =
            await connection.query(
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

                VALUES
                (
                    ?,
                    'TRANSFER_OUT',
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'APPROVED',
                    ?,
                    CURRENT_TIMESTAMP
                )
                `,
                [

                    /*
                    USER
                    */
                    transfer.user_id,


                    /*
                    TOTAL DEDUCTED

                    Example:

                    Amount = $100
                    Fee = $15

                    Transaction amount = $115
                    */
                    totalDebit,


                    /*
                    BALANCE AFTER
                    */
                    newBalance,


                    /*
                    UNIQUE TRANSFER REFERENCE
                    */
                    transfer.reference,


                    /*
                    RECIPIENT ACCOUNT
                    */
                    transfer.account_number,


                    /*
                    DESCRIPTION
                    */
                    transfer.description ||
                    `Transfer to ${transfer.account_name}`,


                    /*
                    ADMIN WHO APPROVED IT
                    */
                    String(adminId)

                ]
            );


        /*
        ==========================================
        UPDATE TRANSFERS TABLE
        ==========================================
        */

        await connection.query(
            `
            UPDATE transfers
            SET
                status = 'APPROVED',
                approved_by = ?,
                approved_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [
                String(adminId),
                id
            ]
        );


        /*
        ==========================================
        COMMIT ALL CHANGES
        ==========================================
        */

        await connection.commit();


        /*
        ==========================================
        SUCCESS
        ==========================================
        */

        return res.status(200).json({

            success: true,

            message:
                "Transfer approved successfully. Balance deducted and transaction recorded.",

            transferId:
                id,

            transactionId:
                transactionResult.insertId,

            reference:
                transfer.reference,

            status:
                "APPROVED",

            amount:
                transferAmount,

            fee:
                transferFee,

            totalDebit:
                totalDebit,

            balanceAfter:
                newBalance

        });

    }

    catch (error) {

        /*
        ==========================================
        ROLLBACK EVERYTHING
        ==========================================
        */

        try {

            await connection.rollback();

        }

        catch (rollbackError) {

            console.error(
                "ROLLBACK ERROR:",
                rollbackError
            );

        }


        console.error(
            "APPROVE TRANSFER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to approve transfer."

        });

    }

    finally {

        connection.release();

    }

};


/*
==================================================
REJECT TRANSFER - ADMIN
==================================================
PUT /api/admin/transfers/:id/reject
*/
exports.rejectTransfer = async (
    req,
    res
) => {

    try {

        /*
        ==========================================
        ADMIN AUTHENTICATION
        ==========================================
        */

        if (!req.admin) {

            return res.status(401).json({

                success: false,

                message:
                    "Administrator authentication required."

            });

        }


        const {
            id
        } = req.params;


        const {
            reason
        } = req.body;


        /*
        ==========================================
        VALIDATE REASON
        ==========================================
        */

        if (
            !reason ||
            !reason.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Rejection reason is required."

            });

        }


        /*
        ==========================================
        GET TRANSFER
        ==========================================
        */

        const [transfers] =
            await pool.query(
                `
                SELECT
                    id,
                    status
                FROM transfers
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        if (
            transfers.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Transfer not found."

            });

        }


        /*
        ==========================================
        CHECK STATUS
        ==========================================
        */

        if (
            transfers[0].status !==
            "PENDING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Transfer is already ${transfers[0].status}.`

            });

        }


        /*
        ==========================================
        REJECT
        ==========================================
        */

        await pool.query(
            `
            UPDATE transfers
            SET
                status = 'REJECTED',
                admin_note = ?
            WHERE id = ?
            `,
            [
                reason.trim(),
                id
            ]
        );


        return res.status(200).json({

            success: true,

            message:
                "Transfer rejected successfully.",

            transferId:
                id,

            status:
                "REJECTED"

        });

    }

    catch (error) {

        console.error(
            "REJECT TRANSFER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to reject transfer."

        });

    }

};


/*
==================================================
GET ALL TRANSFERS - ADMIN
==================================================
GET /api/admin/transfers
*/
exports.getAllTransfers = async (
    req,
    res
) => {

    try {

        if (!req.admin) {

            return res.status(401).json({

                success: false,

                message:
                    "Administrator authentication required."

            });

        }


        const [transfers] =
            await pool.query(
                `
                SELECT

                    transfers.*,

                    users.full_name,

                    users.email,

                    users.phone,

                    users.account_number
                        AS sender_account_number

                FROM transfers

                INNER JOIN users
                    ON users.id =
                       transfers.user_id

                ORDER BY
                    transfers.created_at DESC
                `
            );


        return res.status(200).json({

            success: true,

            count:
                transfers.length,

            transfers

        });

    }

    catch (error) {

        console.error(
            "GET ALL TRANSFERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to retrieve transfers."

        });

    }

};