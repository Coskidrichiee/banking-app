import axios from "axios";

/* =========================================================
   BASE URL
========================================================= */

const API_BASE =
    import.meta.env.VITE_API_URL ||
    "https://banking-app-zlqr.onrender.com";


/* =========================================================
   AXIOS INSTANCE
========================================================= */

const API = axios.create({

    baseURL: API_BASE,

    timeout: 15000,

    headers: {
        "Content-Type": "application/json"
    }

});


/* =========================================================
   ADMIN TOKEN
========================================================= */

const getAdminToken = () => {

    return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("banking_admin_token")
    );

};


/* =========================================================
   USER TOKEN
========================================================= */

const getUserToken = () => {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("userToken") ||
        localStorage.getItem("banking_token")
    );

};


/* =========================================================
   ADMIN AXIOS REQUEST INTERCEPTOR
========================================================= */

API.interceptors.request.use(

    (config) => {

        const adminToken =
            getAdminToken();

        if (adminToken) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${adminToken}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


/* =========================================================
   ADMIN RESPONSE INTERCEPTOR
========================================================= */

API.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        if (
            error.response?.status === 401
        ) {

            console.warn(
                "Authentication failed."
            );

        }

        return Promise.reject(error);

    }

);


/* =========================================================
   USER REQUEST HELPER
========================================================= */

const request = async (
    endpoint,
    options = {}
) => {

    const response =
        await fetch(

            `${API_BASE}/api${endpoint}`,

            {

                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                }

            }

        );


    let data;


    try {

        data =
            await response.json();

    }

    catch {

        data = {

            success: false,

            message:
                "Invalid server response."

        };

    }


    if (!response.ok) {

        throw new Error(

            data?.message ||
            `Request failed with status ${response.status}`

        );

    }


    return data;

};


/* =========================================================
   USER AUTH
========================================================= */

export const registerUser = async (
    userData
) => {

    return request(

        "/auth/register",

        {

            method: "POST",

            body:
                JSON.stringify(userData)

        }

    );

};


export const loginUser = async (
    credentials
) => {

    return request(

        "/auth/login",

        {

            method: "POST",

            body:
                JSON.stringify(credentials)

        }

    );

};


