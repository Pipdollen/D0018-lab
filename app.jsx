import React from 'react'
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
    createBrowserRouter,
    RouterProvider,
    Route,
    Outlet
} from "react-router-dom";
import Navbar from './components/navbar/Navbar';
import LeftBar from './components/leftBar/LeftBar';
import RightBar from './components/rightBar/rightBar';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';



function App() {
    const Layout = () => {
        return (
            <div>
                <div style={{ display: "flex" }}>
                    <LeftBar />
                    <Outlet />
                    <RightBar />
                </div>
            </div>
        );
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    path: "/",
                    element: <Home />
                },
            ]
        },
        {
            path: "/login",
            element: <Login />
        },
        {
            path: "/register",
            element: <Register />
        },
        {
            path: "/profile",
            element: <Profile />
        }
    ]);


    return (
        <div>
            <Navbar />
            <RouterProvider router={router} />
        </div>
    )
}

export default App;