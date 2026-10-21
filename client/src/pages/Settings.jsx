import {
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    useAuth
} from "../context/useAuth";

import {
    useTheme
} from "../context/ThemeContext";

import "./Settings.css";


function Settings() {
    const {
        user
    } = useAuth();

    const [
        notifications,
        setNotifications
    ] = useState(true);

    const [
        transactionAlerts,
        setTransactionAlerts
    ] = useState(true);

    const [
        loginAlerts,
        setLoginAlerts
    ] = useState(true);

    const [
        emailNotifications,
        setEmailNotifications
    ] = useState(true);


    const { 
        darkMode, 
        setDarkMode }
         = useTheme();


    const [
        showBalance,
        setShowBalance
    ] = useState(true);

    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    const userInitial =
        user?.full_name
            ?.charAt(0)
            ?.toUpperCase() || "U";


    const handleSavePreferences = () => {
        localStorage.setItem(
            "banking_settings",
            JSON.stringify({
                notifications,
                transactionAlerts,
                loginAlerts,
                emailNotifications,
                darkMode,
                showBalance
            })
        );

        setSuccessMessage(
            "Settings saved successfully."
        );

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
    };


    return (
        <div className="settings-page">

            {/* =================================
                HEADER
            ================================= */}

            <header className="settings-header">

                <div className="settings-header-left">

                    <Link
                        to="/dashboard"
                        className="settings-back-button"
                    >
                        ←
                    </Link>

                    <div>
                        <span>
                            Account
                        </span>

                        <h1>
                            Settings
                        </h1>
                    </div>

                </div>


                <div className="settings-user">

                    <div className="settings-user-avatar">

                        {user?.profile_picture ? (
                            <img
                                src={`https://banking-app-zlqr.onrender.com/uploads/profiles/${user.profile_picture}`}
                                alt={
                                    user.full_name ||
                                    "Profile"
                                }
                            />
                        ) : (
                            userInitial
                        )}

                    </div>

                    <div className="settings-user-info">

                        <strong>
                            {user?.full_name ||
                                "Customer"}
                        </strong>

                        <span>
                            {user?.email || ""}
                        </span>

                    </div>

                </div>

            </header>


            {/* =================================
                CONTENT
            ================================= */}

            <main className="settings-content">

                {/* Intro */}

                <section className="settings-intro">

                    <div>
                        <span>
                            ACCOUNT PREFERENCES
                        </span>

                        <h2>
                            Manage your preferences
                        </h2>

                        <p>
                            Customize your banking
                            experience and account
                            security settings.
                        </p>
                    </div>

                </section>


                {successMessage && (
                    <div className="settings-success">
                        <span>✓</span>
                        {successMessage}
                    </div>
                )}


                {/* =================================
                    GRID
                ================================= */}

                <div className="settings-grid">

                    {/* =================================
                        NOTIFICATIONS
                    ================================= */}

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div>
                                <h3>
                                    Notifications
                                </h3>

                                <p>
                                    Control how we
                                    notify you.
                                </p>
                            </div>

                            <div className="settings-card-icon blue">
                                🔔
                            </div>

                        </div>


                        <div className="settings-options">

                            <div className="settings-option">

                                <div className="settings-option-info">

                                    <strong>
                                        Push Notifications
                                    </strong>

                                    <span>
                                        Receive important
                                        account notifications.
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className={`toggle ${
                                        notifications
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setNotifications(
                                            previous =>
                                                !previous
                                        )
                                    }
                                >
                                    <span />
                                </button>

                            </div>


                            <div className="settings-option">

                                <div className="settings-option-info">

                                    <strong>
                                        Transaction Alerts
                                    </strong>

                                    <span>
                                        Get notified about
                                        account transactions.
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className={`toggle ${
                                        transactionAlerts
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setTransactionAlerts(
                                            previous =>
                                                !previous
                                        )
                                    }
                                >
                                    <span />
                                </button>

                            </div>


                            <div className="settings-option">

                                <div className="settings-option-info">

                                    <strong>
                                        Login Alerts
                                    </strong>

                                    <span>
                                        Be notified when
                                        your account is accessed.
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className={`toggle ${
                                        loginAlerts
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setLoginAlerts(
                                            previous =>
                                                !previous
                                        )
                                    }
                                >
                                    <span />
                                </button>

                            </div>


                            <div className="settings-option">

                                <div className="settings-option-info">

                                    <strong>
                                        Email Notifications
                                    </strong>

                                    <span>
                                        Receive account
                                        updates by email.
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className={`toggle ${
                                        emailNotifications
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setEmailNotifications(
                                            previous =>
                                                !previous
                                        )
                                    }
                                >
                                    <span />
                                </button>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        SECURITY
                    ================================= */}

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div>
                                <h3>
                                    Security
                                </h3>

                                <p>
                                    Protect your
                                    banking account.
                                </p>
                            </div>

                            <div className="settings-card-icon purple">
                                🔐
                            </div>

                        </div>


                        <div className="security-settings">

                            <Link
                                to="/change-password"
                                className="security-setting-link"
                            >

                                <div className="security-setting-icon">
                                    🔑
                                </div>

                                <div>
                                    <strong>
                                        Change Password
                                    </strong>

                                    <span>
                                        Update your
                                        account password.
                                    </span>
                                </div>

                                <span className="arrow">
                                    →
                                </span>

                            </Link>


                            <Link
                                to="/security"
                                className="security-setting-link"
                            >

                                <div className="security-setting-icon">
                                    🛡️
                                </div>

                                <div>
                                    <strong>
                                        Security Center
                                    </strong>

                                    <span>
                                        Review your
                                        security settings.
                                    </span>
                                </div>

                                <span className="arrow">
                                    →
                                </span>

                            </Link>


                            <Link
                                to="/login-activity"
                                className="security-setting-link"
                            >

                                <div className="security-setting-icon">
                                    📱
                                </div>

                                <div>
                                    <strong>
                                        Login Activity
                                    </strong>

                                    <span>
                                        View recent
                                        account activity.
                                    </span>
                                </div>

                                <span className="arrow">
                                    →
                                </span>

                            </Link>

                        </div>

                    </section>


                    {/* =================================
                        DISPLAY
                    ================================= */}

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div>
                                <h3>
                                    Display Preferences
                                </h3>

                                <p>
                                    Customize your
                                    dashboard appearance.
                                </p>
                            </div>

                            <div className="settings-card-icon green">
                                ◐
                            </div>

                        </div>


                        <div className="settings-options">

                            <div className="settings-option">

                                <div className="settings-option-info">

                                    <strong>
                                        Show Account Balance
                                    </strong>

                                    <span>
                                        Display your
                                        balance by default.
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className={`toggle ${
                                        showBalance
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setShowBalance(
                                            previous =>
                                                !previous
                                        )
                                    }
                                >
                                    <span />
                                </button>

                            </div>


                            <div className="theme-setting">

                                <div>
                                    <strong>
                                        Theme
                                    </strong>

                                    <span>
                                        Choose how the
                                        application appears.
                                    </span>
                                </div>

                                <div className="theme-buttons">

                                    <button
                                        type="button"
                                        className={!darkMode ? "theme-button active" : "theme-button"}
                                        onClick={() => setDarkMode(false)}
                                    >
                                        ☀ Light
                                    </button>

                                    <button
                                        type="button"
                                        className={darkMode ? "theme-button active" : "theme-button"}
                                        onClick={() => setDarkMode(true)}
                                    >
                                        🌙 Dark
                                    </button>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        ACCOUNT
                    ================================= */}

                    <section className="settings-card">

                        <div className="settings-card-header">

                            <div>
                                <h3>
                                    Account
                                </h3>

                                <p>
                                    Manage your
                                    account information.
                                </p>
                            </div>

                            <div className="settings-card-icon orange">
                                ⚙
                            </div>

                        </div>


                        <div className="account-settings-list">

                            <Link
                                to="/profile"
                                className="account-setting-link"
                            >
                                <span>
                                    Edit Profile
                                </span>

                                <span>
                                    →
                                </span>
                            </Link>


                            <Link
                                to="/support"
                                className="account-setting-link"
                            >
                                <span>
                                    Contact Support
                                </span>

                                <span>
                                    →
                                </span>
                            </Link>


                            <Link
                                to="/privacy"
                                className="account-setting-link"
                            >
                                <span>
                                    Privacy Policy
                                </span>

                                <span>
                                    →
                                </span>
                            </Link>


                            <Link
                                to="/terms"
                                className="account-setting-link"
                            >
                                <span>
                                    Terms & Conditions
                                </span>

                                <span>
                                    →
                                </span>
                            </Link>

                        </div>

                    </section>

                </div>


                {/* =================================
                    SAVE BUTTON
                ================================= */}

                <div className="settings-actions">

                    <button
                        type="button"
                        className="save-settings-button"
                        onClick={
                            handleSavePreferences
                        }
                    >
                        Save Settings
                    </button>

                </div>


                {/* =================================
                    SECURITY NOTICE
                ================================= */}

                <section className="settings-security-notice">

                    <div className="notice-icon">
                        🔒
                    </div>

                    <div>
                        <strong>
                            Your security matters
                        </strong>

                        <p>
                            Richiee Bank will never ask
                            for your password, PIN or
                            verification code through
                            email or phone calls.
                        </p>
                    </div>

                </section>


                {/* Footer */}

                <footer className="settings-footer">

                    <span>
                        © {new Date().getFullYear()}
                        Richiee Bank
                    </span>

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

            </main>

        </div>
    );
}


export default Settings;