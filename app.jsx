import React, { useState } from 'react'
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
import RentalCheckout from './pages/rentalcheckout/RentalCheckout';
import Orders from './pages/orders/Orders';
import AddItems from './pages/addItems/AddItems';
import Product from './pages/product/Product';



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
        const [filters, setFilters] = useState({
            category: "all",
            brand: "all",
            size: "all",
            minPrice: "",
            maxPrice: "",
        });

        const handleFilterChange = (name, value) => {
            setFilters((prev) => ({ ...prev, [name]: value }));
        };

        return (
            <div>
                <Navbar />
                <div style={{ display: "flex" }}>
                    <LeftBar filters={filters} onFilterChange={handleFilterChange} />
                    <Outlet context={{ filters }} />
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
        },
        {
            path: "/product",
            element: <RootLayout/>,
            children: [
                {
                    path: "/product/:idProducts",
                    element: <Product/>
                },
            ]
        },
        {
            path: "/rental-checkout",
            element: <RootLayout />,
            children: [
                {
                    path: "/rental-checkout",
                    element: <RentalCheckout />
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