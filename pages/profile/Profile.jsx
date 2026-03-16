import React, { useState } from 'react'
import "./profile.scss";
import { Form, Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
    const [inputs, setInputs] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        email: "",
        address: "",
        country: "",
        city: "",
        zipCode: "",
    });

    const [err, setErr] = useState(null);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErr(null);

        if (inputs.newPassword !== inputs.confirmNewPassword) {
            setErr("New passwords do not match");
            return;
        }

        try {
            await axios.put("/api/users/changePassword", {
                currentPassword: inputs.currentPassword,
                newPassword: inputs.newPassword,
            });
            setErr("Password updated successfully");
        } catch (err) {
            setErr(err.response.data);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setErr(null);

        try {
            await axios.put("/api/users/updateUser", {
                email: inputs.email,
                address: inputs.address,
                country: inputs.country,
                city: inputs.city,
                zipcode: inputs.zipCode,
            });
            setErr("Profile updated successfully");
        } catch (err) {
            setErr(err.response.data);
        }
    };
    


    return (

        <div className="profile">
            <div className="profile-header">
                <h1>Profile Page</h1>
                <p>This is the profile page. You can view and edit your profile information here.</p>
                <Link to="/orders">
                    <button>View previous orders</button>
                </Link>
            </div>
            <div className="card">
                <div className="left">
                    <form>
                        <p> Change Password </p>
                        <input
                            type="password"
                            placeholder="Current Password"
                            name="currentPassword"
                            value={inputs.currentPassword}
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            name="newPassword"
                            value={inputs.newPassword}
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            name="confirmNewPassword"
                            value={inputs.confirmNewPassword}
                            onChange={handleChange}
                        />
                        {err && err}
                        <button onClick={handlePasswordChange}>Update Password</button>
                    </form>
                </div>
                <div className="right">
                    <form>
                        <p> Update Profile Information </p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            name="email"
                            value={inputs.email}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            name="address"
                            value={inputs.address}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            name="country"
                            value={inputs.country}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            placeholder="City"
                            name="city"
                            value={inputs.city}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            placeholder="Zip Code"
                            name="zipCode"
                            value={inputs.zipCode}
                            onChange={handleChange}
                        />
                        {err && err}
                        <button onClick={handleProfileUpdate}>Update Profile</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Profile;