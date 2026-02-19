import React, { useState } from 'react'
import "./register.scss";
import { Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
        email: "",
        confirmPassword: "",
    });

    const [err, setErr] = useState(null);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setErr(null);

        if (inputs.password !== inputs.confirmPassword) {
            setErr("Passwords do not match");
            return;
        }
        try{
            inputs.confirmPassword = undefined;
            await axios.post("http://13.53.123.179:3000/api/auth/register", inputs);
            setErr("account created successfully");
        } catch (err) {
            setErr(err.response.data);
        }
        
        //todo
    };

    console.log(err);
    

    return (
        <div className="register">
            <div className ="card">
                <div className="left">
                    <h1>Register</h1>
                    <form>
                        <input type="text" placeholder="Username" name="username" onChange={handleChange}/>
                        <input type="email" placeholder="Email" name="email" onChange={handleChange}/>
                        <input type="password" placeholder="Password" name="password" onChange={handleChange}/>
                        <input type="password" placeholder="Confirm Password" name="confirmPassword" onChange={handleChange}/>
                        {err && err}
                        <button onClick={handleClick}>Register</button>
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