import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    useAuth
} from "../context/useAuth";

import {
    getProfile,
    updateProfile,
    uploadProfilePicture
} from "../services/api";

import "./Profile.css";


function Profile() {
    const {
        user,
        token
    } = useAuth();


    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "Nigeria"
    });


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [success, setSuccess] =
        useState("");

    const [error, setError] =
        useState("");

    const [
    uploadingPicture,
    setUploadingPicture
    ] = useState(false);


    /* =========================================
       LOAD PROFILE
    ========================================= */

    useEffect(() => {
        const loadProfile = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response =
                    await getProfile(token);

                if (response.success) {
                    const profile =
                        response.user;

                    setFormData({
                        fullName:
                            profile.full_name || "",

                        email:
                            profile.email || "",

                        phone:
                            profile.phone || "",

                        address:
                            profile.address || "",

                        city:
                            profile.city || "",

                        state:
                            profile.state || "",

                        country:
                            profile.country ||
                            "Nigeria"
                    });
                }
            } catch (err) {
                console.error(
                    "Profile loading error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [token]);


    /* =========================================
       HANDLE INPUT
    ========================================= */

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

        setSuccess("");
        setError("");
    };
    
    const handleProfilePictureChange =
    async (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image."
            );
            return;
        }

        try {
            setUploadingPicture(true);
            setError("");
            setSuccess("");

            const response =
                await uploadProfilePicture(
                    token,
                    file
                );

            if (response.success) {
                setSuccess(
                    "Profile picture updated successfully."
                );

                window.location.reload();
            }
        } catch (error) {
            setError(
                error.message ||
                "Unable to upload profile picture."
            );
        } finally {
            setUploadingPicture(false);
        }
    };

    /* =========================================
       SAVE PROFILE
    ========================================= */

    const handleSubmit =
        async (event) => {
            event.preventDefault();

            setSuccess("");
            setError("");

            if (
                !formData.fullName.trim()
            ) {
                setError(
                    "Full name is required."
                );

                return;
            }

            if (
                !formData.phone.trim()
            ) {
                setError(
                    "Phone number is required."
                );

                return;
            }

            try {
                setSaving(true);

                const response =
                    await updateProfile(
                        token,
                        {
                            fullName:
                                formData.fullName.trim(),

                            phone:
                                formData.phone.trim(),

                            address:
                                formData.address.trim(),

                            city:
                                formData.city.trim(),

                            state:
                                formData.state.trim(),

                            country:
                                formData.country.trim()
                        }
                    );

                if (response.success) {
                    setSuccess(
                        "Profile updated successfully."
                    );

                    setFormData(
                        previous => ({
                            ...previous,
                            fullName:
                                response.user
                                    ?.full_name ||
                                previous.fullName,

                            phone:
                                response.user
                                    ?.phone ||
                                previous.phone,

                            address:
                                response.user
                                    ?.address ||
                                "",

                            city:
                                response.user
                                    ?.city ||
                                "",

                            state:
                                response.user
                                    ?.state ||
                                "",

                            country:
                                response.user
                                    ?.country ||
                                "Nigeria"
                        })
                    );
                }
            } catch (err) {
                console.error(
                    "Profile update error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to update your profile."
                );
            } finally {
                setSaving(false);
            }
        };


    /* =========================================
       AVATAR
    ========================================= */

    const userInitial =
        formData.fullName
            ?.charAt(0)
            ?.toUpperCase() ||
        user?.full_name
            ?.charAt(0)
            ?.toUpperCase() ||
        "U";


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner" />
                <p>
                    Loading your profile...
                </p>
            </div>
        );
    }


    return (
        <div className="profile-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <header className="profile-header">

                <div className="profile-header-left">

                    <Link
                        to="/dashboard"
                        className="profile-back-button"
                    >
                        ←
                    </Link>

                    <div>
                        <span>
                            Account
                        </span>

                        <h1>
                            My Profile
                        </h1>
                    </div>

                </div>


                <Link
                    to="/dashboard"
                    className="profile-dashboard-link"
                >
                    Back to Dashboard
                </Link>

            </header>


            {/* =====================================
                CONTENT
            ===================================== */}

            <main className="profile-content">

                {/* =================================
                    PROFILE HERO
                ================================= */}

                <section className="profile-hero">

                    <div className="profile-avatar-wrapper">

                        {user?.profile_picture ? (
                            <img
                                src={`https://banking-app-zlqr.onrender.com/uploads/profiles/${user.profile_picture}`}
                                alt={user.full_name}
                                className="profile-avatar-image"
                            />
                        ) : (
                            <div className="profile-avatar">
                                {userInitial}
                            </div>
                        )}

                        <label
                            htmlFor="profilePicture"
                            className="profile-picture-upload"
                        >
                            {uploadingPicture
                                ? "..."
                                : "📷"}
                        </label>

                        <input
                            id="profilePicture"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                                handleProfilePictureChange
                            }
                            hidden
                        />

                    </div>

                    <div className="profile-hero-info">

                        <span>
                            Richiee Bank Customer
                        </span>

                        <h2>
                            {formData.fullName ||
                                "Customer"}
                        </h2>

                        <p>
                            {formData.email}
                        </p>

                    </div>


                    <div className="profile-status">

                        <span className="status-dot" />

                        Active Account

                    </div>

                </section>


                {/* =================================
                    ALERTS
                ================================= */}

                {success && (
                    <div className="profile-alert success">
                        <span>✓</span>
                        {success}
                    </div>
                )}


                {error && (
                    <div className="profile-alert error">
                        <span>!</span>
                        {error}
                    </div>
                )}


                {/* =================================
                    GRID
                ================================= */}

                <div className="profile-grid">

                    {/* =================================
                        PERSONAL INFORMATION
                    ================================= */}

                    <section className="profile-card">

                        <div className="profile-card-header">

                            <div>
                                <h3>
                                    Personal Information
                                </h3>

                                <p>
                                    Update your personal
                                    account information.
                                </p>
                            </div>

                            <div className="card-header-icon">
                                👤
                            </div>

                        </div>


                        <form
                            className="profile-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* Full Name */}

                            <div className="profile-form-group">

                                <label htmlFor="fullName">
                                    Full Name
                                </label>

                                <input
                                    id="fullName"
                                    type="text"
                                    name="fullName"
                                    value={
                                        formData.fullName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                />

                            </div>


                            {/* Email */}

                            <div className="profile-form-group">

                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={
                                        formData.email
                                    }
                                    disabled
                                    readOnly
                                />

                                <small>
                                    Your email address
                                    cannot be changed
                                    here.
                                </small>

                            </div>


                            {/* Phone */}

                            <div className="profile-form-group">

                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your phone number"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    required
                                />

                            </div>


                            {/* Address */}

                            <div className="profile-form-group full-width">

                                <label htmlFor="address">
                                    Address
                                </label>

                                <input
                                    id="address"
                                    type="text"
                                    name="address"
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your residential address"
                                    autoComplete="street-address"
                                />

                            </div>


                            {/* City */}

                            <div className="profile-form-group">

                                <label htmlFor="city">
                                    City
                                </label>

                                <input
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your city"
                                    autoComplete="address-level2"
                                />

                            </div>


                            {/* State */}

                            <div className="profile-form-group">

                                <label htmlFor="state">
                                    State
                                </label>

                                <input
                                    id="state"
                                    type="text"
                                    name="state"
                                    value={
                                        formData.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your state"
                                    autoComplete="address-level1"
                                />

                            </div>


                            {/* Country */}

                            <div className="profile-form-group">

                                <label htmlFor="country">
                                    Country
                                </label>

                                <select
                                    id="country"
                                    name="country"
                                    value={
                                        formData.country
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
                                    <option value="Nigeria">
                                        Nigeria
                                    </option>

                                    <option value="Ghana">
                                        Ghana
                                    </option>

                                    <option value="Kenya">
                                        Kenya
                                    </option>

                                    <option value="South Africa">
                                        South Africa
                                    </option>

                                    <option value="United Kingdom">
                                        United Kingdom
                                    </option>

                                    <option value="United States">
                                        United States
                                    </option>
                                </select>

                            </div>


                            {/* Save */}

                            <div className="profile-form-actions">

                                <button
                                    type="submit"
                                    className="save-profile-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Saving Changes..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </section>


                    {/* =================================
                        ACCOUNT DETAILS
                    ================================= */}

                    <aside className="profile-side-column">

                        <section className="profile-card account-details-card">

                            <div className="profile-card-header">

                                <div>
                                    <h3>
                                        Account Details
                                    </h3>

                                    <p>
                                        Your Richiee Bank
                                        account information.
                                    </p>
                                </div>

                                <div className="card-header-icon blue">
                                    #
                                </div>

                            </div>


                            <div className="account-details-list">

                                <div className="account-detail-item">

                                    <div>
                                        <span>
                                            Account Number
                                        </span>

                                        <strong>
                                            {user?.account_number ||
                                                "----------"}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="copy-account-button"
                                        onClick={() =>
                                            navigator.clipboard?.writeText(
                                                user?.account_number ||
                                                ""
                                            )
                                        }
                                    >
                                        Copy
                                    </button>

                                </div>


                                <div className="account-detail-item">

                                    <div>
                                        <span>
                                            Account Status
                                        </span>

                                        <strong className="active-text">
                                            ● Active
                                        </strong>
                                    </div>

                                </div>


                                <div className="account-detail-item">

                                    <div>
                                        <span>
                                            Account Balance
                                        </span>

                                        <strong>
                                            ₦
                                            {Number(
                                                user?.balance ||
                                                0
                                            ).toLocaleString(
                                                "en-NG",
                                                {
                                                    minimumFractionDigits: 2
                                                }
                                            )}
                                        </strong>
                                    </div>

                                </div>


                                <div className="account-detail-item">

                                    <div>
                                        <span>
                                            Country
                                        </span>

                                        <strong>
                                            {formData.country}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* Security */}

                        <section className="security-card">

                            <div className="security-icon">
                                🔐
                            </div>

                            <div>

                                <h3>
                                    Keep your account secure
                                </h3>

                                <p>
                                    Never share your password,
                                    PIN or verification codes
                                    with anyone.
                                </p>

                            </div>

                        </section>

                    </aside>

                </div>


                {/* =================================
                    FOOTER
                ================================= */}

                <footer className="profile-footer">

                    <span>
                        © {new Date().getFullYear()}
                        Richiee Bank
                    </span>

                    <div>
                        <Link to="/privacy">
                            Privacy
                        </Link>

                        <Link to="/terms">
                            Terms
                        </Link>

                        <Link to="/support">
                            Support
                        </Link>
                    </div>

                </footer>

            </main>

        </div>
    );
}


export default Profile;
