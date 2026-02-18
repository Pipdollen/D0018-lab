import "./navbar.scss";
import React from 'react'
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';


const Navbar = () => {
    return (
        <div className="navbar">Navbar
            <div className="left">
                <LocalGroceryStoreOutlinedIcon className="icon" />
            </div>
            <div className="right">
                <HomeOutlinedIcon className="icon" />
            </div>
        </div>
    )
}

export default Navbar;