import "./navbar.scss";
import React from 'react'
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Link } from "react-router-dom";


const Navbar = () => {
    return (
        <div className="navbar">
            <div className="left">
                <Link to="/" style={{ textDecoration: "none", color: "black" }} className ="link">
                    <span> SkiStore </span>
                    <HomeOutlinedIcon />
                </Link>
                
            </div>
            <div className="center">
                <div className="search">
                    <SearchOutlinedIcon />
                    <input type="text" placeholder="Search for products, brands and more" />
                </div>
                <Link to="/register" style={{ textDecoration: "none", color: "black" }}>

                <button>Register</button>
                </Link>
                <span> Temporary button</span>
            </div>

            <div className="right">
                <Link to="/shoppingcart" style={{ textDecoration: "none", color: "black" }}>
                    <LocalGroceryStoreOutlinedIcon />
                </Link>

                <Link to="/profile" style={{ textDecoration: "none", color: "black" }} className ="link">
                    <AccountCircleOutlinedIcon />
                    <span>Axel Grönberg</span>
                </Link>

            </div>
        </div>
    )
}

export default Navbar;