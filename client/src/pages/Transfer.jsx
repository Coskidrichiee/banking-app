// Transfer.jsx PART 1/3


import {
    useState
} from "react";


import {
    Link
} from "react-router-dom";


import {
    useAuth
} from "../context/useAuth";


import {
    createTransferRequest
} from "../services/api";


import "./Transfer.css";





/* =========================================
   COUNTRIES
========================================= */

const countries = [

    {
        name: "Nigeria",
        currency: "NGN"
    },

    {
        name: "United States",
        currency: "USD"
    },

    {
        name: "United Kingdom",
        currency: "GBP"
    },

    {
        name: "Canada",
        currency: "CAD"
    },

    {
        name: "South Africa",
        currency: "ZAR"
    },

    {
        name: "Germany",
        currency: "EUR"
    },

    {
        name: "France",
        currency: "EUR"
    },

    {
        name: "United Arab Emirates",
        currency: "AED"
    },

    {
        name: "India",
        currency: "INR"
    },

    {
        name: "Australia",
        currency: "AUD"
    }

];


/* =========================================
   BANK DATABASE
========================================= */

const banks = {

    Nigeria: [

        "Access Bank",
        "GTBank",
        "Zenith Bank",
        "UBA",
        "First Bank",
        "Fidelity Bank",
        "Sterling Bank",
        "Kuda Bank",
        "Moniepoint",
        "Richiee Bank"

    ],


    "United States": [

        "Chase Bank",
        "Bank of America",
        "Wells Fargo",
        "Citibank",
        "Capital One"

    ],


    "United Kingdom": [

        "HSBC",
        "Barclays",
        "Lloyds Bank",
        "NatWest"

    ],


    Canada: [

        "RBC",
        "TD Canada Trust",
        "Scotiabank",
        "BMO"

    ],


    "South Africa": [

        "Standard Bank",
        "ABSA",
        "Nedbank",
        "Capitec"

    ],


    Germany: [

        "Deutsche Bank",
        "Commerzbank"

    ],


    France: [

        "BNP Paribas",
        "Societe Generale"

    ],


    "United Arab Emirates": [

        "Emirates NBD",
        "Mashreq Bank"

    ],


    India: [

        "State Bank of India",
        "HDFC Bank",
        "ICICI Bank"

    ],


    Australia: [

        "Commonwealth Bank",
        "Westpac",
        "ANZ"

    ]

};





/* =========================================
   CURRENCIES
========================================= */

const currencies = [

    "NGN",
    "USD",
    "GBP",
    "EUR",
    "CAD",
    "ZAR",
    "AED",
    "INR",
    "AUD"

];

