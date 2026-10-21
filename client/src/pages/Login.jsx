import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/useAuth";

import "./Login.css";


function Login() {
    const navigate =
        useNavigate();

    const {
        login
    } = useAuth();


    const [formData, setFormData] =
        useState({
            email: "",
            password: ""
        });


    const [showPassword, setShowPassword] =
        useState(false);


    const [error, setError] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData(
            previous => ({
                ...previous,
                [name]: value
            })
        );

        if (error) {
            setError("");
        }
    };


    const handleSubmit =
        async (event) => {
            event.preventDefault();

            setError("");

            if (
                !formData.email ||
                !formData.password
            ) {
                setError(
                    "Please enter your email and password."
                );

                return;
            }

            try {
                setLoading(true);

                await login({
                    email: formData.email,
                    password:
                        formData.password
                });

                navigate(
                    "/dashboard",
                    {
                        replace: true
                    }
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Unable to login."
                );
            } finally {
                setLoading(false);
            }
        };


    return (
        <div className="login-page">

            {/* =====================================
                LEFT BRANDING
            ===================================== */}

            <div className="login-brand">

                <div className="brand-content">

                    <div className="brand-logo">
                        <span>R</span>
                    </div>

                    <h1>
                        Richiee Bank
                    </h1>

                    <p>
                        Secure, simple and smarter
                        banking at your fingertips.
                    </p>

                    <div className="brand-features">

                        <div className="feature-item">
                            <span className="feature-icon">
                                ✓
                            </span>

                            <span>
                                Secure Banking
                            </span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-icon">
                                ✓
                            </span>

                            <span>
                                Fast Transactions
                            </span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-icon">
                                ✓
                            </span>

                            <span>
                                24/7 Access
                            </span>
                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================
                LOGIN SECTION
            ===================================== */}

            <div className="login-section">

                <div className="login-card">

                    {/* Mobile Logo */}

                    <div className="mobile-logo">

                        <div className="brand-logo">
                            <span>R</span>
                        </div>

                        <h2>
                            Richiee Bank
                        </h2>

                    </div>


                    {/* Header */}

                    <div className="login-header">

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Sign in to access your account
                        </p>

                    </div>


                    {/* Error */}

                    {error && (
                        <div
                            style={{
                                marginBottom: "18px",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                background: "#fff1f2",
                                border: "1px solid #fecdd3",
                                color: "#be123c",
                                fontSize: "13px",
                                lineHeight: "1.5"
                            }}
                        >
                            {error}
                        </div>
                    )}


                    {/* Form */}

                    <form
                        className="login-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* Email */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}

                        <div className="form-group">

                            <div className="password-label">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <Link to="/forgot-password">
                                    Forgot password?
                                </Link>

                            </div>


                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            previous =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? "🙈"
                                        : "👁"}
                                </button>

                            </div>

                        </div>


                        {/* Remember */}

                        <div className="form-options">

                            <label className="remember-me">

                                <input
                                    type="checkbox"
                                    name="remember"
                                />

                                <span className="custom-checkbox"></span>

                                <span>
                                    Remember me
                                </span>

                            </label>

                        </div>


                        {/* Submit */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                            style={{
                                opacity:
                                    loading
                                        ? 0.7
                                        : 1,
                                cursor:
                                    loading
                                        ? "not-allowed"
                                        : "pointer"
                            }}
                        >

                            <span>
                                {loading
                                    ? "Signing in..."
                                    : "Sign In"}
                            </span>

                            {!loading && (
                                <span className="button-arrow">
                                    →
                                </span>
                            )}

                        </button>

                    </form>


                    {/* Divider */}

                    <div className="divider">
                        <span>
                            New to Richiee Bank?
                        </span>
                    </div>


                    {/* Register */}

                    <Link
                        to="/register"
                        className="register-button"
                    >
                        Create an Account
                    </Link>


                    {/* Security */}

                    <p className="security-text">
                        🔐 Your information is protected
                        with industry-standard security.
                    </p>

                </div>

            </div>

        </div>
    );
}


export default Login;