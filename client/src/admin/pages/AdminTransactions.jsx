
import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { getAdminTransactions } from "../../services/api";
import "../css/AdminTransactions.css";


function Transactions() {

    const {
        user
    } = useAuth();


    /* =========================================
       ADMIN TOKEN
    ========================================= */

    const adminToken =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("banking_admin_token");


    /* =========================================
       STATE
    ========================================= */

    const [
        transactions,
        setTransactions
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        filter,
        setFilter
    ] = useState("ALL");


    const [
        search,
        setSearch
    ] = useState("");


    const [
        sortOrder,
        setSortOrder
    ] = useState("NEWEST");


    /* =========================================
       LOAD ADMIN TRANSACTIONS
    ========================================= */

    useEffect(() => {

        const loadTransactions = async () => {

            console.log(
                "ADMIN TRANSACTIONS TOKEN:",
                adminToken
            );


            if (!adminToken) {

                console.error(
                    "NO ADMIN TOKEN FOUND"
                );

                setError(
                    "Admin session not found. Please login again."
                );

                setLoading(false);

                return;

            }


            try {

                setLoading(true);

                setError("");


                console.log(
                    "REQUESTING ADMIN TRANSACTIONS..."
                );


                const response =
                    await getAdminTransactions(
                        adminToken,
                        100
                    );


                console.log(
                    "ADMIN TRANSACTIONS RESPONSE:",
                    response
                );


                if (
                    response?.success
                ) {

                    const transactionData =
                        Array.isArray(
                            response.transactions
                        )
                            ? response.transactions
                            : [];


                    console.log(
                        "TRANSACTIONS FROM DATABASE:",
                        transactionData
                    );


                    setTransactions(
                        transactionData
                    );

                } else {

                    setTransactions([]);


                    setError(
                        response?.message ||
                        "Unable to load transactions."
                    );

                }

            } catch (err) {

                console.error(
                    "ADMIN TRANSACTIONS ERROR:",
                    err
                );


                console.error(
                    "ERROR RESPONSE:",
                    err?.response?.data
                );


                setTransactions([]);


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load transactions."
                );

            } finally {

                setLoading(false);

            }

        };


        loadTransactions();

    }, [adminToken]);


    /* =========================================
       CURRENCY
    ========================================= */

