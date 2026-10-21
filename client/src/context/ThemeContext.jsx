import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

    const [darkMode, setDarkMode] = useState(() => {
        return JSON.parse(localStorage.getItem("darkMode")) || false;
    });

    useEffect(() => {

        localStorage.setItem("darkMode", JSON.stringify(darkMode));

        if (darkMode) {

            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");

        } else {

            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");

        }

    }, [darkMode]);

    return (
        <ThemeContext.Provider
            value={{
                darkMode,
                setDarkMode
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);