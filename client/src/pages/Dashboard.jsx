import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/useAuth";

import {
    getBalance
} from "../services/api";

import "./Dashboard.css";


function Dashboard() {
    const {
        user,
        token,
        logout
    } = useAuth();

    const navigate = useNavigate();

    const [
        balance,
        setBalance
    ] = useState(
        Number(user?.balance || 0)
    );

    const [
        loadingBalance,
        setLoadingBalance
    ] = useState(true);

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);

    const [
        showBalance,
        setShowBalance
    ] = useState(true);

    const [
        cardNumber] = useState(
        user?.card_number || "4589  ****  ****  7821"
    );

    const [expiryDate] = useState(
        user?.card_expiry || "12/30"
    );


    /* =========================================
       LOAD BALANCE
    ========================================= */

    useEffect(() => {
        const loadBalance = async () => {
            if (!token) {
                setLoadingBalance(false);
                return;
            }

            try {
                const response =
                    await getBalance(token);

                if (response.success) {
                    setBalance(
                        Number(
                            response.balance || 0
                        )
                    );
                }
            } catch (error) {
                console.error(
                    "Balance error:",
                    error
                );
            } finally {
                setLoadingBalance(false);
            }
        };

        loadBalance();
    }, [token]);


    /* =========================================
       CLOSE SIDEBAR
    ========================================= */

    const closeSidebar = () => {
        setSidebarOpen(false);
    };


    /* =========================================
       LOGOUT
    ========================================= */

    const handleLogout = () => {
        closeSidebar();
        logout();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };


    /* =========================================
       CURRENCY
    ========================================= */

   const formatCurrency = (
    amount
) => {
    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }
    ).format(amount);
};


    /* =========================================
       DATE
    ========================================= */

    const today = new Intl.DateTimeFormat(
    user?.locale || "en-US",
    {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }
).format(new Date());


    /* =========================================
       USER INITIAL
    ========================================= */

    const userInitial =
        user?.full_name
            ?.charAt(0)
            ?.toUpperCase() || "U";


    return (
        <div className="dashboard-page">

            {/* =====================================
                MOBILE OVERLAY
            ===================================== */}

            {sidebarOpen && (
                <div
                    className="dashboard-overlay"
                    onClick={
                        closeSidebar
                    }
                />
            )}


            {/* =====================================
                SIDEBAR
            ===================================== */}

            <aside
                className={`dashboard-sidebar ${
                    sidebarOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                <div className="sidebar-inner">

                    {/* Logo */}

                    <div className="dashboard-logo">

                        <div className="dashboard-logo-icon">
                            R
                        </div>

                        <div>
                            <h2>
                                Richiee Bank
                            </h2>

                            <span>
                                Digital Banking
                            </span>
                        </div>

                    </div>


                    {/* Close mobile */}

                    <button
                        className="mobile-sidebar-close"
                        onClick={
                            closeSidebar
                        }
                        aria-label="Close menu"
                    >
                        ×
                    </button>


                    {/* Navigation */}

                    <nav className="dashboard-nav">

                        <p className="nav-title">
                            MAIN MENU
                        </p>

                        <Link
                            to="/dashboard"
                            className="nav-link active"
                            onClick={
                                closeSidebar
                            }
                        >
                            <span className="nav-icon">
                                ▦
                            </span>

                            <span>
                                Dashboard
                            </span>
                        </Link>


                        <Link
                            to="/transfer"
                            className="nav-link"
                            onClick={
                                closeSidebar
                            }
                        >
                            <span className="nav-icon">
                                ⇄
                            </span>

                            <span>
                                Transfer
                            </span>
                        </Link>


                        <Link
                            to="/deposit"
                            className="nav-link"
                            onClick={
                                closeSidebar
                            }
                        >
                            <span className="nav-icon">
                                +
                            </span>

                            <span>
                                Deposit
                            </span>
                        </Link>


                        <Link
                            to="/withdraw"
                            className="nav-link"
                            onClick={
                                closeSidebar
                            }
                        >
                            <span className="nav-icon">
                                ↓
                            </span>

                            <span>
                                Withdraw
                            </span>
                        </Link>


                        <Link
                            to="/transactions"
                            className="nav-link"
                            onClick={
                                closeSidebar
                            }
                        >
                            <span className="nav-icon">
                                ≡
                            </span>

                            <span>
                                Transactions
                            </span>
                        </Link>


                        <p className="nav-title second-title">
                            ACCOUNT
                        </p>


                        <Link
                            to="/profile"
                            className="nav-link"
                            onClick={
                                closeSidebar
                            }
                        >
                            <span className="nav-icon">
                                ◯
                            </span>

                            <span>
                                My Profile
                            </span>
                        </Link>


                        <Link
                            to="/settings"
                            className="nav-link"
                            onClick={
                                closeSidebar
                            }
                        >
                            <span className="nav-icon">
                                ⚙
                            </span>

                            <span>
                                Settings
                            </span>
                        </Link>

                    </nav>


                    {/* Sidebar Bottom */}

                    <div className="sidebar-bottom">

                        <div className="support-card">

                            <div className="support-icon">
                                ?
                            </div>

                            <div>
                                <strong>
                                    Need Help?
                                </strong>

                                <Link
                                    to="/support"
                                    className="support-link"
                                    onClick={closeSidebar}
                                >
                                    Contact support
                                </Link>
                            </div>

                        </div>


                        <button
                            className="sidebar-logout"
                            onClick={
                                handleLogout
                            }
                        >
                            <span>
                                ↪
                            </span>

                            Logout
                        </button>

                    </div>

                </div>

            </aside>


            {/* =====================================
                MAIN CONTENT
            ===================================== */}

            <main className="dashboard-main">

                {/* =================================
                    TOPBAR
                ================================= */}

                <header className="dashboard-topbar">

                    <button
                        className="mobile-menu-button"
                        onClick={() =>
                            setSidebarOpen(
                                true
                            )
                        }
                        aria-label="Open menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>


                    <div className="topbar-left">

                        <div>
                            <p className="topbar-date">
                                {today}
                            </p>

                            <h1>
                                Dashboard
                            </h1>
                        </div>

                    </div>


                    <div className="topbar-right">

                        <button
                            className="notification-button"
                            aria-label="Notifications"
                        >
                            <span>
                                ♢
                            </span>

                            <small />
                        </button>


                        <div className="topbar-divider" />


                        <div className="topbar-user">

                            <div className="user-avatar">
                                {user?.profile_picture ? (
                                    <img
                                        src={`http://localhost:5000/uploads/profiles/${user.profile_picture}`}
                                        alt={user?.full_name || "Profile"}
                                        className="dashboard-profile-image"
                                    />
                                ) : (
                                    userInitial
                                )}
                            </div>

                            <div className="topbar-user-info">
                                <strong>
                                    {user?.full_name ||
                                        "User"}
                                </strong>

                                <span>
                                    Customer
                                </span>
                            </div>

                        </div>

                    </div>

                </header>


                {/* =================================
                    CONTENT
                ================================= */}

                <div className="dashboard-content">

                    {/* Welcome */}

                    <section className="welcome-section">

                        <div>

                            <span className="welcome-label">
                                Welcome back 👋
                            </span>

                            <h2>
                                Hello,{" "}
                                {user?.full_name?.split(
                                    " "
                                )[0] ||
                                    "Customer"}
                            </h2>

                            <p>
                                Here's what's happening
                                with your account today.
                            </p>

                        </div>

                    </section>


                    {/* =================================
                        BALANCE + QUICK ACTIONS
                    ================================= */}

                    <section className="dashboard-grid">

                        {/* Balance Card */}

                        {/* Balance + Bank Card */}

                   <div className="balance-card">

                        <div className="balance-decoration one" />
                        <div className="balance-decoration two" />


                        {/* HEADER */}

                        <div className="balance-card-top">

                            <div className="balance-title">

                                <span className="balance-label">
                                    Available Balance
                                </span>


                                <button
                                    className="balance-eye"
                                    onClick={() =>
                                        setShowBalance(
                                            previous => !previous
                                        )
                                    }
                                >
                                    {
                                        showBalance
                                        ? "◉"
                                        : "◎"
                                    }
                                </button>

                            </div>



                            <span className="balance-chip">
                                ● Active
                            </span>

                        </div>



                        {/* BALANCE */}

                        <div className="balance-amount">

                            {
                                loadingBalance
                                ? "Loading..."
                                :
                                showBalance
                                ? formatCurrency(balance)
                                : "$ ••••••••"
                            }

                        </div>



                        {/* CARD */}

                        <div className="bank-card">


                            <div className="bank-card-header">

                                <strong>
                                    Richiee Bank
                                </strong>


                                <span>
                                    VISA
                                </span>

                            </div>



                            <div className="chip-row">

                                <div className="card-chip">
                                    ▣
                                </div>

                            </div>



                            <div className="card-number">

                                {cardNumber}

                            </div>



                            <div className="card-footer">


                                <div>

                                    <small>
                                        CARD HOLDER
                                    </small>

                                    <strong>
                                        {
                                        user?.full_name ||
                                        "CUSTOMER NAME"
                                        }
                                    </strong>

                                </div>



                                <div>

                                    <small>
                                        EXPIRES
                                    </small>

                                    <strong>
                                        {expiryDate}
                                    </strong>

                                </div>


                            </div>


                        </div>


                    </div>


                        {/* Quick Actions */}

                        <div className="quick-actions-card">

                            <div className="section-heading">

                                <div>
                                    <h3>
                                        Quick Actions
                                    </h3>

                                    <p>
                                        Manage your money
                                        easily
                                    </p>
                                </div>

                            </div>


                            <div className="quick-actions">

                                <Link
                                    to="/transfer"
                                    className="quick-action transfer-action"
                                >
                                    <span className="quick-action-icon">
                                        ⇄
                                    </span>

                                    <span>
                                        Transfer
                                    </span>
                                </Link>


                                <Link
                                    to="/deposit"
                                    className="quick-action deposit-action"
                                >
                                    <span className="quick-action-icon">
                                        +
                                    </span>

                                    <span>
                                        Deposit
                                    </span>
                                </Link>


                                <Link
                                    to="/withdraw"
                                    className="quick-action withdraw-action"
                                >
                                    <span className="quick-action-icon">
                                        ↓
                                    </span>

                                    <span>
                                        Withdraw
                                    </span>
                                </Link>


                                <Link
                                    to="/transactions"
                                    className="quick-action history-action"
                                >
                                    <span className="quick-action-icon">
                                        ≡
                                    </span>

                                    <span>
                                        History
                                    </span>
                                </Link>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        ACCOUNT OVERVIEW
                    ================================= */}

                    <section className="overview-section">

                        <div className="section-heading overview-heading">

                            <div>
                                <h3>
                                    Account Overview
                                </h3>

                                <p>
                                    Your personal account
                                    information
                                </p>
                            </div>

                            <Link
                                to="/profile"
                                className="view-profile"
                            >
                                View Profile →
                            </Link>

                        </div>


                        <div className="overview-grid">

                            {/* Account */}

                            <div className="overview-card">

                                <div className="overview-icon blue">
                                    #
                                </div>

                                <div>
                                    <span>
                                        Account Number
                                    </span>

                                    <strong>
                                        {user?.account_number ||
                                            "----------"}
                                    </strong>
                                </div>

                            </div>


                            {/* Email */}

                            <div className="overview-card">

                                <div className="overview-icon purple">
                                    @
                                </div>

                                <div>
                                    <span>
                                        Email Address
                                    </span>

                                    <strong>
                                        {user?.email ||
                                            "Not available"}
                                    </strong>
                                </div>

                            </div>


                            {/* Phone */}

                            <div className="overview-card">

                                <div className="overview-icon green">
                                    #
                                </div>

                                <div>
                                    <span>
                                        Phone Number
                                    </span>

                                    <strong>
                                        {user?.phone ||
                                            "Not available"}
                                    </strong>
                                </div>

                            </div>


                            {/* Country */}

                            <div className="overview-card">

                                <div className="overview-icon orange">
                                    ◉
                                </div>

                                <div>
                                    <span>
                                        Country
                                    </span>

                                    <strong>
                                        {user?.country ||
                                            "Nigeria"}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        ACCOUNT STATUS
                    ================================= */}

                    <section className="status-section">

                        <div className="status-card">

                            <div className="status-card-left">

                                <div className="status-icon">
                                    ✓
                                </div>

                                <div>
                                    <h3>
                                        Your account is active
                                    </h3>

                                    <p>
                                        You can send money,
                                        receive money and
                                        manage your account.
                                    </p>
                                </div>

                            </div>

                            <Link
                                to="/profile"
                                className="status-button"
                            >
                                Manage Account
                            </Link>

                        </div>

                    </section>


                    {/* Footer */}

                    <footer className="dashboard-footer">
                        <p>
                            © {new Date().getFullYear()}
                            {" "}
                            Richiee Bank. All rights
                            reserved.
                        </p>

                        <div>
                            <Link to="/privacy">
                                Privacy
                            </Link>

                            <Link to="/terms">
                                Terms
                            </Link>

                            <Link to="/support">
                                Support
                            </Link>
                        </div>
                    </footer>

                </div>

            </main>

        </div>
    );
}


export default Dashboard;