export const getCurrentUser = async (
    token
) => {

    return request(

        "/auth/me",

        {

            method: "GET",

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );

};


/* =========================================================
   PROFILE
========================================================= */

export const getProfile = async (
    token
) => {

    return request(

        "/profile",

        {

            method: "GET",

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );

};


export const updateProfile = async (
    token,
    userData
) => {

    return request(

        "/profile",

        {

            method: "PUT",

            headers: {

                Authorization:
                    `Bearer ${token}`

            },

            body:
                JSON.stringify(userData)

        }

    );

};


/* =========================================================
   BANKING
========================================================= */

export const getBalance = async (
    token
) => {

    return request(

        "/bank/balance",

        {

            method: "GET",

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );

};


export const depositMoney = async (
    token,
    amount
) => {

    return request(

        "/bank/deposit",

        {

            method: "POST",

            headers: {

                Authorization:
                    `Bearer ${token}`

            },

            body:
                JSON.stringify({

                    amount

                })

        }

    );

};


export const withdrawMoney = async (
    token,
    amount
) => {

    return request(

        "/bank/withdraw",

        {

            method: "POST",

            headers: {

                Authorization:
                    `Bearer ${token}`

            },

            body:
                JSON.stringify({

                    amount

                })

        }

    );

};


/* =========================================================
   DIRECT BANK TRANSFER
   Use only if you want immediate transfers.
========================================================= */

export const transferMoney = async (
    token,
    transferData
) => {

    return request(

        "/bank/transfer",

        {

            method: "POST",

            headers: {

                Authorization:
                    `Bearer ${token}`

            },

            body:
                JSON.stringify(transferData)

        }

    );

};


/* =========================================================
   USER TRANSFER REQUEST
   Creates PENDING transfer
========================================================= */

export const createTransferRequest = async (
    token,
    transferData
) => {

    return request(

        "/transfers/create",

        {

            method: "POST",

            headers: {

                Authorization:
                    `Bearer ${token}`

            },

            body:
                JSON.stringify(transferData)

        }

    );

};


/* =========================================================
   USER PENDING TRANSFERS
========================================================= */

export const getUserPendingTransfers = async (
    token
) => {

    return request(

        "/transfers/pending",

        {

            method: "GET",

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );

};


/* =========================================================
   ADMIN LOGIN
========================================================= */

export const loginAdmin = async (
    credentials
) => {

    const response =
        await API.post(

            "/api/admin/login",

            credentials

        );


    const data =
        response.data;


    if (
        data?.success &&
        data?.token
    ) {

        localStorage.setItem(
            "adminToken",
            data.token
        );


        localStorage.setItem(
            "banking_admin_token",
            data.token
        );


        if (data.admin) {

            localStorage.setItem(

                "admin",

                JSON.stringify(
                    data.admin
                )

            );


            localStorage.setItem(

                "banking_admin",

                JSON.stringify(
                    data.admin
                )

            );

        }

    }


    return data;

};


/* =========================================================
   CURRENT ADMIN
========================================================= */

export const getCurrentAdmin = async () => {

    const response =
        await API.get(

            "/api/admin/me"

        );


    return response.data;

};


/* =========================================================
   ADMIN LOGOUT
========================================================= */

export const logoutAdmin = () => {

    localStorage.removeItem(
        "adminToken"
    );


    localStorage.removeItem(
        "banking_admin_token"
    );


    localStorage.removeItem(
        "admin"
    );


    localStorage.removeItem(
        "banking_admin"
    );

};


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export const getDashboardStats = async () => {

    const response =
        await API.get(

            "/api/admin/dashboard"

        );


    return response.data;

};


/* =========================================================
   ADMIN CUSTOMERS
========================================================= */

export const getCustomers = async () => {

    const response =
        await API.get(

            "/api/admin/customers"

        );


    return response.data;

};

/* =========================================================
ADMIN TRANSACTIONS
========================================================= */

/* =========================================================
ADMIN TRANSACTIONS
========================================================= */

// export const getAdminTransactions = async (
//     token,
//     limit = 100
// ) => {

//     const response = await API.get(
//         `/api/admin/transactions?limit=${limit}`,
//         {
//             headers: {
//                 Authorization:
//                     `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };
/* =========================================================
   ADMIN TRANSACTIONS
========================================================= */

export const getAdminTransactions = async (
    token,
    limit = 100
) => {

    const response = await API.get(
        `/api/admin/transactions?limit=${limit}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

/* =========================================================
USER TRANSACTION HISTORY
========================================================= */

export const getTransactions = async (
    token,
    limit = 50
) => {

    return request(
        `/bank/transactions?limit=${limit}`,
        {
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );
};

/* =========================================================
   ADMIN DEPOSITS
========================================================= */

export const getDeposits = async () => {

    const response =
        await API.get(

            "/api/admin/deposits"

        );


    return response.data;

};


/* =========================================================
   ADMIN WITHDRAWALS
========================================================= */

export const getWithdrawals = async () => {

    const response =
        await API.get(

            "/api/admin/withdrawals"

        );


    return response.data;

};


/* =========================================================
   ADMIN ALL TRANSFERS
========================================================= */

export const getTransfers = async () => {

    const response =
        await API.get(

            "/api/admin/transfers"

        );


    return response.data;

};


/* =========================================================
   ADMIN PENDING TRANSFERS
========================================================= */

export const getPendingTransfers = async (
    token
) => {

    return request(

        "/transfers/pending",

        {

            method: "GET",

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );

};


/* =========================================================
   ADMIN APPROVE TRANSFER
========================================================= */

export const approveTransfer = async (
    token,
    id
) => {

    return request(

        `/transfers/${id}/approve`,

        {

            method: "PUT",

            headers: {

                Authorization:
                    `Bearer ${token}`

            },

            body:
                JSON.stringify({})

        }

    );

};


/* =========================================================
   ADMIN REJECT TRANSFER
========================================================= */

export const rejectTransfer = async (
    token,
    id,
    reason = ""
) => {

    return request(

        `/transfers/${id}/reject`,

        {

            method: "PUT",

            headers: {

                Authorization:
                    `Bearer ${token}`

            },

            body:
                JSON.stringify({

                    reason

                })

        }

    );

};


/* =========================================================
   PROFILE IMAGE UPLOAD
========================================================= */

export const uploadProfilePicture = async (
    token,
    file
) => {

    const formData =
        new FormData();


    formData.append(
        "profilePicture",
        file
    );


    const response =
        await fetch(

            `${API_BASE}/api/profile/picture`,

            {

                method: "POST",

                headers: {

                    Authorization:
                        `Bearer ${token}`

                },

                body: formData

            }

        );


    let data;


    try {

        data =
            await response.json();

    }

    catch {

        data = {

            success: false,

            message:
                "Invalid server response."

        };

    }


    if (!response.ok) {

        throw new Error(

            data?.message ||
            "Failed to upload profile picture."

        );

    }


    return data;

};


/* =========================================================
   EXPORT
========================================================= */

export default API;