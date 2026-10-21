import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// =======================================
// Attach Admin Token Automatically
// =======================================

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("banking_admin_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =======================================
// Admin Login
// =======================================

export const loginAdmin = async (credentials) => {
    const { data } = await API.post(
        "/api/admin/login",
        credentials
    );

    return data;
};

// =======================================
// Current Admin
// =======================================

export const getCurrentAdmin = async () => {
    const { data } = await API.get(
        "/api/admin/me"
    );

    return data;
};

// =======================================
// Logout
// =======================================

export const logoutAdmin = () => {
    localStorage.removeItem("banking_admin_token");
    localStorage.removeItem("banking_admin");
};

// =======================================
// Dashboard Statistics
// =======================================

export const getDashboardStats = async () => {
    const { data } = await API.get(
        "/api/admin/dashboard"
    );

    return data;
};

// =======================================
// Customers
// =======================================

export const getCustomers = async () => {
    const { data } = await API.get(
        "/api/admin/customers"
    );

    return data;
};

// =======================================
// Transactions
// =======================================

export const getTransactions = async () => {
    const { data } = await API.get(
        "/api/admin/transactions"
    );

    return data;
};

// =======================================
// Deposits
// =======================================

export const getDeposits = async () => {
    const { data } = await API.get(
        "/api/admin/deposits"
    );

    return data;
};

// =======================================
// Withdrawals
// =======================================

export const getWithdrawals = async () => {
    const { data } = await API.get(
        "/api/admin/withdrawals"
    );

    return data;
};

// =======================================
// Transfers
// =======================================

export const getTransfers = async () => {
    const { data } = await API.get(
        "/api/admin/transfers"
    );

    return data;
};

export default API;