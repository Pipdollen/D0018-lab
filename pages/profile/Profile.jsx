import React from 'react'
import "./profile.scss";
import { Link } from "react-router-dom";

const Profile = () => {
    return (
        <div className="profile">
            <h1>Profile Page</h1>
            <p>This is the profile page. You can view and edit your profile information here.</p>
            <div className="left">
                <form>
                    <p> Change Password </p>
                    <input type="password" placeholder="Current Password" />
                    <input type="password" placeholder="New Password" />
                    <input type="password" placeholder="Confirm New Password" />
                    <button>Update Password</button>
                </form>
            </div>
            <div className="right">
                <form>
                    <p> Update Profile Information </p>
                    <input type="email" placeholder="Email Address" />
                    <input type="text" placeholder="Phone Number" />
                    <input type="text" placeholder="Address" />
                    <input type="text" placeholder="Country" />
                    <input type="text" placeholder="City" />
                    <input type="text" placeholder="Zip Code" />
                    <button>Update Profile</button>
                </form>
            </div>
        </div>
    )
}

export default Profile;