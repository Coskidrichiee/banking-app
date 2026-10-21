import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

/* ==========================
   USER PAGES
========================== */

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import Transfer from "./pages/Transfer";
import Withdraw from "./pages/Withdraw";
import Deposit from "./pages/Deposit";
import Support from "./pages/Support";

/* ==========================
   ADMIN PAGES
========================== */

import AdminLogin from "./admin/pages/Login";
import AdminDashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import AddUser from "./admin/pages/AddUser";
import UserDetails from "./admin/pages/UserDetails";
import TopUp from "./admin/pages/TopUp";
import Transfers from "./admin/pages/Transfers";
import Cards from "./admin/pages/Cards";
import AdminTransactions from "./admin/pages/AdminTransactions";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Default */}
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                {/* Customer Auth */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Customer Protected */}
                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />

                    <Route
                        path="/transactions"
                        element={<Transactions />}
                    />

                    <Route
                        path="/transfer"
                        element={<Transfer />}
                    />

                    <Route
                        path="/withdraw"
                        element={<Withdraw />}
                    />

                    <Route
                        path="/deposit"
                        element={<Deposit />}
                    />

                    <Route
                        path="/support"
                        element={<Support />}
                    />

                </Route>

                {/* Admin Login */}
                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />

                {/* Admin Protected */}
                <Route element={<AdminProtectedRoute />}>

                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/users"
                        element={<Users />}
                    />

                    <Route
                        path="/admin/users/add"
                        element={<AddUser />}
                    />

                    <Route
                        path="/admin/users/:id"
                        element={<UserDetails />}
                    />

                    <Route
                        path="/admin/topup"
                        element={<TopUp />}
                    />


                    <Route
                        path="/admin/transfers"
                        element={<Transfers />}
                    />


                    <Route
                        path="/admin/cards"
                        element={<Cards />}
                    />
                    
                    <Route
                        path="/admin/transactions"
                        element={<AdminTransactions />}
                    />

                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />
                </Route>

                {/* 404 */}
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;