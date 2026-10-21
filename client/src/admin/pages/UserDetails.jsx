import { useEffect, useState } from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import axios from "axios";

import Swal from "sweetalert2";

import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaWallet,
    FaMapMarkerAlt,
    FaIdCard,
    FaLock,
    FaUnlock,
    FaTrash,
    FaEdit,
    FaCalendarAlt,
    FaCity,
    FaGlobe,
    FaSpinner
} from "react-icons/fa";

import "../css/userDetails.css";

function UserDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [processing, setProcessing] = useState(false);

    const API =
        "http://localhost:5000/api/admin/users";

    useEffect(() => {

        fetchUser();

    }, [id]);



    // ============================================
    // FETCH USER
    // ============================================

    const fetchUser = async () => {

        try {

            setLoading(true);

            const res = await axios.get(
                `${API}/${id}`
            );

            setUser(res.data.user);

        } catch (err) {

            console.error(err);

            Swal.fire({
                icon: "error",
                title: "User Not Found",
                text: "Unable to retrieve user information."
            });

        } finally {

            setLoading(false);

        }

    };



    // ============================================
    // BLOCK / UNBLOCK USER
    // ============================================

    const toggleUserStatus = async () => {

        if (!user) return;

        const action =
            user.status === "blocked"
                ? "unblock"
                : "block";

        const title =
            action === "block"
                ? "Block this user?"
                : "Unblock this user?";

        const confirm = await Swal.fire({

            title,

            text:
                action === "block"
                    ? "The user will not be able to access the account."
                    : "The user will regain account access.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText:
                action === "block"
                    ? "Block"
                    : "Unblock"

        });

        if (!confirm.isConfirmed) return;

        try {

            setProcessing(true);

            await axios.patch(
                `${API}/${id}/${action}`
            );

            Swal.fire({
                icon: "success",
                title:
                    action === "block"
                        ? "User Blocked"
                        : "User Unblocked",
                timer: 1500,
                showConfirmButton: false
            });

            fetchUser();

        } catch (err) {

            console.error(err);

            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text: "Unable to update user status."
            });

        } finally {

            setProcessing(false);

        }

    };



    // ============================================
    // DELETE USER
    // ============================================

    const deleteUser = async () => {

        const confirm = await Swal.fire({

            title: "Delete User?",

            text:
                "This action cannot be undone.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonColor: "#dc3545",

            confirmButtonText: "Delete"

        });

        if (!confirm.isConfirmed) return;

        try {

            setProcessing(true);

            await axios.delete(
                `${API}/${id}`
            );

            await Swal.fire({

                icon: "success",

                title: "Deleted",

                text: "User deleted successfully."

            });

            navigate("/admin/users");

        } catch (err) {

            console.error(err);

            Swal.fire({

                icon: "error",

                title: "Delete Failed",

                text:
                    "Unable to delete this user."

            });

        } finally {

            setProcessing(false);

        }

    };
        // ============================================
    // LOADING SCREEN
    // ============================================

    if (loading) {

        return (

            <div className="loading-page">

                <FaSpinner className="spinner"/>

                <h3>
                    Loading User Details...
                </h3>

            </div>

        );

    }



    // ============================================
    // USER NOT FOUND
    // ============================================

    if (!user) {

        return (

            <div className="error-page">

                <h2>
                    User Not Found
                </h2>

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate("/admin/users")
                    }
                >

                    <FaArrowLeft/>

                    Back To Users

                </button>

            </div>

        );

    }



    return (

        <div className="user-details-page">


            {/* ==============================
                PAGE HEADER
            =============================== */}

            <div className="user-details-header">


                <button

                    className="back-btn"

                    onClick={() =>
                        navigate("/admin/users")
                    }

                >

                    <FaArrowLeft/>

                    Back

                </button>



                <h2>

                    User Profile

                </h2>


            </div>





            {/* ==============================
                HERO PROFILE CARD
            =============================== */}


            <div className="profile-hero">


                <div className="profile-image">


                    {
                        user.profile_picture

                        ?

                        <img

                            src={
                                `http://localhost:5000${user.profile_picture}`
                            }

                            alt={
                                user.full_name
                            }

                        />

                        :

                        <div className="default-avatar">

                            <FaUser/>

                        </div>

                    }


                </div>




                <div className="profile-content">


                    <h1>

                        {user.full_name}

                    </h1>



                    <p className="account-number">

                        <FaIdCard/>

                        Account:

                        {" "}

                        {user.account_number}

                    </p>




                    <span

                        className={
                            `status ${user.status}`
                        }

                    >

                        {user.status}

                    </span>



                </div>



                {/* ==============================
                    ACTION BUTTONS
                =============================== */}


                <div className="profile-actions">


                    <button

                        className="edit-btn"

                        onClick={() =>
                            navigate(
                                `/admin/users/edit/${user.id}`
                            )
                        }

                    >

                        <FaEdit/>

                        Edit

                    </button>





                    <button

                        className={
                            user.status === "blocked"
                            ?
                            "unblock-btn"
                            :
                            "block-btn"
                        }


                        disabled={processing}


                        onClick={
                            toggleUserStatus
                        }

                    >


                        {
                            user.status === "blocked"

                            ?

                            <>

                                <FaUnlock/>

                                Unblock

                            </>

                            :

                            <>

                                <FaLock/>

                                Block

                            </>

                        }


                    </button>





                    <button

                        className="delete-btn"

                        disabled={processing}


                        onClick={
                            deleteUser
                        }

                    >

                        <FaTrash/>

                        Delete

                    </button>



                </div>


            </div>
                        {/* ==============================
                USER DETAILS GRID
            =============================== */}


            <div className="details-grid">



                <div className="detail-card">

                    <div className="detail-icon">

                        <FaEnvelope/>

                    </div>


                    <div className="detail-content">

                        <span>
                            Email Address
                        </span>


                        <h4>
                            {user.email}
                        </h4>

                    </div>


                </div>





                <div className="detail-card">

                    <div className="detail-icon">

                        <FaPhone/>

                    </div>


                    <div className="detail-content">

                        <span>
                            Phone Number
                        </span>


                        <h4>
                            {
                                user.phone
                                ||
                                "Not Available"
                            }
                        </h4>


                    </div>


                </div>







                <div className="detail-card">


                    <div className="detail-icon">

                        <FaIdCard/>

                    </div>


                    <div className="detail-content">

                        <span>
                            Account Number
                        </span>


                        <h4>
                            {
                                user.account_number
                                ||
                                "N/A"
                            }
                        </h4>


                    </div>


                </div>







                <div className="detail-card">


                    <div className="detail-icon">

                        <FaWallet/>

                    </div>


                    <div className="detail-content">


                        <span>
                            Account Type
                        </span>


                        <h4>
                            {
                                user.account_type
                                ||
                                "Savings"
                            }
                        </h4>


                    </div>


                </div>






                <div className="detail-card">


                    <div className="detail-icon">

                        <FaCalendarAlt/>

                    </div>


                    <div className="detail-content">


                        <span>
                            Created Date
                        </span>


                        <h4>

                            {
                                user.created_at

                                ?

                                new Date(
                                    user.created_at
                                )
                                .toLocaleDateString(
                                    "en-US",
                                    {
                                        year:"numeric",
                                        month:"long",
                                        day:"numeric"
                                    }
                                )

                                :

                                "Unknown"

                            }

                        </h4>


                    </div>


                </div>




            </div>








            {/* ==============================
                BALANCE CARD
            =============================== */}


            <div className="balance-card">


                <div className="balance-header">


                    <FaWallet/>


                    <span>
                        Current Balance
                    </span>


                </div>




                <h1>


                    $

                    {
                        Number(
                            user.balance || 0
                        )
                        .toLocaleString()

                    }


                </h1>



            </div>









            {/* ==============================
                ADDRESS SECTION
            =============================== */}



            <div className="address-section">


                <div className="address-header">


                    <FaMapMarkerAlt/>


                    <h3>
                        Address Information
                    </h3>


                </div>




                <p>


                    {
                        user.address

                        ?

                        user.address

                        :

                        "No address provided"

                    }


                </p>



            </div>






        </div>

    );


}



export default UserDetails;