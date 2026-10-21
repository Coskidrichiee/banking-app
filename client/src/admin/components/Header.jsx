import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaBars,
    FaBell,
    FaUserCircle,
    FaSearch,
    FaSignOutAlt,
    FaCog,
    FaUser
} from "react-icons/fa";

import "../css/Header.css";


export default function Header({
    title = "Richiee Bank Admin",
    subtitle = "Administration Dashboard"
}) {


    const navigate = useNavigate();


    const [
        profileOpen,
        setProfileOpen
    ] = useState(false);



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
                replace:true
            }
        );

    };



    return (

        <header className="admin-header">


            {/* LEFT */}

            <div className="header-left">


                <button
                    className="menu-btn"
                >

                    <FaBars />

                </button>



                <div className="header-title">

                    <h2>

                        {title}

                    </h2>


                    <p>

                        {subtitle}

                    </p>

                </div>


            </div>





            {/* SEARCH */}


            <div className="header-search">


                <FaSearch />


                <input

                    type="text"

                    placeholder="Search customers, transactions..."

                />


            </div>







            {/* RIGHT */}


            <div className="header-right">



                <button
                    className="icon-btn"
                >

                    <FaBell />


                    <span className="notification">

                        3

                    </span>


                </button>







                <div
                    className="profile"
                    onClick={() =>
                        setProfileOpen(
                            !profileOpen
                        )
                    }
                >


                    <FaUserCircle
                        className="avatar"
                    />


                    <div className="profile-info">

                        <strong>
                            Administrator
                        </strong>


                        <small>
                            Super Admin
                        </small>

                    </div>





                    {profileOpen && (


                        <div
                            className="profile-dropdown"
                        >



                            <button>

                                <FaUser/>

                                Profile

                            </button>



                            <button>

                                <FaCog/>

                                Settings

                            </button>



                            <button
                                onClick={
                                    handleLogout
                                }
                            >

                                <FaSignOutAlt/>

                                Logout

                            </button>


                        </div>


                    )}



                </div>



            </div>



        </header>


    );

}