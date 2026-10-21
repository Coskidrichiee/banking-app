import {
    Navigate,
    Outlet,
    useLocation
} from "react-router-dom";

function AdminProtectedRoute() {

    const location = useLocation();

    const token =
        localStorage.getItem("adminToken");

    const adminData =
        localStorage.getItem("admin");

    let admin = null;

    try {

        admin = adminData
            ? JSON.parse(adminData)
            : null;

    } catch {

        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );

    }

    if (!token || !admin) {

        return (
            <Navigate
                to="/admin/login"
                replace
                state={{
                    from: location
                }}
            />
        );

    }

    return <Outlet />;

}

export default AdminProtectedRoute;