
// src/admin/pages/Dashboard.jsx

import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    FaUsers,
    FaMoneyBillWave,
    FaExchangeAlt,
    FaWallet,
    FaCheckCircle,
    FaClock,
    FaCreditCard,
    FaUserPlus
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";

import "../css/dashboard.css";
import "../css/admin.css";

import {
    getAdminTransactions,
    getPendingTransfers,
    approveTransfer,
    rejectTransfer
} from "../../services/api";

import {
    useAuth
} from "../../context/useAuth";


function Dashboard() {

    /*
    =========================================
    AUTH
    =========================================
    */

    const {
        token
    } = useAuth();


    /*
    =========================================
    STATE
    =========================================
    */

    const [loading, setLoading] =
        useState(true);

    const [stats, setStats] =
        useState([]);

    const [transactions, setTransactions] =
        useState([]);

    const [pendingTransfers, setPendingTransfers] =
        useState([]);

    const [pendingTransferCount, setPendingTransferCount] =
    useState(0);

    const [loadingTransactions, setLoadingTransactions] =
        useState(false);

    const [loadingPending, setLoadingPending] =
        useState(false);


    /*
    =========================================
    FORMAT MONEY
    =========================================
    */

    const formatAmount = (
        amount,
        currency = "USD"
    ) => {

        try {

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

        } catch {

            return `$${Number(
                amount || 0
            ).toLocaleString()}`;

        }

    };


    /*
    =========================================
    LOAD DASHBOARD STATS
    =========================================
    */

    const loadDashboardStats =
        useCallback(
            async () => {

                try {

                    const response =
                        await getDashboardStats();

                    console.log(
                        "ADMIN DASHBOARD STATS:",
                        response
                    );

                    if (
                        response?.success &&
                        response?.stats
                    ) {

                        setStats(
                            response.stats
                        );

                    }

                } catch (error) {

                    console.error(
                        "Dashboard stats error:",
                        error
                    );

                }

            },
            []
        );


    /*
    =========================================
    LOAD RECENT TRANSACTIONS
    =========================================
    */

    const loadTransactions =
        useCallback(
            async () => {

                if (!token) {
                    return;
                }

                try {

                    setLoadingTransactions(
                        true
                    );

                    const response =
                        await getAdminTransactions(
                            token,
                            5
                        );

                    console.log(
                        "ADMIN TRANSACTIONS:",
                        response
                    );

                    if (
                        response?.success
                    ) {

                        setTransactions(
                            response.transactions ||
                            []
                        );

                    } else {

                        setTransactions([]);

                        console.error(
                            "Transaction error:",
                            response?.message
                        );

                    }

                } catch (error) {

                    console.error(
                        "Failed to load transactions:",
                        error
                    );

                    setTransactions([]);

                } finally {

                    setLoadingTransactions(
                        false
                    );

                }

            },
            [token]
        );


    /*
    =========================================
    LOAD PENDING TRANSFERS
    =========================================
    */

    const loadPendingTransfers =
        useCallback(
            async () => {

                if (!token) {
                    return;
                }

                try {

                    setLoadingPending(
                        true
                    );

                    const response =
                        await getPendingTransfers(
                            token
                        );

                    console.log(
                        "ADMIN PENDING TRANSFERS:",
                        response
                    );


                    if (
                        response?.success
                    ) {

                        /*
                        Support both:

                        response.transfers

                        and

                        response.transactions
                        */

                        const pendingList =
                            response.transfers ||
                            response.transactions ||
                            [];

                        setPendingTransfers(
                            pendingList
                        );

                    } else {

                        setPendingTransfers([]);

                        console.error(
                            "Pending transfer error:",
                            response?.message
                        );

                    }

                } catch (error) {

                    console.error(
                        "Failed to load pending transfers:",
                        error
                    );

                    setPendingTransfers([]);

                } finally {

                    setLoadingPending(
                        false
                    );

                }

            },
            [token]
        );


    /*
    =========================================
    LOAD EVERYTHING
    =========================================
    */

    useEffect(() => {

        if (!token) {

            setLoading(false);

            return;

        }


        const loadAll =
            async () => {

                setLoading(true);

                await Promise.all([
                    loadDashboardStats(),
                    loadTransactions(),
                    loadPendingTransfers()
                ]);

                setLoading(false);

            };


        loadAll();

    }, [
        token,
        loadDashboardStats,
        loadTransactions,
        loadPendingTransfers
    ]);


    /*
    =========================================
    APPROVE TRANSFER
    =========================================
    */

    const handleApproveTransfer =
        async (transactionId) => {

            if (!transactionId) {

                alert(
                    "Invalid transaction ID."
                );

                return;

            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to approve this transfer?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await approveTransfer(
                        token,
                        transactionId
                    );

                console.log(
                    "APPROVE RESPONSE:",
                    response
                );


                if (!response?.success) {

                    alert(
                        response?.message ||
                        "Unable to approve transaction."
                    );

                    return;

                }


                alert(
                    response.message ||
                    "Transaction approved successfully."
                );


                /*
                Remove immediately from
                pending list.
                */

                setPendingTransfers(
                    (current) =>
                        current.filter(
                            (item) =>
                                Number(item.id) !==
                                Number(transactionId)
                        )
                );


                /*
                Refresh dashboard.
                */

                await Promise.all([
                    loadDashboardStats(),
                    loadTransactions(),
                    loadPendingTransfers()
                ]);

            } catch (error) {

                console.error(
                    "Approve transaction error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to approve transaction."
                );

            }

        };


    /*
    =========================================
    REJECT TRANSFER
    =========================================
    */

    const handleRejectTransfer =
        async (transactionId) => {

            if (!transactionId) {

                alert(
                    "Invalid transaction ID."
                );

                return;

            }


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

                const response =
                    await rejectTransfer(
                        token,
                        transactionId,
                        reason.trim()
                    );

                console.log(
                    "REJECT RESPONSE:",
                    response
                );


                if (!response?.success) {

                    alert(
                        response?.message ||
                        "Unable to reject transaction."
                    );

                    return;

                }


                alert(
                    response.message ||
                    "Transaction rejected successfully."
                );


                /*
                Remove from pending immediately.
                */

                setPendingTransfers(
                    (current) =>
                        current.filter(
                            (item) =>
                                Number(item.id) !==
                                Number(transactionId)
                        )
                );


                /*
                Refresh dashboard.
                */

                await Promise.all([
                    loadDashboardStats(),
                    loadTransactions(),
                    loadPendingTransfers()
                ]);

            } catch (error) {

                console.error(
                    "Reject transaction error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to reject transaction."
                );

            }

        };


    /*
    =========================================
    LOADING
    =========================================
    */

    if (loading) {

        return (

            <div className="dashboard-loading">

                Loading Dashboard...

            </div>

        );

    }


    /*
    =========================================
    DASHBOARD
    =========================================
    */

    return (

        <div className="admin-dashboard">


            <Sidebar />


            <div className="dashboard-main">


                <Header
                    title="Dashboard"
                    subtitle="Richiee Bank Administration"
                />


                <div className="dashboard-content">


                    {/* =================================
                        STATS
                    ================================= */}

                    <section className="stats-grid">

                        {stats.length > 0 ? (

                            stats.map(
                                (item, index) => (

                                    <StatCard
                                        key={index}
                                        title={
                                            item.title
                                        }
                                        value={
                                            item.value
                                        }
                                        icon={

                                            item.icon ===
                                            "users"

                                                ? <FaUsers />

                                                : item.icon ===
                                                  "wallet"

                                                ? <FaWallet />

                                                : item.icon ===
                                                  "clock"

                                                ? <FaClock />

                                                : <FaExchangeAlt />

                                        }
                                        color={
                                            item.color
                                        }
                                    />

                                )
                            )

                        ) : (

                            <>
                                <StatCard
                                    title="Transactions"
                                    value={
                                        transactions.length
                                    }
                                    icon={
                                        <FaExchangeAlt />
                                    }
                                    color="blue"
                                />

                                <StatCard
                                    title="Pending"
                                    value={
                                        pendingTransfers.length
                                    }
                                    icon={
                                        <FaClock />
                                    }
                                    color="orange"
                                />

                                <StatCard
                                    title="Approved"
                                    value="—"
                                    icon={
                                        <FaCheckCircle />
                                    }
                                    color="green"
                                />

                                <StatCard
                                    title="Volume"
                                    value={
                                        formatAmount(
                                            transactions.reduce(
                                                (
                                                    total,
                                                    item
                                                ) =>
                                                    total +
                                                    Number(
                                                        item.amount ||
                                                        0
                                                    ),
                                                0
                                            )
                                        )
                                    }
                                    icon={
                                        <FaMoneyBillWave />
                                    }
                                    color="purple"
                                />
                            </>

                        )}

                    </section>


                    {/* =================================
                        QUICK ACTIONS
                    ================================= */}

                    <section className="quick-actions">

                        <h2>
                            Quick Actions
                        </h2>


                        <div className="quick-grid">


                            <Link
                                to="/admin/users/add"
                                className="quick-card"
                            >

                                <FaUserPlus />

                                <span>
                                    Add User
                                </span>

                            </Link>


                            <Link
                                to="/admin/topup"
                                className="quick-card"
                            >

                                <FaMoneyBillWave />

                                <span>
                                    Top Up
                                </span>

                            </Link>


                            <Link
                                to="/admin/transfers"
                                className="quick-card"
                            >

                                <FaExchangeAlt />

                                <span>
                                    Transfers
                                </span>

                            </Link>


                            <Link
                                to="/admin/cards"
                                className="quick-card"
                            >

                                <FaCreditCard />

                                <span>
                                    Cards
                                </span>

                            </Link>


                        </div>

                    </section>


                    {/* =================================
                        DASHBOARD GRID
                    ================================= */}

                    <div className="dashboard-grid">


                        {/* =================================
                            RECENT TRANSACTIONS
                        ================================= */}

                        <div className="dashboard-card">


                            <div className="card-header">

                                <h3>
                                    Recent Transactions
                                </h3>


                                <Link
                                    to="/admin/transactions"
                                >
                                    View All
                                </Link>

                            </div>


                            <div className="table-responsive">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                User
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Date
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {loadingTransactions ? (

                                            <tr>

                                                <td
                                                    colSpan="5"
                                                    style={{
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >
                                                    Loading transactions...
                                                </td>

                                            </tr>

                                        ) : transactions.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="5"
                                                    style={{
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >
                                                    No transactions found.
                                                </td>

                                            </tr>

                                        ) : (

                                            transactions.map(
                                                (item) => (

                                                    <tr
                                                        key={
                                                            item.id
                                                        }
                                                    >

                                                        <td>

                                                            {
                                                                item.full_name ||
                                                                item.account_name ||
                                                                "Unknown User"
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                formatAmount(
                                                                    item.amount,
                                                                    item.currency
                                                                )
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                item.type ||
                                                                "TRANSFER"
                                                            }

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    `transaction-status ${String(
                                                                        item.status ||
                                                                        "PENDING"
                                                                    ).toLowerCase()}`
                                                                }
                                                            >

                                                                {
                                                                    item.status ||
                                                                    "PENDING"
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            {
                                                                item.created_at
                                                                    ? new Date(
                                                                        item.created_at
                                                                    ).toLocaleString()
                                                                    : "—"
                                                            }

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

{/* =================================
    PENDING TRANSFERS
================================= */}

<div className="dashboard-card">

    <div className="card-header">

        <div>
            <h3>
                Pending Transfers
            </h3>

            <p className="card-subtitle">
                {pendingTransfers.length} pending transfer
                {pendingTransfers.length !== 1 ? "s" : ""}
            </p>
        </div>

        <Link
            to="/admin/trans"
        >
            View All
        </Link>

    </div>


    <div className="pending-transactions">

        {/* ==============================
            LOADING
        ============================== */}

        {loadingPending ? (

            <div className="pending-empty">

                Loading pending transfers...

            </div>

        ) : pendingTransfers.length === 0 ? (

            /* ==============================
               EMPTY
            ============================== */

            <div className="pending-empty">

                <FaCheckCircle />

                <p>
                    No pending transfers.
                </p>

            </div>

        ) : (

            /* ==============================
               PENDING TRANSFERS
            ============================== */

            pendingTransfers
                .slice(0, 5)
                .map((transfer) => (

                    <div
                        key={transfer.id}
                        className="pending-item"
                    >

                        {/* ==========================
                            CUSTOMER
                        ========================== */}

                        <div className="pending-user">

                            <strong>
                                {
                                    transfer.full_name ||
                                    transfer.account_name ||
                                    "Unknown User"
                                }
                            </strong>

                            <p>
                                {
                                    transfer.account_name ||
                                    "Unknown recipient"
                                }
                            </p>

                            <small>
                                {
                                    transfer.bank ||
                                    "Bank not available"
                                }
                                {" • "}
                                {
                                    transfer.account_number ||
                                    "No account"
                                }
                            </small>

                        </div>


                        {/* ==========================
                            AMOUNT + STATUS
                        ========================== */}

                        <div className="pending-transfer-right">

                            <h4>
                                {
                                    formatAmount(
                                        transfer.amount,
                                        transfer.currency || "USD"
                                    )
                                }
                            </h4>

                            <small>
                                Fee:{" "}
                                {
                                    formatAmount(
                                        transfer.fee || 0,
                                        transfer.currency || "USD"
                                    )
                                }
                            </small>

                            <span
                                className={
                                    `transaction-status ${String(
                                        transfer.status ||
                                        "PENDING"
                                    ).toLowerCase()}`
                                }
                            >
                                {
                                    transfer.status ||
                                    "PENDING"
                                }
                            </span>

                        </div>


                        {/* ==========================
                            REFERENCE + DATE
                        ========================== */}

                        <div className="pending-transfer-meta">

                            <span>
                                Ref:{" "}
                                {
                                    transfer.reference ||
                                    "—"
                                }
                            </span>

                            <span>
                                {
                                    transfer.created_at
                                        ? new Date(
                                            transfer.created_at
                                        ).toLocaleString()
                                        : "—"
                                }
                            </span>

                        </div>


                        {/* ==========================
                            ACTIONS
                        ========================== */}

                        <div className="pending-buttons">

                            <button
                                type="button"
                                className="approve"
                                disabled={
                                    actionLoading ===
                                    transfer.id
                                }
                                onClick={() =>
                                    handleApproveTransfer(
                                        transfer.id
                                    )
                                }
                            >

                                <FaCheckCircle />

                                {
                                    actionLoading ===
                                    transfer.id
                                        ? "Processing..."
                                        : "Approve"
                                }

                            </button>


                            <button
                                type="button"
                                className="reject"
                                disabled={
                                    actionLoading ===
                                    transfer.id
                                }
                                className="reject"
                                onClick={() =>
                                    handleRejectTransfer(
                                        transfer.id
                                    )
                                }
                            >

                                Reject

                            </button>

                        </div>

                    </div>

                ))

        )}

    </div>

</div>

                    </div>


                </div>

            </div>

        </div>

    );

}


export default Dashboard;