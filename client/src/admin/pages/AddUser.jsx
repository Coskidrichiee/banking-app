import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FaArrowLeft,
    FaSave,
    FaUpload,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaMapMarkerAlt,
    FaUniversity,
    FaMoneyBillWave
} from "react-icons/fa";

import "../css/addUser.css";

function AddUser() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});

    const [preview, setPreview] = useState(null);

    const [profilePicture, setProfilePicture] = useState(null);

    const [formData, setFormData] = useState({

        full_name: "",

        email: "",

        phone: "",

        password: "",

        balance: "0",

        address: "",

        city: "",

        state: "",

        country: "Nigeria",

        status: "active"

    });

    // ==========================
    // HANDLE INPUT
    // ==========================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]: value

        }));

    };

    // ==========================
    // IMAGE
    // ==========================

    const handleImage = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setProfilePicture(file);

        setPreview(URL.createObjectURL(file));

    };

    // ==========================
    // VALIDATION
    // ==========================

    const validate = () => {

        let validationErrors = {};

        if (!formData.full_name.trim()) {

            validationErrors.full_name =
                "Full name is required.";

        }

        if (!formData.email.trim()) {

            validationErrors.email =
                "Email is required.";

        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {

            validationErrors.email =
                "Invalid email address.";

        }

        if (!formData.phone.trim()) {

            validationErrors.phone =
                "Phone number is required.";

        }

        if (!formData.password.trim()) {

            validationErrors.password =
                "Password is required.";

        }

        if (formData.password.length < 6) {

            validationErrors.password =
                "Password must be at least 6 characters.";

        }

        if (Number(formData.balance) < 0) {

            validationErrors.balance =
                "Balance cannot be negative.";

        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;

    };

    // ==========================
    // SUBMIT
    // ==========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validate()) return;

        try {

            setLoading(true);

            const data = new FormData();

            Object.keys(formData).forEach((key) => {

                data.append(key, formData[key]);

            });

            if (profilePicture) {

                data.append(
                    "profile_picture",
                    profilePicture
                );

            }

            await axios.post(

                "https://banking-app-zlqr.onrender.com/api/admin/users",

                data,

                {

                    headers: {

                        "Content-Type":
                            "multipart/form-data"

                    }

                }

            );

            alert("User created successfully.");

            navigate("/admin/users");

        }

        catch (error) {

            alert(

                error.response?.data?.message ||

                "Unable to create user."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="add-user-page">

            <div className="page-header">

                <button

                    className="back-btn"

                    onClick={() =>
                        navigate("/admin/users")
                    }

                >

                    <FaArrowLeft />

                    Back

                </button>

                <div>

                    <h1>

                        Add New Customer

                    </h1>

                    <p>

                        Create a new Richiee Bank customer account.

                    </p>

                </div>

            </div>

            <form

                className="add-user-form"

                onSubmit={handleSubmit}

            >

                {/* Profile Picture */}

                <div className="profile-upload">

                    <div className="profile-preview">

                        {

                            preview

                                ?

                                <img
                                    src={preview}
                                    alt="Preview"
                                />

                                :

                                <FaUser />

                        }

                    </div>

                    <label
                        className="upload-btn"
                    >

                        <FaUpload />

                        Upload Photo

                        <input

                            type="file"

                            accept="image/*"

                            hidden

                            onChange={handleImage}

                        />

                    </label>

                </div>

                <div className="form-grid">

                    {/* Full Name */}

                    <div className="form-group">

                        <label>

                            Full Name

                        </label>

                        <div className="input-box">

                            <FaUser />

                            <input

                                type="text"

                                name="full_name"

                                value={formData.full_name}

                                onChange={handleChange}

                                placeholder="John Doe"

                            />

                        </div>

                        {

                            errors.full_name &&

                            <small>

                                {errors.full_name}

                            </small>

                        }

                    </div>

                    {/* Email */}

                    <div className="form-group">

                        <label>

                            Email

                        </label>

                        <div className="input-box">

                            <FaEnvelope />

                            <input

                                type="email"

                                name="email"

                                value={formData.email}

                                onChange={handleChange}

                                placeholder="john@email.com"

                            />

                        </div>

                        {

                            errors.email &&

                            <small>

                                {errors.email}

                            </small>

                        }

                    </div>

                    {/* Phone */}

                    <div className="form-group">

                        <label>

                            Phone Number

                        </label>

                        <div className="input-box">

                            <FaPhone />

                            <input

                                type="text"

                                name="phone"

                                value={formData.phone}

                                onChange={handleChange}

                                placeholder="08012345678"

                            />

                        </div>

                        {

                            errors.phone &&

                            <small>

                                {errors.phone}

                            </small>

                        }

                    </div>

                    {/* Password */}

                    <div className="form-group">

                        <label>

                            Password

                        </label>

                        <div className="input-box">

                            <FaLock />

                            <input

                                type="password"

                                name="password"

                                value={formData.password}

                                onChange={handleChange}

                                placeholder="********"

                            />

                        </div>

                        {

                            errors.password &&

                            <small>

                                {errors.password}

                            </small>

                        }

                    </div>
                                        {/* Opening Balance */}

                    <div className="form-group">

                        <label>

                            Opening Balance

                        </label>

                        <div className="input-box">

                            <FaMoneyBillWave />

                            <input

                                type="number"

                                name="balance"

                                value={formData.balance}

                                onChange={handleChange}

                                placeholder="0"

                                min="0"

                            />

                        </div>

                        {

                            errors.balance &&

                            <small className="error">

                                {errors.balance}

                            </small>

                        }

                    </div>



                    {/* Address */}

                    <div className="form-group full-width">

                        <label>

                            Address

                        </label>

                        <div className="input-box">

                            <FaMapMarkerAlt />

                            <input

                                type="text"

                                name="address"

                                value={formData.address}

                                onChange={handleChange}

                                placeholder="Enter customer's address"

                            />

                        </div>

                    </div>



                    {/* City */}

                    <div className="form-group">

                        <label>

                            City

                        </label>

                        <div className="input-box">

                            <FaMapMarkerAlt />

                            <input

                                type="text"

                                name="city"

                                value={formData.city}

                                onChange={handleChange}

                                placeholder="City"

                            />

                        </div>

                    </div>



                    {/* State */}

                    <div className="form-group">

                        <label>

                            State

                        </label>

                        <div className="input-box">

                            <FaMapMarkerAlt />

                            <input

                                type="text"

                                name="state"

                                value={formData.state}

                                onChange={handleChange}

                                placeholder="State"

                            />

                        </div>

                    </div>



                    {/* Country */}

                    <div className="form-group">

                        <label>

                            Country

                        </label>

                        <div className="input-box">

                            <FaUniversity />

                            <input

                                type="text"

                                name="country"

                                value={formData.country}

                                onChange={handleChange}

                            />

                        </div>

                    </div>



                    {/* Status */}

                    <div className="form-group">

                        <label>

                            Account Status

                        </label>

                        <select

                            name="status"

                            value={formData.status}

                            onChange={handleChange}

                        >

                            <option value="active">

                                Active

                            </option>

                            <option value="pending">

                                Pending

                            </option>

                            <option value="blocked">

                                Blocked

                            </option>

                        </select>

                    </div>

                </div>



                {/* ACTION BUTTONS */}

                <div className="form-actions">

                    <button

                        type="button"

                        className="cancel-btn"

                        onClick={() =>
                            navigate("/admin/users")
                        }

                    >

                        Cancel

                    </button>



                    <button

                        type="submit"

                        className="save-btn"

                        disabled={loading}

                    >

                        <FaSave />

                        {

                            loading

                                ? "Creating User..."

                                : "Create User"

                        }

                    </button>

                </div>

            </form>

        </div>

    );

}

export default AddUser;