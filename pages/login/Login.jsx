import React from 'react'
import "./login.scss";
import { Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="login">
            <div className ="card">
                <div className="left">
                    <h1>Not a User? Register below!</h1>
                    <p>By registering, you can add item to your shopping cart, purchase items and rent.</p>
                    <span>Don't have an account?</span>
                    <Link to="/register">
                    <button>Register</button>
                    </Link>
                </div>
                <div className="right">
                    <h1>Login</h1>
                    <form>
                        <input type="text" placeholder="Username" />
                        <input type="password" placeholder="Password" />
                        <button>Login</button>
                    </form>

                </div>
            </div>
        </div>
    )
}

export default Login;