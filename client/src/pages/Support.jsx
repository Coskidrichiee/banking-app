import { Link } from "react-router-dom";
import "./Support.css";

function Support() {
    return (
        <div className="support-page">

            <header className="support-header">

                <Link
                    to="/dashboard"
                    className="back-btn"
                >
                    ←
                </Link>

                <div>
                    <h1>Customer Support</h1>
                    <p>
                        We're available to assist you anytime.
                    </p>
                </div>

            </header>


            <div className="support-container">

                <div className="support-box">

                    <div className="support-title">

                        <div className="support-circle">
                            💬
                        </div>

                        <div>
                            <h2>Contact Richiee Bank</h2>
                            <p>
                                Reach us through any of the
                                channels below.
                            </p>
                        </div>

                    </div>

                    <div className="support-item">

                        <span>📞</span>

                        <div>
                            <strong>Phone</strong>
                            <p>+234 800 123 4567</p>
                        </div>

                    </div>

                    <div className="support-item">

                        <span>✉️</span>

                        <div>
                            <strong>Email</strong>
                            <p>support@richieebank.com</p>
                        </div>

                    </div>

                    <div className="support-item">

                        <span>💬</span>

                        <div>
                            <strong>Live Chat</strong>
                            <p>
                                Available Monday - Sunday
                            </p>
                        </div>

                    </div>

                    <div className="support-item">

                        <span>🏦</span>

                        <div>
                            <strong>Visit a Branch</strong>

                            <p>
                                Locate your nearest Richiee
                                Bank branch for account
                                enquiries and assistance.
                            </p>
                        </div>

                    </div>

                    <div className="support-item">

                        <span>🕒</span>

                        <div>
                            <strong>Support Hours</strong>

                            <p>
                                24 Hours • 7 Days a Week
                            </p>
                        </div>

                    </div>

                </div>


                <div className="faq-card">

                    <h2>Frequently Asked Questions</h2>

                    <div className="faq">

                        <h4>
                            I forgot my transaction PIN
                        </h4>

                        <p>
                            Visit the nearest Richiee Bank
                            branch or contact customer
                            support to reset your PIN.
                        </p>

                    </div>

                    <div className="faq">

                        <h4>
                            My transfer failed
                        </h4>

                        <p>
                            If your account has been debited,
                            the funds are usually reversed
                            automatically within 24 hours.
                        </p>

                    </div>

                    <div className="faq">

                        <h4>
                            My card is blocked
                        </h4>

                        <p>
                            Contact customer support
                            immediately or visit the nearest
                            branch.
                        </p>

                    </div>

                    <Link
                        to="/dashboard"
                        className="home-btn"
                    >
                        Back to Dashboard
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Support;