function Transfer(){

const [showModal, setShowModal] = useState(false);

    const {
        user,
        token
    } = useAuth();





    /* =========================================
       FORM STATE
    ========================================= */


    const [
        formData,
        setFormData
    ] = useState({

        country: "",

        bank: "",

        accountNumber: "",

        accountName: "",

        currency: "NGN",

        amount: "",

        description: ""

    });




    const [
        transactionPin,
        setTransactionPin
    ] = useState("");



    const [
        loading,
        setLoading
    ] = useState(false);



    const [
        error,
        setError
    ] = useState("");



    const [
        success,
        setSuccess
    ] = useState("");

    const [
        transferStatus,
        setTransferStatus
    ] = useState("");



    const [
        transferReference,
        setTransferReference
    ] = useState("");



    const [
        transferDetails,
        setTransferDetails
    ] = useState(null);


     const amount = Number(formData.amount || 0);

        const transferFee = amount * 0.15;

        const totalDebit = amount + transferFee;

        if (
            totalDebit >
            Number(user?.balance || 0)
        ) {
            return "Insufficient account balance for the transfer amount and fee.";
        }



    /* =========================================
       INPUT CHANGE
    ========================================= */


    const handleChange = (event)=>{


        const {
            name,
            value
        } = event.target;



        setFormData(previous => ({

            ...previous,

            [name]: value

        }));



        setError("");

        setSuccess("");

    };







    /* =========================================
       COUNTRY CHANGE
    ========================================= */
const handleCountryChange = (event) => {

    const selectedCountry =
        event.target.value;

    setFormData(previous => ({

        ...previous,

        country: selectedCountry,

        bank: "",

        // Always use USD
        currency: "USD"

    }));

};



    const formatBalance = (amount) => {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }
    ).format(
        Number(amount || 0)
    );

};

    /* =========================================
       FORMAT CURRENCY
    ========================================= */


    const formatCurrency = (amount) => {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }
    ).format(
        Number(amount || 0)
    );

};

    /* =========================================
       VALIDATION
    ========================================= */


    const validateTransfer = ()=>{


        if(!formData.country){

            return "Please select recipient country.";

        }



        if(!formData.bank){

            return "Please select recipient bank.";

        }



        if(!formData.accountNumber){

            return "Enter recipient account number.";

        }



        if(formData.accountNumber.length < 8){

            return "Invalid account number.";

        }



        if(!formData.accountName){

            return "Enter recipient account name.";

        }



        if(
            !formData.amount ||
            Number(formData.amount) <= 0
        ){

            return "Enter a valid transfer amount.";

        }



        if(
            Number(formData.amount)
            >
            Number(user?.balance || 0)
        ){

            return "Insufficient account balance.";

        }



        if(

            transactionPin.length !== 4 ||

            !/^[0-9]+$/.test(transactionPin)

        ){

            return "Enter a valid 4 digit transaction PIN.";

        }



        return null;


    };








    /* =========================================
       SUBMIT TRANSFER
    ========================================= */


    const submitTransfer = async () => {

    setError("");
    setSuccess("");

    const validationError = validateTransfer();

    if (validationError) {
        setError(validationError);
        return;
    }

    try {

        setLoading(true);

        const reference = "TRX" + Date.now();

        const response = await createTransferRequest(
            token,
            {
                country: formData.country,
                bank: formData.bank,
                accountNumber: formData.accountNumber,
                accountName: formData.accountName,
                currency: formData.currency,
                amount: Number(formData.amount),
                fee: transferFee,
                description: formData.description,
                transactionPin,
                reference,
                status: "PENDING"
            }
        );

        // 👇 PUT THE CODE HERE
        if (response.success) {

            setTransferStatus("PENDING");

            setTransferReference(
                response.reference || reference
            );

            setTransferDetails({

                ...formData,

                amount: Number(formData.amount),

                reference:
                    response.reference || reference

            });

            setSuccess(
                "Transfer request submitted successfully."
            );

            setShowModal(false);

            setTransactionPin("");

        }

    } catch (error) {

        setError(
            error.message ||
            "Unable to submit transfer."
        );

    } finally {

        setLoading(false);

    }

};