const formatCurrency = (amount) => {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number(amount || 0)
    );

};


    /* =========================================
       DATE
    ========================================= */

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "N/A";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "N/A";

        }


        return new Intl.DateTimeFormat(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(
            parsedDate
        );

    };


    /* =========================================
       TIME
    ========================================= */

    const formatTime = (
        date
    ) => {

        if (!date) {

            return "";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "";

        }


        return new Intl.DateTimeFormat(
            "en-NG",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(
            parsedDate
        );

    };


    /* =========================================
       TRANSACTION TITLE
    ========================================= */

    const getTransactionTitle = (
        transaction
    ) => {

        switch (
            String(
                transaction?.type || ""
            ).toUpperCase()
        ) {

            case "DEPOSIT":

                return "Deposit";


            case "WITHDRAWAL":

                return "Withdrawal";


            case "TRANSFER_IN":

                return "Money Received";


            case "TRANSFER_OUT":

                return "Money Transfer";


            default:

                return "Transaction";

        }

    };


    /* =========================================
       TRANSACTION DESCRIPTION
    ========================================= */

    const getTransactionDescription = (
        transaction
    ) => {

        if (
            transaction?.description
        ) {

            return transaction.description;

        }


        switch (
            String(
                transaction?.type || ""
            ).toUpperCase()
        ) {

            case "DEPOSIT":

                return "Account deposit";


            case "WITHDRAWAL":

                return "Account withdrawal";


            case "TRANSFER_IN":

                return "Transfer received";


            case "TRANSFER_OUT":

                return "Transfer sent";


            default:

                return "Banking transaction";

        }

    };


    /* =========================================
       TRANSACTION CLASS
    ========================================= */

    const getTransactionClass = (
        type
    ) => {

        switch (
            String(
                type || ""
            ).toUpperCase()
        ) {

            case "DEPOSIT":

            case "TRANSFER_IN":

                return "transaction-in";


            case "WITHDRAWAL":

            case "TRANSFER_OUT":

                return "transaction-out";


            default:

                return "transaction-neutral";

        }

    };


    /* =========================================
       TRANSACTION ICON
    ========================================= */

    const getTransactionIcon = (
        type
    ) => {

        switch (
            String(
                type || ""
            ).toUpperCase()
        ) {

            case "DEPOSIT":

                return "↓";


            case "WITHDRAWAL":

                return "↑";


            case "TRANSFER_IN":

                return "↙";


            case "TRANSFER_OUT":

                return "↗";


            default:

                return "•";

        }

    };


    /* =========================================
       STATUS
    ========================================= */

    const getStatus = (
        transaction
    ) => {

        const status =
            String(
                transaction?.status ||
                "APPROVED"
            ).toUpperCase();


        switch (status) {

            case "PENDING":

                return {
                    label: "Pending",
                    className: "status-pending",
                    icon: "◷"
                };


            case "REJECTED":

                return {
                    label: "Rejected",
                    className: "status-rejected",
                    icon: "×"
                };


            case "APPROVED":

                return {
                    label: "Approved",
                    className: "status-approved",
                    icon: "✓"
                };


            default:

                return {
                    label: status,
                    className: "status-neutral",
                    icon: "•"
                };

        }

    };


    /* =========================================
       FILTER + SEARCH + SORT
    ========================================= */

    const filteredTransactions =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();


            const result =
                transactions.filter(
                    (
                        transaction
                    ) => {

                        const transactionType =
                            String(
                                transaction?.type ||
                                ""
                            ).toUpperCase();


                        const transactionStatus =
                            String(
                                transaction?.status ||
                                "APPROVED"
                            ).toUpperCase();


                        const matchesFilter =

                            filter === "ALL"

                                ? true

                                : filter ===
                                    "TRANSFERS"

                                    ? (
                                        transactionType ===
                                            "TRANSFER_IN" ||

                                        transactionType ===
                                            "TRANSFER_OUT"
                                    )

                                    : filter ===
                                        "PENDING"

                                        ? transactionStatus ===
                                            "PENDING"

                                        : filter ===
                                            "APPROVED"

                                            ? transactionStatus ===
                                                "APPROVED"

                                            : filter ===
                                                "REJECTED"

                                                ? transactionStatus ===
                                                    "REJECTED"

                                                : transactionType ===
                                                    filter;


                        if (
                            !matchesFilter
                        ) {

                            return false;

                        }


                        if (!searchText) {

                            return true;

                        }


                        const searchableText =
                            [

                                transaction?.type,

                                transaction?.status,

                                transaction?.reference,

                                transaction?.description,

                                transaction?.related_account,

                                transaction?.account_number,

                                transaction?.full_name

                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                        return searchableText.includes(
                            searchText
                        );

                    }
                );


            return result.sort(
                (
                    a,
                    b
                ) => {

                    const dateA =
                        new Date(
                            a?.created_at || 0
                        ).getTime();


                    const dateB =
                        new Date(
                            b?.created_at || 0
                        ).getTime();


                    return sortOrder === "NEWEST"
                        ? dateB - dateA
                        : dateA - dateB;

                }
            );

        }, [
            transactions,
            filter,
            search,
            sortOrder
        ]);


    /* =========================================
       SUMMARY
    ========================================= */

    const summary =
        useMemo(() => {

            let totalIn = 0;

            let totalOut = 0;

            let pending = 0;

            let approved = 0;

            let rejected = 0;


            transactions.forEach(
                (
                    transaction
                ) => {

                    const type =
                        String(
                            transaction?.type ||
                            ""
                        ).toUpperCase();


                    const status =
                        String(
                            transaction?.status ||
                            "APPROVED"
                        ).toUpperCase();


                    const amount =
                        Number(
                            transaction?.amount ||
                            0
                        );


                    if (
                        type === "DEPOSIT" ||
                        type === "TRANSFER_IN"
                    ) {

                        totalIn += amount;

                    }


                    if (
                        type === "WITHDRAWAL" ||
                        type === "TRANSFER_OUT"
                    ) {

                        totalOut += amount;

                    }


                    if (
                        status === "PENDING"
                    ) {

                        pending++;

                    }


                    if (
                        status === "APPROVED"
                    ) {

                        approved++;

                    }


                    if (
                        status === "REJECTED"
                    ) {

                        rejected++;

                    }

                }
            );


            return {

                totalIn,

                totalOut,

                pending,

                approved,

                rejected,

                total:
                    transactions.length

            };

        }, [
            transactions
        ]);


    /* =========================================
       PROFILE IMAGE
    ========================================= */

    const profileImage =
        user?.profile_picture
            ? `http://localhost:5000/uploads/profiles/${user.profile_picture}`
            : null;


    /* =========================================
       CLEAR SEARCH
    ========================================= */

    const clearSearch = () => {

        setSearch("");

    };


    /* =========================================
       RENDER
    ========================================= */

    return (

        <div className="transactions-page">


            {/* HEADER */}

            <header className="transactions-header">

                <div className="transactions-header-left">

                  <Link
                        to="/admin/dashboard"
                        className="transactions-back-button"
                    >
                        ←
                    </Link>


                    <div className="transactions-heading">

                        <span>
                            BANKING ADMIN
                        </span>

                        <h1>
                            Transactions
                        </h1>

                    </div>

                </div>


                <div className="transactions-user">

                    <div className="transactions-user-avatar">

                        {profileImage ? (

                            <img
                                src={profileImage}
                                alt={
                                    user?.full_name ||
                                    "Admin"
                                }
                            />

                        ) : (

                            user?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                            "A"

                        )}

                    </div>


                    <div className="transactions-user-info">

                        <strong>
                            {
                                user?.full_name ||
                                "Administrator"
                            }
                        </strong>

                        <span>
                            Administrator
                        </span>

                    </div>

                </div>

            </header>


            {/* MAIN */}

            <main className="transactions-content">


                {/* INTRO */}

                <section className="transactions-intro">

                    <div>

                        <span>
                            ACCOUNT ACTIVITY
                        </span>

                        <h2>
                            All Transactions
                        </h2>

                        <p>
                            View and monitor all
                            banking transactions.
                        </p>

                    </div>


                    <div className="transactions-intro-badge">

                        <span className="intro-badge-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                Secure Banking
                            </strong>

                            <span>
                                Admin transaction monitoring
                            </span>

                        </div>

                    </div>

                </section>


                {/* SUMMARY */}

                <section className="transaction-summary">

                    <div className="summary-card">

                        <div className="summary-icon blue">
                            ≡
                        </div>

                        <div className="summary-content">

                            <span>
                                Total Transactions
                            </span>

                            <strong>
                                {summary.total}
                            </strong>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon green">
                            ↓
                        </div>

                        <div className="summary-content">

                            <span>
                                Money In
                            </span>

                            <strong>
                                {
                                    formatCurrency(
                                        summary.totalIn
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon orange">
                            ↑
                        </div>

                        <div className="summary-content">

                            <span>
                                Money Out
                            </span>

                            <strong>
                                {
                                    formatCurrency(
                                        summary.totalOut
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon purple">
                            ◷
                        </div>

                        <div className="summary-content">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {summary.pending}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* TOOLBAR */}

                <section className="transactions-toolbar">

                    <div className="search-box">

                        <span className="search-icon">
                            ⌕
                        </span>


                        <input
                            type="search"
                            placeholder="Search reference, account or description..."
                            value={search}
                            onChange={
                                (event) =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                        />


                        {search && (

                            <button
                                type="button"
                                className="clear-search"
                                onClick={clearSearch}
                            >
                                ×
                            </button>

                        )}

                    </div>


                    <div className="transaction-sort">

                        <label htmlFor="transaction-sort">
                            Sort
                        </label>

                        <select
                            id="transaction-sort"
                            value={sortOrder}
                            onChange={
                                (event) =>
                                    setSortOrder(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="NEWEST">
                                Newest first
                            </option>

                            <option value="OLDEST">
                                Oldest first
                            </option>

                        </select>

                    </div>

                </section>


                {/* FILTERS */}

                <section className="transaction-filters">

                    {[
                        ["ALL", "All"],
                        ["DEPOSIT", "Deposits"],
                        ["WITHDRAWAL", "Withdrawals"],
                        ["TRANSFERS", "Transfers"],
                        ["PENDING", "Pending"],
                        ["APPROVED", "Approved"],
                        ["REJECTED", "Rejected"]
                    ].map(
                        (
                            [value, label]
                        ) => (

                            <button
                                key={value}
                                type="button"
                                className={
                                    filter === value
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter(value)
                                }
                            >
                                {label}
                            </button>

                        )
                    )}

                </section>


                {/* TRANSACTION CARD */}

                <section className="transactions-card">

                    <div className="transactions-card-header">

                        <div>

                            <span>
                                DATABASE
                            </span>

                            <h3>
                                Recent Transactions
                            </h3>

                            <p>
                                {
                                    filteredTransactions.length
                                }

                                {" "}

                                transaction
                                {
                                    filteredTransactions.length !== 1
                                        ? "s"
                                        : ""
                                }

                                {" "}found
                            </p>

                        </div>


                        <div className="transaction-count">

                            {
                                filteredTransactions.length
                            }

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading ? (

                        <div className="transactions-loading">

                            <div className="transaction-spinner" />

                            <h3>
                                Loading transactions
                            </h3>

                            <p>
                                Retrieving transactions
                                from the database...
                            </p>

                        </div>

                    )


                    /* ERROR */

                    : error ? (

                        <div className="transactions-empty error-state">

                            <div className="empty-icon">
                                !
                            </div>

                            <h3>
                                Unable to load transactions
                            </h3>

                            <p>
                                {error}
                            </p>

                        </div>

                    )


                    /* EMPTY */

                    : filteredTransactions.length === 0 ? (

                        <div className="transactions-empty">

                            <div className="empty-icon">
                                ≡
                            </div>

                            <h3>
                                No transactions found
                            </h3>

                            <p>
                                {
                                    transactions.length === 0
                                        ? "No transaction records were returned from the database."
                                        : "No transactions match your current filter or search."
                                }
                            </p>


                            {search && (

                                <button
                                    type="button"
                                    className="empty-clear-button"
                                    onClick={clearSearch}
                                >
                                    Clear Search
                                </button>

                            )}

                        </div>

                    )


                    /* TRANSACTIONS */

                    : (

                        <div className="transaction-list">

                            {
                                filteredTransactions.map(
                                    (
                                        transaction,
                                        index
                                    ) => {

                                        const transactionType =
                                            String(
                                                transaction?.type ||
                                                ""
                                            ).toUpperCase();


                                        const isMoneyIn =
                                            transactionType ===
                                                "DEPOSIT" ||

                                            transactionType ===
                                                "TRANSFER_IN";


                                        const transactionClass =
                                            getTransactionClass(
                                                transactionType
                                            );


                                        const status =
                                            getStatus(
                                                transaction
                                            );


                                        return (

                                            <article
                                                className={
                                                    `transaction-row ${status.className}`
                                                }
                                                key={
                                                    transaction?.id ||
                                                    transaction?.reference ||
                                                    index
                                                }
                                            >


                                                {/* ICON */}

                                                <div
                                                    className={
                                                        `transaction-icon ${transactionClass}`
                                                    }
                                                >
                                                    {
                                                        getTransactionIcon(
                                                            transactionType
                                                        )
                                                    }
                                                </div>


                                                {/* MAIN */}

                                                <div className="transaction-main">

                                                    <div className="transaction-title-line">

                                                        <strong>
                                                            {
                                                                getTransactionTitle(
                                                                    transaction
                                                                )
                                                            }
                                                        </strong>


                                                        <span
                                                            className={
                                                                `mobile-status ${status.className}`
                                                            }
                                                        >

                                                            <span>
                                                                {
                                                                    status.icon
                                                                }
                                                            </span>

                                                            {
                                                                status.label
                                                            }

                                                        </span>

                                                    </div>


                                                    <span className="transaction-description">

                                                        {
                                                            getTransactionDescription(
                                                                transaction
                                                            )
                                                        }

                                                    </span>


                                                    {
                                                        transaction?.related_account && (

                                                            <small>

                                                                <span>
                                                                    Account
                                                                </span>

                                                                {
                                                                    transaction.related_account
                                                                }

                                                            </small>

                                                        )
                                                    }


                                                    {
                                                        transaction?.full_name && (

                                                            <small>

                                                                <span>
                                                                    Customer
                                                                </span>

                                                                {
                                                                    transaction.full_name
                                                                }

                                                            </small>

                                                        )
                                                    }


                                                    <div className="mobile-reference">

                                                        <span>
                                                            Ref:
                                                        </span>

                                                        {
                                                            transaction?.reference ||
                                                            "N/A"
                                                        }

                                                    </div>

                                                </div>


                                                {/* REFERENCE */}

                                                <div className="transaction-reference">

                                                    <span>
                                                        Reference
                                                    </span>

                                                    <strong>
                                                        {
                                                            transaction?.reference ||
                                                            "N/A"
                                                        }
                                                    </strong>

                                                </div>


                                                {/* DATE */}

                                                <div className="transaction-date">

                                                    <strong>
                                                        {
                                                            formatDate(
                                                                transaction?.created_at
                                                            )
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            formatTime(
                                                                transaction?.created_at
                                                            )
                                                        }
                                                    </span>

                                                </div>


                                                {/* STATUS */}

                                                <div className="transaction-status">

                                                    <span
                                                        className={
                                                            `status-badge ${status.className}`
                                                        }
                                                    >

                                                        <span>
                                                            {
                                                                status.icon
                                                            }
                                                        </span>

                                                        {
                                                            status.label
                                                        }

                                                    </span>

                                                </div>


                                                {/* AMOUNT */}

                                                <div
                                                    className={
                                                        `transaction-amount ${transactionClass}`
                                                    }
                                                >

                                                    <span>
                                                        {
                                                            isMoneyIn
                                                                ? "+"
                                                                : "-"
                                                        }
                                                    </span>

                                                    {
                                                        formatCurrency(
                                                            transaction?.amount
                                                        )
                                                    }

                                                </div>

                                            </article>

                                        );

                                    }
                                )
                            }

                        </div>

                    )}

                </section>


                {/* STATUS INFO */}

                <section className="transaction-status-info">

                    <div className="status-info-title">

                        <span>
                            Transaction status
                        </span>

                        <strong>
                            What the statuses mean
                        </strong>

                    </div>


                    <div className="status-info-items">

                        <div>

                            <span className="status-dot pending">
                                ◷
                            </span>

                            <div>

                                <strong>
                                    Pending
                                </strong>

                                <p>
                                    Waiting for approval.
                                </p>

                            </div>

                        </div>


                        <div>

                            <span className="status-dot approved">
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Approved
                                </strong>

                                <p>
                                    Successfully completed.
                                </p>

                            </div>

                        </div>


                        <div>

                            <span className="status-dot rejected">
                                ×
                            </span>

                            <div>

                                <strong>
                                    Rejected
                                </strong>

                                <p>
                                    The request was declined.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* SECURITY */}

                <section className="transaction-notice">

                    <div className="notice-icon">
                        🔐
                    </div>

                    <div>

                        <strong>
                            Transaction Security
                        </strong>

                        <p>
                            Always review transaction
                            details and never share your
                            account password, PIN or
                            verification code.
                        </p>

                    </div>

                </section>


                {/* FOOTER */}

                <footer className="transactions-footer">

                    <span>
                        © {new Date().getFullYear()}
                        {" "}Richiee Bank
                    </span>


                    <div>

                        <Link to="/dashboard">
                            Dashboard
                        </Link>

                        <Link to="/profile">
                            Profile
                        </Link>

                        <Link to="/support">
                            Support
                        </Link>

                    </div>

                </footer>

            </main>

        </div>

    );

}


export default Transactions;
