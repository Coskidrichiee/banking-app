import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    useAuth
} from "../context/useAuth";

import {
    getTransactions
} from "../services/api";

import "./Transactions.css";


function Transactions() {
    const {
        user,
        token
    } = useAuth();


    const [transactions, setTransactions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [filter, setFilter] =
        useState("ALL");

    const [search, setSearch] =
        useState("");


    /* =========================================
       LOAD TRANSACTIONS
    ========================================= */

    useEffect(() => {
        const loadTransactions =
            async () => {
                if (!token) {
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);
                    setError("");

                    const response =
                        await getTransactions(
                            token,
                            100
                        );

                    if (response.success) {
                        setTransactions(
                            response.transactions ||
                            []
                        );
                    }
                } catch (err) {
                    console.error(
                        "Transactions error:",
                        err
                    );

                    setError(
                        err.message ||
                        "Unable to load transactions."
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadTransactions();
    }, [token]);


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
        return new Intl.DateTimeFormat(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(new Date(date));
    };


    const formatTime = (
        date
    ) => {
        return new Intl.DateTimeFormat(
            "en-NG",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(new Date(date));
    };


    /* =========================================
       TRANSACTION LABEL
    ========================================= */
const getTransactionTitle = (
    transaction
) => {

    switch (transaction.type) {

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
       TRANSACTION TYPE
    ========================================= */

    const getTransactionClass = (
        type
    ) => {
        switch (type) {
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
        switch (type) {
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
       FILTER + SEARCH
    ========================================= */

    const filteredTransactions =
        useMemo(() => {
            return transactions.filter(
                (transaction) => {

                    const matchesFilter =
                        filter === "ALL" ||
                        transaction.type ===
                            filter;

                    const searchText =
                        search
                            .trim()
                            .toLowerCase();

                    if (!searchText) {
                        return matchesFilter;
                    }

                    const searchableText =
                        [
                            transaction.type,
                            transaction.reference,
                            transaction.description,
                            transaction.related_account
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();

                    return (
                        matchesFilter &&
                        searchableText.includes(
                            searchText
                        )
                    );
                }
            );
        }, [
            transactions,
            filter,
            search
        ]);


    /* =========================================
       SUMMARY
    ========================================= */

    const totalIn =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                        "DEPOSIT" ||
                    transaction.type ===
                        "TRANSFER_IN"
            )
            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount ||
                        0
                    ),
                0
            );


    const totalOut =
        transactions
            .filter(
                transaction =>
                    transaction.type ===
                        "WITHDRAWAL" ||
                    transaction.type ===
                        "TRANSFER_OUT"
            )
            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount ||
                        0
                    ),
                0
            );


    return (
        <div className="transactions-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <header className="transactions-header">

                <div className="transactions-header-left">

                    <Link
                        to="/dashboard"
                        className="transactions-back-button"
                    >
                        ←
                    </Link>

                    <div>
                        <span>
                            Banking
                        </span>

                        <h1>
                            Transactions
                        </h1>
                    </div>

                </div>


                <div className="transactions-user">

                    <div className="transactions-user-avatar">

                        {user?.profile_picture ? (
                            <img
                                src={`http://localhost:5000/uploads/profiles/${user.profile_picture}`}
                                alt={
                                    user.full_name ||
                                    "Profile"
                                }
                            />
                        ) : (
                            user?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                            "U"
                        )}

                    </div>

                    <div className="transactions-user-info">

                        <strong>
                            {user?.full_name ||
                                "Customer"}
                        </strong>

                        <span>
                            {user?.account_number ||
                                "No account number"}
                        </span>

                    </div>

                </div>

            </header>


            {/* =====================================
                CONTENT
            ===================================== */}

            <main className="transactions-content">

                {/* Intro */}

                <section className="transactions-intro">

                    <div>

                        <span>
                            ACCOUNT ACTIVITY
                        </span>

                        <h2>
                            Transaction History
                        </h2>

                        <p>
                            View and track all your
                            deposits, withdrawals and
                            transfers.
                        </p>

                    </div>

                </section>


                {/* =====================================
                    SUMMARY CARDS
                ===================================== */}

                <section className="transaction-summary">

                    <div className="summary-card">

                        <div className="summary-icon blue">
                            ≡
                        </div>

                        <div>
                            <span>
                                Total Transactions
                            </span>

                            <strong>
                                {transactions.length}
                            </strong>
                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon green">
                            ↓
                        </div>

                        <div>
                            <span>
                                Money In
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalIn
                                )}
                            </strong>
                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon orange">
                            ↑
                        </div>

                        <div>
                            <span>
                                Money Out
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalOut
                                )}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =====================================
                    FILTER BAR
                ===================================== */}

                <section className="transactions-toolbar">

                    <div className="search-box">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="search"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={
                                event =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <div className="transaction-filters">

                        <button
                            type="button"
                            className={
                                filter === "ALL"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "ALL"
                                )
                            }
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={
                                filter === "DEPOSIT"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "DEPOSIT"
                                )
                            }
                        >
                            Deposits
                        </button>

                        <button
                            type="button"
                            className={
                                filter === "WITHDRAWAL"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "WITHDRAWAL"
                                )
                            }
                        >
                            Withdrawals
                        </button>

                        <button
                            type="button"
                            className={
                                filter === "TRANSFER_IN" ||
                                filter === "TRANSFER_OUT"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "TRANSFER_IN"
                                )
                            }
                        >
                            Transfers
                        </button>

                    </div>

                </section>


                {/* =====================================
                    TRANSACTIONS
                ===================================== */}

                <section className="transactions-card">

                    <div className="transactions-card-header">

                        <div>
                            <h3>
                                Recent Transactions
                            </h3>

                            <p>
                                {filteredTransactions.length}
                                {" "}
                                transaction
                                {filteredTransactions.length !== 1
                                    ? "s"
                                    : ""}
                                {" "}found
                            </p>
                        </div>

                    </div>


                    {loading ? (

                        <div className="transactions-loading">

                            <div className="transaction-spinner" />

                            <p>
                                Loading transactions...
                            </p>

                        </div>

                    ) : error ? (

                        <div className="transactions-empty">

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

                    ) : filteredTransactions.length === 0 ? (

                        <div className="transactions-empty">

                            <div className="empty-icon">
                                ≡
                            </div>

                            <h3>
                                No transactions found
                            </h3>

                            <p>
                                Your transaction history
                                will appear here once you
                                make a deposit, withdrawal
                                or transfer.
                            </p>

                        </div>

                    ) : (

                        <div className="transaction-list">

                            {filteredTransactions.map(
                                transaction => (

                                    <div
                                        className="transaction-row"
                                        key={
                                            transaction.id
                                        }
                                    >

                                        <div
                                            className={`transaction-icon ${
                                                getTransactionClass(
                                                    transaction.type
                                                )
                                            }`}
                                        >
                                            {getTransactionIcon(
                                                transaction.type
                                            )}
                                        </div>


                                        <div className="transaction-main">

                                            <strong>
                                                {getTransactionTitle(
                                                    transaction
                                                )}
                                            </strong>

                                            <span>
                                                {transaction.description ||
                                                    "Banking transaction"}
                                            </span>

                                            {transaction.related_account && (
                                                <small>
                                                    Account:{" "}
                                                    {
                                                        transaction.related_account
                                                    }
                                                </small>
                                            )}

                                        </div>


                                        <div className="transaction-reference">

                                            <span>
                                                Reference
                                            </span>

                                            <strong>
                                                {
                                                    transaction.reference
                                                }
                                            </strong>

                                        </div>


                                        <div className="transaction-date">

                                            <strong>
                                                {formatDate(
                                                    transaction.created_at
                                                )}
                                            </strong>

                                            <span>
                                                {formatTime(
                                                    transaction.created_at
                                                )}
                                            </span>

                                        </div>


                                        <div
                                            className={`transaction-amount ${
                                                getTransactionClass(
                                                    transaction.type
                                                )
                                            }`}
                                        >
                                            {
                                                transaction.type ===
                                                    "DEPOSIT" ||
                                                transaction.type ===
                                                    "TRANSFER_IN"
                                                    ? "+"
                                                    : "-"
                                            }

                                            {formatCurrency(
                                                transaction.amount
                                            )}

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =====================================
                    SECURITY NOTICE
                ===================================== */}

                <section className="transaction-notice">

                    <div className="notice-icon">
                        🔐
                    </div>

                    <div>

                        <strong>
                            Transaction Security
                        </strong>

                        <p>
                            Always review your transaction
                            details and never share your
                            account password, PIN or
                            verification code.
                        </p>

                    </div>

                </section>


                {/* =====================================
                    FOOTER
                ===================================== */}

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