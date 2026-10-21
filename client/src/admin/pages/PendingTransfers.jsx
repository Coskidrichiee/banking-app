// client/src/admin/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/api";

import {
    FaUniversity,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
    FaArrowRight,
    FaSpinner
} from "react-icons/fa";

import "../css/login.css";

function Login() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({

        email: "",

        password: "",

        remember: false

    });

    // =========================================
    // Handle Input
    // =========================================

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };

    // =========================================
    // Login
    // =========================================

    const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");


    if (
        !formData.email ||
        !formData.password
    ) {

        return setError(
            "Please enter your email and password."
        );

    }


    try {

        setLoading(true);


        const data = await loginAdmin({

            email:
                formData.email
                    .trim()
                    .toLowerCase(),

            password:
                formData.password

        });


        if (!data.success) {

            throw new Error(

                data.message ||
                "Admin login failed."

            );

        }


        /*
        ==========================================
        SAVE ADMIN SESSION
        ==========================================
        */

        localStorage.setItem(

            "adminToken",

            data.token

        );


        localStorage.setItem(

            "banking_admin_token",

            data.token

        );


        localStorage.setItem(

            "admin",

            JSON.stringify(
                data.admin
            )

        );


        localStorage.setItem(

            "banking_admin",

            JSON.stringify(
                data.admin
            )

        );


        if (formData.remember) {

            localStorage.setItem(

                "rememberAdmin",

                "true"

            );

        }

        else {

            localStorage.removeItem(
                "rememberAdmin"
            );

        }


        setSuccess(
            "Login successful."
        );


        setTimeout(() => {

            navigate(
                "/admin/dashboard"
            );

        }, 500);


    }

    catch (err) {

        console.error(
            "Admin login error:",
            err
        );


        setError(

            err.response?.data?.message ||

            err.message ||

            "Unable to connect to server."

        );

    }

    finally {

        setLoading(false);

    }

};

    return (

        <div className="admin-login-page">

            <div className="login-overlay"></div>

            <div className="login-container">

                {/* LEFT */}

                <div className="login-left">

                    <div className="bank-logo">

                        <FaUniversity />

                    </div>

                    <h1>

                        Richiee Bank

                    </h1>

                    <h2>

                        Administration Portal

                    </h2>

                    <p>

                        Secure administrator access for
                        managing customers, balances,
                        transfers, deposits, withdrawals,
                        transactions and cards.

                    </p>

                    <div className="security-card">

                        <FaShieldAlt />

                        <div>

                            <strong>

                                Secure Authentication

                            </strong>

                            <span>

                                JWT Authentication,
                                encrypted passwords and
                                role-based authorization.

                            </span>

                        </div>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="login-right">

                    <form

                        className="login-form"

                        onSubmit={handleSubmit}

                    >

                        <div className="form-title">

                            <h2>

                                Admin Login

                            </h2>

                            <p>

                                Sign in to continue

                            </p>

                        </div>

                        {error && (

                            <div className="alert error">

                                {error}

                            </div>

                        )}

                        {success && (

                            <div className="alert success">

                                {success}

                            </div>

                        )}

                        {/* Email */}

                        <div className="input-group">

                            <label>

                                Email Address

                            </label>

                            <div className="input-box">

                                <FaEnvelope />

                                <input

                                    type="email"

                                    name="email"

                                    placeholder="admin@richieebank.com"

                                    value={formData.email}

                                    onChange={handleChange}

                                />

                            </div>

                        </div>

                        {/* Password */}

                        <div className="input-group">

                            <label>

                                Password

                            </label>

                            <div className="input-box">

                                <FaLock />

                                <input

                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }

                                    name="password"

                                    placeholder="Enter Password"

                                    value={formData.password}

                                    onChange={handleChange}

                                />

                                <button

                                    type="button"

                                    className="password-btn"

                                    onClick={() =>

                                        setShowPassword(

                                            !showPassword

                                        )

                                    }

                                >

                                    {

                                        showPassword

                                            ? <FaEyeSlash />

                                            : <FaEye />

                                    }

                                </button>

                            </div>

                        </div>

                        {/* Remember */}

                        <div className="remember-row">

                            <label className="remember-label">

                                <input

                                    type="checkbox"

                                    name="remember"

                                    checked={formData.remember}

                                    onChange={handleChange}

                                />

                                Remember Me

                            </label>

                        </div>

                        {/* Button */}

                        <button

                            type="submit"

                            className="login-btn"

                            disabled={loading}

                        >

                            {

                                loading

                                    ? (

                                        <>

                                            <FaSpinner className="spin" />

                                            Signing In...

                                        </>

                                    )

                                    : (

                                        <>

                                            Login

                                            <FaArrowRight />

                                        </>

                                    )

                            }

                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default Login;