return (

    <div className="transfer-page">


        {/* =====================================
            HEADER
        ===================================== */}

        <header className="transfer-header">


            <div className="transfer-header-left">


                <Link
                    to="/dashboard"
                    className="transfer-back-button"
                >
                    ←
                </Link>



                <div>

                    <span>
                        Banking
                    </span>


                    <h1>
                        Transfer Money
                    </h1>

                </div>


            </div>





            <div className="transfer-user">


                <div className="transfer-user-avatar">


                    {
                        user?.profile_picture ?

                        <img
                            src={
                                `https://banking-app-zlqr.onrender.com/uploads/profiles/${user.profile_picture}`
                            }
                            alt="profile"
                        />


                        :


                        user?.full_name
                        ?.charAt(0)
                        ?.toUpperCase()

                        ||

                        "U"

                    }


                </div>





                <div className="transfer-user-info">


                    <strong>

                        {
                            user?.full_name
                            ||
                            "Customer"
                        }

                    </strong>



                    <span>

                        {
                            user?.account_number
                            ||
                            "No Account"
                        }

                    </span>


                </div>


            </div>


        </header>


        {/* =====================================
            MAIN CONTENT
        ===================================== */}


        <main className="transfer-content">





            <section className="transfer-intro">


                <span>
                    INTERNATIONAL TRANSFER
                </span>



                <h2>
                    Send Money
                </h2>



                <p>
                    Transfer securely. All transfers require administrator approval before completion.
                </p>


            </section>

            <div className="transfer-layout">





                {/* =====================================
                    TRANSFER FORM CARD
                ===================================== */}


                <section className="transfer-card">

                    <div className="transfer-card-header">


                        <div>


                            <h3>
                                Recipient Details
                            </h3>


                            <p>
                                Enter recipient information below.
                            </p>


                        </div>





                        <div className="transfer-card-icon">

                            ⇄

                        </div>



                    </div>

                    {
                        success &&

                        <div className="transfer-alert success">


                            <span>
                                ✓
                            </span>


                            <p>
                                {success}
                            </p>


                        </div>

                    }

                    {
                        error &&

                        <div className="transfer-alert error">


                            <span>
                                !
                            </span>


                            <p>
                                {error}
                            </p>


                        </div>

                    }

                    <form
                        className="transfer-form"
                        onSubmit={(e)=>e.preventDefault()}
                    >

                        {/* COUNTRY */}


                        <div className="transfer-form-group">


                            <label>
                                Recipient Country
                            </label>



                            <select

                                name="country"

                                value={formData.country}

                                onChange={handleCountryChange}

                            >


                                <option value="">
                                    Select Country
                                </option>




                                {
                                    countries.map(country=>(


                                        <option

                                            key={country.name}

                                            value={country.name}

                                        >

                                            {country.name}

                                        </option>


                                    ))
                                }


                            </select>


                        </div>

                        {/* BANK */}


                        <div className="transfer-form-group">


                            <label>
                                Recipient Bank
                            </label>




                            <select

                                name="bank"

                                value={formData.bank}

                                onChange={handleChange}

                                disabled={!formData.country}

                            >


                                <option value="">
                                    Select Bank
                                </option>

                                {

                                    formData.country &&

                                    banks[formData.country]
                                    ?.map(bank=>(


                                        <option

                                            key={bank}

                                            value={bank}

                                        >

                                            {bank}

                                        </option>


                                    ))

                                }


                            </select>



                        </div>

                        {/* ACCOUNT NUMBER */}


                        <div className="transfer-form-group">


                            <label>
                                Account Number
                            </label>



                            <input

                                type="text"

                                name="accountNumber"

                                value={formData.accountNumber}

                                onChange={handleChange}

                                placeholder="Enter recipient account number"

                                maxLength="20"

                            />


                        </div>


                        {/* ACCOUNT NAME */}

                        <div className="transfer-form-group">


                                <label>
                                    Account Name
                                </label>
                            <input

                                type="text"

                                name="accountName"

                                value={formData.accountName}

                                onChange={(e)=>
                                    setFormData({
                                        ...formData,
                                        accountName:e.target.value.replace(/[^a-zA-Z\s]/g,"")
                                    })
                                }

                                placeholder="Recipient full name"

                            />
                        </div>

                        {/* CURRENCY */}


                        <div className="transfer-form-group">


                            <label>
                                Currency
                            </label>

                            <select

                                name="currency"

                                value={formData.currency}

                                onChange={handleChange}

                            >

                                {
                                    currencies.map(currency=>(


                                        <option

                                            key={currency}

                                            value={currency}

                                        >

                                            {currency}

                                        </option>


                                    ))
                                }


                            </select>


                        </div>

                        {/* AMOUNT */}


                        <div className="transfer-form-group">


                            <label>
                                Amount
                            </label>

                            <input

                                type="number"

                                name="amount"

                                value={formData.amount}

                                onChange={handleChange}

                                placeholder="Enter transfer amount"

                                min="1"

                            />


                        </div>

                        {/* FEE SUMMARY */}


                        <div className="transfer-fee-box">


                            <div>


                                <span>
                                    Transfer Amount
                                </span>


                                <strong>

                                    {
                                        formatCurrency(
                                            formData.amount
                                        )
                                    }

                                </strong>


                            </div>

                            <div>


                                <span>
                                    Transfer Fee
                                </span>


                                <strong>

                                    {
                                        formatCurrency(
                                            transferFee
                                        )
                                    }

                                </strong>


                            </div>

                            <div className="total">


                                <span>
                                    Total Debit
                                </span>

                                <strong>

                                    {
                                        formatCurrency(
                                            totalDebit
                                        )
                                    }

                                </strong>



                            </div>


                        </div>

                        {/* DESCRIPTION */}


                        <div className="transfer-form-group">


                            <label>
                                Description
                            </label>

                            <textarea

                                rows="4"

                                name="description"

                                value={formData.description}

                                onChange={handleChange}

                                placeholder="Payment purpose"

                            />


                        </div>

                        <button
                            type="button"
                            className="continue-btn"
                            onClick={() => {
                                console.log("Continue clicked");
                                setShowModal(true);
                            }}
                        >
                            Continue →
                        </button>

                    </form>



                </section>

                {/* =====================================
                    SIDE PANEL
                ===================================== */}


                <aside className="transfer-side">



                    <div className="transfer-balance-card">


                        <span>
                            Available Balance
                        </span>



                        <strong>
                            {
                                formatBalance(
                                    user?.balance || 0
                                )
                            }
                        </strong>



                        <small>

                            Account:

                            {
                                user?.account_number
                                ||
                                "----------"
                            }

                        </small>


                    </div>







                    <div className="transfer-security-card">


                        <div className="transfer-security-icon">

                            🔐

                        </div>




                        <h3>
                            Secure Transfer
                        </h3>




                        <p>

                            Your transfer request will remain pending until an administrator reviews and approves it.

                        </p>



                    </div>



                </aside>



            </div>
{/* =====================================
    TRANSFER STATUS
===================================== */}


{
    transferStatus &&

    <section className="transfer-status-card">


        <div className="status-icon pending">

            ⏳

        </div>





        <div className="status-content">


            <h3>
                Transfer Pending Approval
            </h3>





            <p>

                Your transfer request has been submitted successfully.
                An administrator will approve or decline this transfer.

            </p>








            <div className="status-details">





                <div>


                    <span>
                        Status
                    </span>




                    <strong className="pending-text">

                        {
                            transferStatus
                        }

                    </strong>



                </div>









                <div>


                    <span>
                        Reference
                    </span>




                    <strong>

                        {
                            transferReference
                            ||
                            "Processing..."
                        }

                    </strong>



                </div>





            </div>





        </div>





    </section>

}

{
    showModal && (

        <div className="transfer-modal-overlay">

            <div className="transfer-modal">

                <div className="transfer-modal-header">

                    <h2>Confirm Transfer</h2>

                    <button
                        className="close-modal"
                        onClick={() => setShowModal(false)}
                    >
                        ×
                    </button>

                </div>





                <div className="transfer-review">

                    <div className="review-item">

                        <span>Recipient</span>

                        <strong>{formData.accountName}</strong>

                    </div>





                    <div className="review-item">

                        <span>Bank</span>

                        <strong>{formData.bank}</strong>

                    </div>





                    <div className="review-item">

                        <span>Country</span>

                        <strong>{formData.country}</strong>

                    </div>





                    <div className="review-item">

                        <span>Account Number</span>

                        <strong>{formData.accountNumber}</strong>

                    </div>





                    <div className="review-item">

                        <span>Currency</span>

                        <strong>{formData.currency}</strong>

                    </div>





                    <div className="review-item">

                        <span>Transfer Amount</span>

                        <strong>
                            {formatCurrency(formData.amount)}
                        </strong>

                    </div>





                    <div className="review-item">

                        <span>Transfer Fee</span>

                        <strong>
                            {formatCurrency(transferFee)}
                        </strong>

                    </div>





                    <div className="review-item total">

                        <span>Total Debit</span>

                        <strong>
                            {formatCurrency(totalDebit)}
                        </strong>

                    </div>

                </div>







                <div className="transfer-pin-section">

                    <label>

                        Transaction PIN

                    </label>

                    <input

                        type="password"

                        maxLength="4"

                        value={transactionPin}

                        onChange={(e)=>
                            setTransactionPin(e.target.value)
                        }

                        placeholder="Enter 4-digit PIN"

                    />

                </div>

                <div className="modal-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="confirm-btn"
                        disabled={loading}
                        onClick={submitTransfer}
                    >
                        {loading ? "Submitting..." : "Confirm Transfer"}
                    </button>

                </div>

            </div>

        </div>

    )
}


{/* =====================================
    TRANSFER SUMMARY
===================================== */}

{/* =====================================
    TRANSFER STATUS
===================================== */}

{
    transferStatus === "PENDING" &&

    <section className="transfer-status-card">

        <div className="status-icon pending">
            ⏳
        </div>

        <div className="status-content">

            <h3>
                Transfer Pending Approval
            </h3>

            <p>
                Your transfer request has been submitted successfully.
                An administrator will review and approve or reject this transfer.
            </p>

            <div className="status-details">

                <div>

                    <span>Status</span>

                    <strong className="pending-text">
                        {transferStatus}
                    </strong>

                </div>

                <div>

                    <span>Reference</span>

                    <strong>
                        {transferReference || "Processing..."}
                    </strong>

                </div>

            </div>

        </div>

    </section>
}

{/* =====================================
    FOOTER
===================================== */}


<footer className="transfer-footer">



    <p>

        © {new Date().getFullYear()}

        {" "}

        Richiee Bank.

        All rights reserved.

    </p>

    <div className="transfer-footer-links">


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

export default Transfer;