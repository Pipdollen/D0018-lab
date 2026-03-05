import React from "react";
import axios from "axios";
import {createContext, useEffect, useState} from "react";

export const AuthContext = createContext();

export const AuthContextProdivder = ({ children }) => {
    const [currentUser, setCurrentUser] = useState (
        JSON.parse(localStorage.getItem("user")) || null  
    );

    const login = async (inputs) => {
        const res = await axios.post("/api/auth/login", inputs, {
            withCredentials: true,
        })
        setCurrentUser(res.data)
    };

    const logout = async () => {
        await axios.post(
            "/api/auth/logout",
            {},
            {
                withCredentials: true,
            }
        );
        setCurrentUser(null);
    };

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(currentUser));
    }, [currentUser]);

    return (
        <AuthContext.Provider value = {{currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};