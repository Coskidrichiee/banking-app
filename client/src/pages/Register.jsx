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

import "./Register.css";


function Register() {
    const navigate =
        useNavigate();

    const {
        register
    } = useAuth();


    const [formData, setFormData] =
        useState({
            fullName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: ""
        });


    const [showPassword, setShowPassword] =
        useState(false);


    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);


    const [acceptedTerms, setAcceptedTerms] =
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
                !formData.fullName ||
                !formData.email ||
                !formData.phone ||
                !formData.password ||
                !formData.confirmPassword
            ) {
                setError(
                    "Please complete all required fields."
                );

                return;
            }


            if (
                formData.password.length < 8
            ) {
                setError(
                    "Password must contain at least 8 characters."
                );

                return;
            }


            if (
                formData.password !==
                formData.confirmPassword
            ) {
                setError(
                    "Passwords do not match."
                );

                return;
            }


            if (!acceptedTerms) {
                setError(
                    "Please accept the Terms & Conditions and Privacy Policy."
                );

                return;
            }


            try {
                setLoading(true);

                await register({
                    fullName:
                        formData.fullName.trim(),

                    email:
                        formData.email
                            .trim()
                            .toLowerCase(),

                    phone:
                        formData.phone.trim(),

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
                    "Unable to create your account."
                );
            } finally {
                setLoading(false);
            }
        };


    return (
        <div className="register-page">

            {/* =====================================
                BRANDING
            ===================================== */}

            <div className="register-brand">

                <div className="register-brand-content">

                    <div className="register-brand-logo">
                        <span>R</span>
                    </div>

                    <h1>
                        Join Richiee Bank
                    </h1>

                    <p>
                        Create your account and enjoy
                        secure, convenient and smarter
                        banking from anywhere.
                    </p>


                    <div className="register-features">

                        <div className="register-feature">

                            <span className="register-feature-icon">
                                ✓
                            </span>

                            <div>
                                <strong>
                                    Secure Account
                                </strong>

                                <p>
                                    Your personal
                                    information is protected.
                                </p>
                            </div>

                        </div>


                        <div className="register-feature">

                            <span className="register-feature-icon">
                                ✓
                            </span>

                            <div>
                                <strong>
                                    Easy Transactions
                                </strong>

                                <p>
                                    Send and receive
                                    money with ease.
                                </p>
                            </div>

                        </div>


                        <div className="register-feature">

                            <span className="register-feature-icon">
                                ✓
                            </span>

                            <div>
                                <strong>
                                    24/7 Access
                                </strong>

                                <p>
                                    Manage your account
                                    anytime, anywhere.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================
                REGISTER SECTION
            ===================================== */}

            <div className="register-section">

                <div className="register-card">

                    {/* Mobile Logo */}

                    <div className="register-mobile-logo">

                        <div className="register-brand-logo">
                            <span>R</span>
                        </div>

                        <h2>
                            Richiee Bank
                        </h2>

                    </div>


                    {/* Header */}

                    <div className="register-header">

                        <h2>
                            Create Your Account
                        </h2>

                        <p>
                            Fill in your details to get started
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
                        className="register-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* Full Name */}

                        <div className="register-form-group">

                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    👤
                                </span>

                                <input
                                    id="fullName"
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={
                                        formData.fullName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="name"
                                    required
                                />

                            </div>

                        </div>


                        {/* Email */}

                        <div className="register-form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
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


                        {/* Phone */}

                        <div className="register-form-group">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    📱
                                </span>

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="tel"
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}

                        <div className="register-form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
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
                                    placeholder="Create a password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
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

                            <small className="register-password-hint">
                                Use at least 8 characters.
                            </small>

                        </div>


                        {/* Confirm Password */}

                        <div className="register-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    🔐
                                </span>

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            previous =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword
                                        ? "🙈"
                                        : "👁"}
                                </button>

                            </div>

                        </div>


                        {/* Terms */}

                        <div className="register-terms">

                            <label className="register-checkbox-label">

                                <input
                                    type="checkbox"
                                    checked={
                                        acceptedTerms
                                    }
                                    onChange={
                                        event =>
                                            setAcceptedTerms(
                                                event.target.checked
                                            )
                                    }
                                />

                                <span className="register-custom-checkbox"></span>

                                <span>
                                    I agree to the{" "}
                                    <Link to="/terms">
                                        Terms & Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy">
                                        Privacy Policy
                                    </Link>
                                    .
                                </span>

                            </label>

                        </div>


                        {/* Submit */}

                        <button
                            type="submit"
                            className="register-submit-button"
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
                                    ? "Creating Account..."
                                    : "Create Account"}
                            </span>

                            {!loading && (
                                <span className="register-button-arrow">
                                    →
                                </span>
                            )}

                        </button>

                    </form>


                    {/* Login */}

                    <div className="register-login-link">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>


                    <p className="register-security-text">
                        🔐 Your information is protected
                        with industry-standard security.
                    </p>

                </div>

            </div>

        </div>
    );
}


export default Register;