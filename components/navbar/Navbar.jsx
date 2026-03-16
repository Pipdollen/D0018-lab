import "./navbar.scss";
import React, { useContext } from 'react'
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";


const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        }
    };

    const checkLogin = (user) => {
        if (user == null) {
            return (
            <Link to="/Login" style={{ textDecoration: "none", color: "black" }} className="link">
                <AccountCircleOutlinedIcon />
                <span>Login/Register</span>
            </Link>
            )
        } else {
            return(
            <>
                <Link to="/profile" style={{ textDecoration: "none", color: "black" }} className="link">
                    <AccountCircleOutlinedIcon />
                    <span>{user.username}</span>
                </Link>
                <button onClick={handleLogout}>Logout</button>
            </>
            )
        }
    }
     const checkAdmin = (user) => {
        if (user == null) {
            return (null);
        } else if (user.is_admin == 1){
            return(
            <Link to="/additems" style={{ textDecoration: "none", color: "black" }} className="link">
                <button>AddItems / change Stock</button>
            </Link>
            )
        } else {
            return (null)
        }
    };

    const test = () => {


        return (
            <Link to="/profile" style={{ textDecoration: "none", color: "black" }} className="link">
                <AccountCircleOutlinedIcon />
                <span>{checkLogin(currentUser)}</span>
            </Link>
        )
    }

    return (
        <div className="navbar">
            <div className="left">
                <Link to="/" style={{ textDecoration: "none", color: "black" }} className="link">
                    <span> SkiStore </span>
                    <HomeOutlinedIcon />
                </Link>

            </div>
            <div className="center">
                
                {checkAdmin(currentUser)}
            </div>

            <div className="right">
                

                <Link to="/shoppingcart" style={{ textDecoration: "none", color: "black" }}>
                    <LocalGroceryStoreOutlinedIcon />
                </Link>

                {checkLogin(currentUser)}

            </div>
        </div>
    )
}

export default Navbar;