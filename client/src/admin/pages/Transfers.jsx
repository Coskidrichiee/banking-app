import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    getPendingTransfers,
    approveTransfer,
    rejectTransfer
} from "../../services/api";

import "../css/Transfers.css";


function Transfers() {

    const [transfers, setTransfers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [selectedTransfer, setSelectedTransfer] =
        useState(null);

    const [showDetails, setShowDetails] =
        useState(false);


    /*
    ==========================================
    TOKEN
    ==========================================
    */

    const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token");


    /*
    ==========================================
    LOAD TRANSFERS
    ==========================================
    */

    const loadTransfers = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                if (!token) {

                    setError(
                        "Authentication token not found."
                    );

                    return;

                }


                const response =
                    await getPendingTransfers(
                        token
                    );


                if (response.success) {

                    setTransfers(
                        response.transfers || []
                    );

                } else {

                    setError(
                        response.message ||
                        "Failed to load transfers."
                    );

                }

            } catch (err) {

                console.error(
                    "Load transfers error:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load transfers."
                );

            } finally {

                setLoading(false);

            }

        },
        [token]
    );


    /*
    ==========================================
    INITIAL LOAD
    ==========================================
    */

    useEffect(() => {

        loadTransfers();

    }, [loadTransfers]);


    /*
    ==========================================
    FORMAT MONEY
    ==========================================
    */

    const formatAmount = (
        amount,
        currency = "USD"
    ) => {

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency:
                    currency || "USD",
                minimumFractionDigits: 2
            }
        ).format(
            Number(amount || 0)
        );

    };


    /*
    ==========================================
    FORMAT DATE
    ==========================================
    */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "—";
        }

        return new Date(
            date
        ).toLocaleString(
            "en-US",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    /*
    ==========================================
    FILTER TRANSFERS
    ==========================================
    */

    const filteredTransfers =
        transfers.filter(
            (transfer) => {

                const searchValue =
                    search
                        .toLowerCase()
                        .trim();


                if (!searchValue) {
                    return true;
                }


                return (

                    String(
                        transfer.full_name || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        transfer.bank || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        transfer.account_name || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        transfer.account_number || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        transfer.reference || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        transfer.country || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                );

            }
        );


    /*
    ==========================================
    APPROVE TRANSFER
    ==========================================
    */

    const handleApprove =
        async (transfer) => {

            const confirmed =
                window.confirm(
                    `Approve transfer ${transfer.reference}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(
                    transfer.id
                );

                setError("");


                const response =
                    await approveTransfer(
                        token,
                        transfer.id
                    );


                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to approve transfer."
                    );

                }


                setTransfers(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.id !==
                                transfer.id
                        )
                );


                setSelectedTransfer(null);
                setShowDetails(false);


                window.alert(
                    "Transfer approved successfully."
                );


            } catch (err) {

                console.error(
                    "Approve transfer error:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to approve transfer."
                );

            } finally {

                setActionLoading(null);

            }

        };


    /*
    ==========================================
    REJECT TRANSFER
    ==========================================
    */

    const handleReject =
        async (transfer) => {

            const reason =
                window.prompt(
                    "Enter the reason for rejecting this transfer:"
                );


            if (
                reason === null ||
                !reason.trim()
            ) {

                return;

            }


            try {

                setActionLoading(
                    transfer.id
                );

                setError("");


                const response =
                    await rejectTransfer(
                        token,
                        transfer.id,
                        reason.trim()
                    );


                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to reject transfer."
                    );

                }


                setTransfers(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.id !==
                                transfer.id
                        )
                );


                setSelectedTransfer(null);
                setShowDetails(false);


                window.alert(
                    "Transfer rejected successfully."
                );


            } catch (err) {

                console.error(
                    "Reject transfer error:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to reject transfer."
                );

            } finally {

                setActionLoading(null);

            }

        };


    /*
    ==========================================
    OPEN DETAILS
    ==========================================
    */

    const openDetails =
        (transfer) => {

            setSelectedTransfer(
                transfer
            );

            setShowDetails(true);

        };


    /*
    ==========================================
    CLOSE DETAILS
    ==========================================
    */

    const closeDetails =
        () => {

            if (
                actionLoading !== null
            ) {

                return;

            }

            setShowDetails(false);
            setSelectedTransfer(null);

        };


    /*
    ==========================================
    LOADING
    ==========================================
    */

    if (loading) {

        return (

            <main className="admin-transfers-page">

                <div className="transfers-loading">

                    <div className="loading-spinner"></div>

                    <h2>
                        Loading Transfers
                    </h2>

                    <p>
                        Please wait while we retrieve
                        pending transfer requests.
                    </p>

                </div>

            </main>

        );

    }


    /*
    ==========================================
    MAIN
    ==========================================
    */

    return (

        <main className="admin-transfers-page">

            {/* ==================================
                HEADER
            ================================== */}

            <header className="transfers-header">

                <div className="transfers-title">

                    <div className="title-icon">
                        ⇄
                    </div>

                    <div>

                        <h1>
                            Transfer Requests
                        </h1>

                        <p>
                            Review and manage customer
                            transfer requests.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="refresh-btn"
                    onClick={loadTransfers}
                    disabled={
                        actionLoading !== null
                    }
                >

                    <span>
                        ↻
                    </span>

                    Refresh

                </button>

            </header>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

                <div className="transfers-error">

                    <span>
                        ⚠
                    </span>

                    <div>

                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>

            )}


            {/* ==================================
                STATISTICS
            ================================== */}

            <section className="transfer-stats">

                <div className="transfer-stat-card">

                    <div className="stat-icon">
                        ⏳
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {transfers.length}
                        </strong>

                    </div>

                </div>


                <div className="transfer-stat-card">

                    <div className="stat-icon">
                        $
                    </div>

                    <div>

                        <span>
                            Pending Value
                        </span>

                        <strong>

                            {formatAmount(
                                transfers.reduce(
                                    (
                                        total,
                                        item
                                    ) =>
                                        total +
                                        Number(
                                            item.amount || 0
                                        ) +
                                        Number(
                                            item.fee || 0
                                        ),
                                    0
                                )
                            )}

                        </strong>

                    </div>

                </div>


                <div className="transfer-stat-card">

                    <div className="stat-icon">
                        !
                    </div>

                    <div>

                        <span>
                            Awaiting Review
                        </span>

                        <strong>
                            {transfers.length}
                        </strong>

                    </div>

                </div>

            </section>


            {/* ==================================
                CONTENT CARD
            ================================== */}

            <section className="transfers-card">

                <div className="transfers-toolbar">

                    <div>

                        <h2>
                            Pending Transfers
                        </h2>

                        <p>
                            {filteredTransfers.length}
                            {" "}
                            request
                            {filteredTransfers.length !== 1
                                ? "s"
                                : ""
                            }
                            {" "}
                            found
                        </p>

                    </div>


                    <div className="transfer-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search transfers..."
                        />

                        {search && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                ×
                            </button>

                        )}

                    </div>

                </div>


                {/* ==================================
                    EMPTY STATE
                ================================== */}

                {filteredTransfers.length === 0 ? (

                    <div className="empty-transfers">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <h3>
                            No Pending Transfers
                        </h3>

                        <p>

                            {search
                                ? "No transfers match your search."
                                : "There are currently no transfer requests waiting for approval."
                            }

                        </p>

                        {search && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                Clear Search
                            </button>

                        )}

                    </div>

                ) : (

                    <>
                        {/* ==================================
                            DESKTOP TABLE
                        ================================== */}

                        <div className="transfer-table-container">

                            <table className="transfer-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Recipient
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Reference
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredTransfers.map(
                                        (transfer) => (

                                            <tr
                                                key={
                                                    transfer.id
                                                }
                                            >

                                                {/* CUSTOMER */}

                                                <td>

                                                    <div className="customer-cell">

                                                        <div className="customer-avatar">

                                                            {
                                                                (
                                                                    transfer.full_name ||
                                                                    "U"
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                            }

                                                        </div>

                                                        <div>

                                                            <strong>

                                                                {
                                                                    transfer.full_name ||
                                                                    "Unknown User"
                                                                }

                                                            </strong>

                                                            <span>

                                                                {
                                                                    transfer.country ||
                                                                    "—"
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* RECIPIENT */}

                                                <td>

                                                    <div className="recipient-cell">

                                                        <strong>

                                                            {
                                                                transfer.account_name
                                                            }

                                                        </strong>

                                                        <span>

                                                            {
                                                                transfer.bank
                                                            }

                                                        </span>

                                                        <small>

                                                            {
                                                                transfer.account_number
                                                            }

                                                        </small>

                                                    </div>

                                                </td>


                                                {/* AMOUNT */}

                                                <td>

                                                    <div className="amount-cell">

                                                        <strong>

                                                            {
                                                                formatAmount(
                                                                    transfer.amount,
                                                                    transfer.currency
                                                                )
                                                            }

                                                        </strong>

                                                        {Number(
                                                            transfer.fee || 0
                                                        ) > 0 && (

                                                            <span>

                                                                Fee:{" "}

                                                                {
                                                                    formatAmount(
                                                                        transfer.fee,
                                                                        transfer.currency
                                                                    )
                                                                }

                                                            </span>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* REFERENCE */}

                                                <td>

                                                    <code>

                                                        {
                                                            transfer.reference
                                                        }

                                                    </code>

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    <div className="date-cell">

                                                        {
                                                            formatDate(
                                                                transfer.created_at
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span className="transfer-status pending">

                                                        <span className="status-dot"></span>

                                                        {
                                                            transfer.status
                                                        }

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            type="button"
                                                            className="view-btn"
                                                            onClick={() =>
                                                                openDetails(
                                                                    transfer
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="approve-btn"
                                                            disabled={
                                                                actionLoading ===
                                                                transfer.id
                                                            }
                                                            onClick={() =>
                                                                handleApprove(
                                                                    transfer
                                                                )
                                                            }
                                                        >

                                                            {
                                                                actionLoading ===
                                                                transfer.id
                                                                    ? "..."
                                                                    : "Approve"
                                                            }

                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="reject-btn"
                                                            disabled={
                                                                actionLoading ===
                                                                transfer.id
                                                            }
                                                            onClick={() =>
                                                                handleReject(
                                                                    transfer
                                                                )
                                                            }
                                                        >
                                                            Reject
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* ==================================
                            MOBILE CARDS
                        ================================== */}

                        <div className="mobile-transfer-list">

                            {filteredTransfers.map(
                                (transfer) => (

                                    <article
                                        className="mobile-transfer-card"
                                        key={
                                            transfer.id
                                        }
                                    >

                                        <div className="mobile-card-top">

                                            <div className="customer-cell">

                                                <div className="customer-avatar">

                                                    {
                                                        (
                                                            transfer.full_name ||
                                                            "U"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    }

                                                </div>

                                                <div>

                                                    <strong>

                                                        {
                                                            transfer.full_name ||
                                                            "Unknown User"
                                                        }

                                                    </strong>

                                                    <span>

                                                        {
                                                            transfer.bank
                                                        }

                                                    </span>

                                                </div>

                                            </div>


                                            <span className="transfer-status pending">

                                                <span className="status-dot"></span>

                                                PENDING

                                            </span>

                                        </div>


                                        <div className="mobile-transfer-amount">

                                            <span>
                                                Amount
                                            </span>

                                            <strong>

                                                {
                                                    formatAmount(
                                                        transfer.amount,
                                                        transfer.currency
                                                    )
                                                }

                                            </strong>

                                        </div>


                                        <div className="mobile-transfer-info">

                                            <div>

                                                <span>
                                                    Recipient
                                                </span>

                                                <strong>
                                                    {
                                                        transfer.account_name
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Account
                                                </span>

                                                <strong>
                                                    {
                                                        transfer.account_number
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Reference
                                                </span>

                                                <strong>
                                                    {
                                                        transfer.reference
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Date
                                                </span>

                                                <strong>
                                                    {
                                                        formatDate(
                                                            transfer.created_at
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="mobile-transfer-actions">

                                            <button
                                                type="button"
                                                className="view-btn"
                                                onClick={() =>
                                                    openDetails(
                                                        transfer
                                                    )
                                                }
                                            >
                                                View Details
                                            </button>

                                            <button
                                                type="button"
                                                className="approve-btn"
                                                disabled={
                                                    actionLoading ===
                                                    transfer.id
                                                }
                                                onClick={() =>
                                                    handleApprove(
                                                        transfer
                                                    )
                                                }
                                            >
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                className="reject-btn"
                                                disabled={
                                                    actionLoading ===
                                                    transfer.id
                                                }
                                                onClick={() =>
                                                    handleReject(
                                                        transfer
                                                    )
                                                }
                                            >
                                                Reject
                                            </button>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    </>

                )}

            </section>


            {/* ==================================
                DETAILS MODAL
            ================================== */}

            {showDetails &&
                selectedTransfer && (

                    <div
                        className="transfer-modal-overlay"
                        onClick={closeDetails}
                    >

                        <div
                            className="transfer-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>

                                    <span>
                                        Transfer Request
                                    </span>

                                    <h2>
                                        Transfer Details
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeDetails}
                                    disabled={
                                        actionLoading !==
                                        null
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="modal-status">

                                <span className="transfer-status pending">

                                    <span className="status-dot"></span>

                                    {
                                        selectedTransfer.status
                                    }

                                </span>

                                <code>
                                    {
                                        selectedTransfer.reference
                                    }
                                </code>

                            </div>


                            <div className="details-grid">

                                <div className="details-section">

                                    <h3>
                                        Sender
                                    </h3>

                                    <div className="detail-row">

                                        <span>
                                            Name
                                        </span>

                                        <strong>
                                            {
                                                selectedTransfer.full_name ||
                                                "—"
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div className="details-section">

                                    <h3>
                                        Recipient
                                    </h3>

                                    <div className="detail-row">

                                        <span>
                                            Account Name
                                        </span>

                                        <strong>
                                            {
                                                selectedTransfer.account_name
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-row">

                                        <span>
                                            Bank
                                        </span>

                                        <strong>
                                            {
                                                selectedTransfer.bank
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-row">

                                        <span>
                                            Account Number
                                        </span>

                                        <strong>
                                            {
                                                selectedTransfer.account_number
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-row">

                                        <span>
                                            Country
                                        </span>

                                        <strong>
                                            {
                                                selectedTransfer.country
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div className="details-section">

                                    <h3>
                                        Payment
                                    </h3>

                                    <div className="detail-row">

                                        <span>
                                            Amount
                                        </span>

                                        <strong>

                                            {
                                                formatAmount(
                                                    selectedTransfer.amount,
                                                    selectedTransfer.currency
                                                )
                                            }

                                        </strong>

                                    </div>


                                    <div className="detail-row">

                                        <span>
                                            Fee
                                        </span>

                                        <strong>

                                            {
                                                formatAmount(
                                                    selectedTransfer.fee,
                                                    selectedTransfer.currency
                                                )
                                            }

                                        </strong>

                                    </div>


                                    <div className="detail-row">

                                        <span>
                                            Total
                                        </span>

                                        <strong className="total-value">

                                            {
                                                formatAmount(
                                                    Number(
                                                        selectedTransfer.amount
                                                    ) +
                                                    Number(
                                                        selectedTransfer.fee || 0
                                                    ),
                                                    selectedTransfer.currency
                                                )
                                            }

                                        </strong>

                                    </div>

                                </div>


                                <div className="details-section">

                                    <h3>
                                        Transaction
                                    </h3>

                                    <div className="detail-row">

                                        <span>
                                            Reference
                                        </span>

                                        <strong>
                                            {
                                                selectedTransfer.reference
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-row">

                                        <span>
                                            Created
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedTransfer.created_at
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {selectedTransfer.description && (

                                <div className="description-box">

                                    <span>
                                        Description
                                    </span>

                                    <p>
                                        {
                                            selectedTransfer.description
                                        }
                                    </p>

                                </div>

                            )}


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={closeDetails}
                                    disabled={
                                        actionLoading !==
                                        null
                                    }
                                >
                                    Close
                                </button>


                                <button
                                    type="button"
                                    className="reject-btn"
                                    disabled={
                                        actionLoading ===
                                        selectedTransfer.id
                                    }
                                    onClick={() =>
                                        handleReject(
                                            selectedTransfer
                                        )
                                    }
                                >
                                    Reject
                                </button>


                                <button
                                    type="button"
                                    className="approve-btn"
                                    disabled={
                                        actionLoading ===
                                        selectedTransfer.id
                                    }
                                    onClick={() =>
                                        handleApprove(
                                            selectedTransfer
                                        )
                                    }
                                >

                                    {
                                        actionLoading ===
                                        selectedTransfer.id
                                            ? "Processing..."
                                            : "Approve Transfer"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </main>

    );

}


export default Transfers;