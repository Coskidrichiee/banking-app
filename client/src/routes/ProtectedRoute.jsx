
import {
    Navigate,
    Outlet
} from "react-router-dom";

import {
    useAuth
} from "../context/useAuth";


function ProtectedRoute() {

    const {
        isAuthenticated,
        loading
    } = useAuth();


    if (loading) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Arial, sans-serif"
                }}
            >

                <p>
                    Loading your account...
                </p>

            </div>

        );

    }


    if (!isAuthenticated) {

        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    return <Outlet />;

}


export default ProtectedRoute;
