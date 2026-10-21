
import {
    NavLink,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    FaUniversity,
    FaChartPie,
    FaUsers,
    FaExchangeAlt,
    FaMoneyBillWave,
    FaWallet,
    FaCreditCard,
    FaUserShield,
    FaCog,
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";

import "../css/sidebar.css";


function Sidebar({
    open = false,
    closeSidebar = () => {}
}) {

    const navigate = useNavigate();
    const location = useLocation();


    /* =========================================
       LOGOUT
    ========================================= */

    const handleLogout = () => {

        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate(
            "/admin/login",
            {
                replace: true
            }
        );

    };


    /* =========================================
       ADMIN MENU
    ========================================= */

    const menuItems = [

        {
            name: "Dashboard",
            icon: <FaChartPie />,
            path: "/admin/dashboard"
        },

        {
            name: "Users",
            icon: <FaUsers />,
            path: "/admin/users"
        },

        {
            name: "Transactions",
            icon: <FaExchangeAlt />,
            path: "/admin/transactions"
        },

        {
            name: "Deposits",
            icon: <FaMoneyBillWave />,
            path: "/admin/deposits"
        },

        {
            name: "Withdrawals",
            icon: <FaWallet />,
            path: "/admin/withdrawals"
        },

        {
            name: "Cards",
            icon: <FaCreditCard />,
            path: "/admin/cards"
        },

        {
            name: "Administrators",
            icon: <FaUserShield />,
            path: "/admin/admins"
        },

        {
            name: "Settings",
            icon: <FaCog />,
            path: "/admin/settings"
        }

    ];


    /* =========================================
       CLOSE SIDEBAR
    ========================================= */

    const handleNavigation = () => {

        if (
            typeof closeSidebar === "function"
        ) {

            closeSidebar();

        }

    };


    /* =========================================
       CHECK ACTIVE SECTION
    ========================================= */

    const isMenuActive = (path) => {

        if (
            path === "/admin/dashboard"
        ) {

            return (
                location.pathname ===
                "/admin/dashboard"
            );

        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(
                `${path}/`
            )
        );

    };


    /* =========================================
       RENDER
    ========================================= */

    return (

        <>

            {/* =====================================
                MOBILE OVERLAY
            ===================================== */}

            <div

                className={
                    open
                        ? "sidebar-overlay show"
                        : "sidebar-overlay"
                }

                onClick={handleNavigation}

                aria-hidden={!open}

            />


            {/* =====================================
                SIDEBAR
            ===================================== */}

            <aside

                className={
                    open
                        ? "admin-sidebar show"
                        : "admin-sidebar"
                }

                aria-label="Admin navigation"

            >


                {/* =================================
                    HEADER
                ================================= */}

                <div className="sidebar-header">


                    <div className="brand">


                        <div className="brand-icon">

                            <FaUniversity />

                        </div>


                        <div className="brand-text">

                            <h2>
                                Richiee Bank
                            </h2>

                            <span>
                                Admin Portal
                            </span>

                        </div>


                    </div>


                    {/* MOBILE CLOSE */}

                    <button

                        type="button"

                        className="close-sidebar"

                        onClick={handleNavigation}

                        aria-label="Close sidebar"

                    >

                        <FaTimes />

                    </button>


                </div>


                {/* =================================
                    MENU
                ================================= */}

                <nav
                    className="sidebar-menu"
                    aria-label="Admin menu"
                >

                    {
                        menuItems.map(
                            (item) => {

                                const active =
                                    isMenuActive(
                                        item.path
                                    );


                                return (

                                    <NavLink

                                        key={
                                            item.path
                                        }

                                        to={
                                            item.path
                                        }

                                        onClick={
                                            handleNavigation
                                        }

                                        className={
                                            active
                                                ? "sidebar-link active"
                                                : "sidebar-link"
                                        }

                                        aria-current={
                                            active
                                                ? "page"
                                                : undefined
                                        }

                                    >


                                        <span
                                            className="menu-icon"
                                            aria-hidden="true"
                                        >

                                            {
                                                item.icon
                                            }

                                        </span>


                                        <span
                                            className="menu-label"
                                        >

                                            {
                                                item.name
                                            }

                                        </span>


                                    </NavLink>

                                );

                            }
                        )
                    }

                </nav>


                {/* =================================
                    FOOTER
                ================================= */}

                <div className="sidebar-footer">


                    {/* ADMIN PROFILE */}

                    <div className="admin-profile">


                        <div className="profile-avatar">

                            A

                        </div>


                        <div className="admin-profile-info">

                            <strong>
                                Administrator
                            </strong>

                            <small>
                                Super Admin
                            </small>

                        </div>


                    </div>


                    {/* LOGOUT */}

                    <button

                        type="button"

                        className="logout-btn"

                        onClick={
                            handleLogout
                        }

                    >

                        <FaSignOutAlt />

                        <span>
                            Logout
                        </span>

                    </button>


                </div>


            </aside>

        </>

    );

}


export default Sidebar;