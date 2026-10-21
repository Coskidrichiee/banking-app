import { useState } from "react";
import { Link } from "react-router-dom";
import {
    useAuth
} from "../context/useAuth";
import "./Withdraw.css";

function Withdraw() {
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

    const handleContinue = (e) => {
        e.preventDefault();

        if (!formData.amount) {
            return alert("Please enter an amount.");
        }

        alert(
            "Cash withdrawals cannot be completed through the Richieee Banking App.\n\nPlease visit any Richieee Bank branch or use an authorized ATM to withdraw cash."
        );
    };

    return (
        <div className="withdraw-page">

            <header className="withdraw-header">

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
                        Withdraw Funds
                    </h1>
                </div>

            </header>

            <div className="withdraw-card">

                <div className="balance-card">

                    <span>
                        Available Balance
                    </span>

                    <h2>
                        ₦{Number(user?.balance || 0).toLocaleString()}
                    </h2>

                    <small>
                        Account No: {user?.account_number}
                    </small>

                </div>

                {/* <form onSubmit={handleContinue}>

                    <div className="form-group">

                        <label>
                            Withdrawal Amount
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
                            placeholder="Purpose of withdrawal"
                            value={formData.narration}
                            onChange={handleChange}
                        />

                    </div>

                    <button
                        type="submit"
                        className="continue-btn"
                    >
                        Withdrawal Information
                    </button>

                </form> */}

                <div className="withdraw-notice">

                    <div className="notice-icon">
                        🏦
                    </div>

                    <h3>
                        Cash Withdrawal Notice
                    </h3>

                    <p>
                        For your security, cash withdrawals cannot be processed through the Richieee Banking App.
                    </p>

                    <ul>
                        <li>Visit any Richieee Bank branch.</li>
                        <li>Use any Richieee Bank ATM.</li>
                        <li>You may also use partner ATMs where available.</li>
                        <li>Carry your debit card or valid identification.</li>
                        <li>Contact Customer Care if you require assistance.</li>
                    </ul>

                    <div className="notice-box">

                        <strong>
                            Why?
                        </strong>

                        <p>
                            Cash withdrawals require physical verification through our ATM or branch network to keep your account secure.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Withdraw;