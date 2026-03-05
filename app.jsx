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
import ShoppingCart from './pages/shoppingcart/ShoppingCart';
import Checkout from './pages/checkout/checkout';
import Orders from './pages/orders/Orders';
import AddItems from './pages/addItems/AddItems';



function App() {
    const RootLayout = () => {
        return (
            <div>
                <Navbar />
                <Outlet />
            </div>
        );
    };

    const MainLayout = () => {
        return (
            <div>
                <Navbar />
                <div style={{ display: "flex" }}>
                    <LeftBar />
                    <Outlet />
                </div>
            </div>
        );
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: <MainLayout />,
            children: [
                {
                    path: "/",
                    element: <Home />
                },
            ]
        },
        {
            path: "/login",
            element: <RootLayout />,
            children: [
                {
                    path: "/login",
                    element: <Login />
                },
            ]
        },
        {
            path: "/register",
            element: <RootLayout />,
            children: [
                {
                    path: "/register",
                    element: <Register />
                },
            ]
        },
        {
            path: "/profile",
            element: <RootLayout />,
            children: [
                {
                    path: "/profile",
                    element: <Profile />
                },
            ]
        },
        {
            path: "/shoppingcart",
            element: <RootLayout />,
            children: [
                {
                    path: "/shoppingcart",
                    element: <ShoppingCart />
                },
            ]
        },
        {
            path: "/checkout",
            element: <RootLayout />,
            children: [
                {
                    path: "/checkout",
                    element: <Checkout />
                },
            ]
        },
        {
            path: "/orders",
            element: <RootLayout />,
            children: [
                {
                    path: "/orders",
                    element: <Orders />
                },
            ]
        },
        {
            path: "/additems",
            element: <RootLayout/>,
            children: [
                {
                    path: "/additems",
                    element: <AddItems/>
                },
            ]
        }
    ]);


    return (
        <div>
            <RouterProvider router={router} />
        </div>
    )
}

export default App;