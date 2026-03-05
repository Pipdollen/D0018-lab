import { useContext, useState } from "react";
import React from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/authContext';


const Login = () => {

     const [inputs, setInputs] = useState({
            username: "",
            password: "",
        });
    
        const [err, setErr] = useState(null);

        const navigate = useNavigate();
    
        const handleChange = (e) => {
            setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        };

    const {login} = useContext(AuthContext);

    const handleLogin = async(e)=>{
        e.preventDefault();
        try{
            await login(inputs);
            navigate("/")
        }catch(err){
            setErr(err.response?.data || err.message || "Login failed")
        }

    }

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
                    <form onSubmit={handleLogin}>
                        <input type="text" placeholder="Username" name="username" onChange={handleChange} />
                        <input type="password" placeholder="Password" name="password" onChange={handleChange}/>
                        {err && err}
                        <button type="submit">Login</button>
                    </form>

                </div>
            </div>
        </div>
    )
}

export default Login;