import { useState } from "react";
import { Link } from "react-router-dom";
import {
    useAuth
} from "../context/useAuth";
import "./Deposit.css";

function Deposit() {

    const { user } = useAuth();

    const [formData, setFormData] = useState({
        amount: "",
        narration: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!formData.amount) {
            return alert("Please enter the amount you wish to deposit.");
        }

        alert(
            "Cash deposits cannot be completed through the Richieee Banking App.\n\nPlease visit any Richieee Bank branch or use an approved Cash Deposit ATM or Agent Banking location."
        );

    };

    return (

        <div className="deposit-page">

            <header className="deposit-header">

                <Link
                    to="/dashboard"
                    className="back-btn"
                >
                    ←
                </Link>

                <div>

                    <span className="page-label">
                        Banking
                    </span>

                    <h1>
                        Deposit Funds
                    </h1>

                </div>

            </header>

            <div className="deposit-card">

                <div className="balance-card">

                    <span>
                        Current Balance
                    </span>

                    <h2>
                        ₦{Number(user?.balance || 0).toLocaleString()}
                    </h2>

                    <small>
                        Account No: {user?.account_number}
                    </small>

                </div>

                {/* <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Deposit Amount
                        </label>

                        <input
                            type="number"
                            name="amount"
                            placeholder="Enter amount"
                            value={formData.amount}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Narration (Optional)
                        </label>

                        <textarea
                            rows="4"
                            name="narration"
                            placeholder="Deposit narration"
                            value={formData.narration}
                            onChange={handleChange}
                        />

                    </div>

                    <button
                        type="submit"
                        className="continue-btn"
                    >
                        Deposit Information
                    </button>

                </form> */}

                <div className="deposit-notice">

                    <div className="notice-icon">
                        🏦
                    </div>

                    <h3>
                        Deposit Notice
                    </h3>

                    <p>
                        Cash deposits are not available through the Richieee Banking App.
                    </p>

                    <ul>

                        <li>
                            Visit any Richieee Bank branch.
                        </li>

                        <li>
                            Use an authorized Cash Deposit ATM.
                        </li>

                        <li>
                            Deposit through an approved Richieee Bank Agent.
                        </li>

                        <li>
                            Keep your deposit receipt until your account is credited.
                        </li>

                    </ul>

                    <div className="notice-box">

                        <strong>
                            Need Faster Deposits?
                        </strong>

                        <p>
                            Online deposits will become available in a future update through secure payment gateways and bank transfer channels.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Deposit;