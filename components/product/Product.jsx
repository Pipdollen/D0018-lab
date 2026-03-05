import "./product.scss"
import React, { useContext } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../../context/authContext"

const Product = ({ product }) => {
    const { currentUser } = useContext(AuthContext);

    const handleAddToCart = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("Please login to add items to cart.");
            return;
        }

        try {
            await axios.post(
                "/api/shoppingcart/items",
                {
                    idProduct: product.idProducts,
                    amount: 1,
                },
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Failed to add item to cart:", error);
            alert(error.response?.data || "Could not add item to cart.");
        }
    };

    return (
        <div className='product'>
            <div className="productInfo">
                <Link to={`/product/${product.idProducts}`} className="link">
                    <h2>{product.product_name}</h2>
                </Link>
                <img src={product.image} alt={product.product_name}  />
                <p>${product.price}</p>
                <p>Stock: {product.stock}</p>
                <form onSubmit={handleAddToCart}>
                    <button type="submit">Add to Cart</button>
                </form>
            </div>

        </div>
    )
}

export default Product