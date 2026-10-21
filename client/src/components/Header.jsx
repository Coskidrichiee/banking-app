import { FaBell, FaSearch } from "react-icons/fa";
import "../css/admin.css";

export default function Header({
    title,
    subtitle,
}) {
    return (
        <header className="admin-header">

            <div className="admin-header-left">

                <div>

                    <span className="header-subtitle">
                        {subtitle}
                    </span>

                    <h1>
                        {title}
                    </h1>

                </div>

            </div>

            <div className="admin-header-right">

                {/* Search */}

                <div className="admin-search">

                    <FaSearch className="search-icon" />

                    <input
                        type="text"
                        placeholder="Search users, transfers..."
                    />

                </div>

                {/* Notification */}

                <button className="notification-btn">

                    <FaBell />

                    <span className="notification-badge">
                        5
                    </span>

                </button>

                {/* Admin */}

                <div className="admin-profile">

                    <div className="admin-avatar">
                        A
                    </div>

                    <div>

                        <strong>
                            Administrator
                        </strong>

                        <small>
                            Super Admin
                        </small>

                    </div>

                </div>

            </div>

        </header>
    );
}