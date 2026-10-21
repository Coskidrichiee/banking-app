// src/admin/components/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useState } from "react";

import {
    FaChartPie,
    FaUsers,
    FaUserPlus,
    FaMoneyBillWave,
    FaExchangeAlt,
    FaClock,
    FaArrowDown,
    FaArrowUp,
    FaListAlt,
    FaCreditCard,
    FaCog,
    FaSignOutAlt,
    FaUniversity,
    FaBars,
    FaTimes,
} from "react-icons/fa";

import "../css/sidebar.css";

export default function Sidebar() {

    const [open, setOpen] = useState(false);

    const menuItems = [
        {
            title: "Dashboard",
            path: "/admin/dashboard",
            icon: <FaChartPie />,
        },
        {
            title: "Users",
            path: "/admin/users",
            icon: <FaUsers />,
        },
        {
            title: "Add User",
            path: "/admin/add-user",
            icon: <FaUserPlus />,
        },
        {
            title: "Top Up",
            path: "/admin/topup",
            icon: <FaMoneyBillWave />,
        },
        {
            title: "Transfers",
            path: "/admin/transfers",
            icon: <FaExchangeAlt />,
        },
        {
            title: "Pending Transfers",
            path: "/admin/pending-transfers",
            icon: <FaClock />,
        },
        {
            title: "Deposit Requests",
            path: "/admin/deposits",
            icon: <FaArrowDown />,
        },
        {
            title: "Withdraw Requests",
            path: "/admin/withdraws",
            icon: <FaArrowUp />,
        },
        {
            title: "Transactions",
            path: "/admin/transactions",
            icon: <FaListAlt />,
        },
        {
            title: "Cards",
            path: "/admin/cards",
            icon: <FaCreditCard />,
        },
        {
            title: "Settings",
            path: "/admin/settings",
            icon: <FaCog />,
        },
    ];

    return (
        <>
            {/* Mobile Toggle */}

            <button
                className="sidebar-toggle"
                onClick={() => setOpen(true)}
            >
                <FaBars />
            </button>

            {/* Overlay */}

            <div
                className={`sidebar-overlay ${open ? "show" : ""}`}
                onClick={() => setOpen(false)}
            />

            {/* Sidebar */}

            <aside
                className={`admin-sidebar ${open ? "show" : ""}`}
            >

                {/* Close Button */}

                <button
                    className="sidebar-close"
                    onClick={() => setOpen(false)}
                >
                    <FaTimes />
                </button>

                {/* Logo */}

                <div className="sidebar-logo">

                    <div className="logo-icon">
                        <FaUniversity />
                    </div>

                    <div>

                        <h2>Richiee Bank</h2>

                        <span>Administrator</span>

                    </div>

                </div>

                {/* Navigation */}

                <nav className="sidebar-menu">

                    {menuItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.title}
                            </span>

                        </NavLink>

                    ))}

                </nav>

                {/* Footer */}

                <div className="sidebar-footer">

                    <button
                        className="logout-button"
                        onClick={() => {

                            localStorage.removeItem("adminToken");

                            window.location.href =
                                "/admin/login";

                        }}
                    >

                        <FaSignOutAlt />

                        <span>Logout</span>

                    </button>

                </div>

            </aside>
        </>
    );
}