import React from 'react'
import "./register.scss";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <div className="register">
            <div className ="card">
                <div className="left">
                    <h1>Register</h1>
                    <form>
                        <input type="text" placeholder="Username" />
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <input type="password" placeholder="Confirm Password" />
                        <button>Register</button>
                    </form>
                </div>
                <div className="right">
                    <h1>Not a User?</h1>
                    <p>By registering, you can add item to your shopping cart, purchase items and rent.</p>
                    <span>Already have an account?</span>
                    <Link to="/login">
                    <button>Login</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Register;