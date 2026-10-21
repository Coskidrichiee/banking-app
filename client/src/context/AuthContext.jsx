
import {
    createContext,
    useEffect,
    useState
} from "react";

import {
    registerUser,
    loginUser
} from "../services/api";


export const AuthContext =
    createContext(null);


export function AuthProvider({
    children
}) {

    const [user, setUser] =
        useState(null);


    const [token, setToken] =
        useState(
            localStorage.getItem(
                "banking_token"
            )
        );


    const [loading, setLoading] =
        useState(true);


    /* =========================================
       RESTORE LOGIN SESSION
    ========================================= */

    useEffect(() => {

        const savedToken =
            localStorage.getItem(
                "banking_token"
            );


        const savedUser =
            localStorage.getItem(
                "banking_user"
            );


        if (
            savedToken &&
            savedUser
        ) {

            try {

                setToken(savedToken);

                setUser(
                    JSON.parse(
                        savedUser
                    )
                );

            } catch (error) {

                console.error(
                    "Failed to restore user session:",
                    error
                );

                localStorage.removeItem(
                    "banking_token"
                );

                localStorage.removeItem(
                    "banking_user"
                );

                setToken(null);
                setUser(null);

            }

        }


        setLoading(false);

    }, []);


    /* =========================================
       REGISTER
    ========================================= */

    const register = async (
        userData
    ) => {

        const response =
            await registerUser(
                userData
            );


        if (
            response?.token
        ) {

            localStorage.setItem(
                "banking_token",
                response.token
            );

            setToken(
                response.token
            );

        }


        if (
            response?.user
        ) {

            localStorage.setItem(
                "banking_user",
                JSON.stringify(
                    response.user
                )
            );

            setUser(
                response.user
            );

        }


        return response;

    };


    /* =========================================
       LOGIN
    ========================================= */

    const login = async (
        credentials
    ) => {

        const response =
            await loginUser(
                credentials
            );


        if (
            !response?.token
        ) {

            throw new Error(
                "Invalid login response"
            );

        }


        localStorage.setItem(
            "banking_token",
            response.token
        );


        if (
            response?.user
        ) {

            localStorage.setItem(
                "banking_user",
                JSON.stringify(
                    response.user
                )
            );

        }


        setToken(
            response.token
        );


        setUser(
            response.user || null
        );


        return response;

    };


    /* =========================================
       LOGOUT
    ========================================= */

    const logout = () => {

        localStorage.removeItem(
            "banking_token"
        );


        localStorage.removeItem(
            "banking_user"
        );


        setToken(null);

        setUser(null);

    };


    /* =========================================
       CONTEXT
    ========================================= */

    return (

        <AuthContext.Provider
            value={{
                user,
                token,
                loading,

                isAuthenticated:
                    Boolean(token),

                register,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}