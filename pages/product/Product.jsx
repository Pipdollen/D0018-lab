import React, { useContext, useEffect, useState } from 'react'
import "./product.scss";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/authContext";


const Product = () => {
    const { idProducts } = useParams();
    const { currentUser } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviews, setReviews] = useState([]);
    const [reviewError, setReviewError] = useState("");
    const [reviewInput, setReviewInput] = useState({ rating: 5, comment: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            try {
                setLoading(true);
                setError("");
                setReviewError("");

                const [productRes, reviewsRes] = await Promise.all([
                    axios.get(`/api/items/find/${idProducts}`),
                    axios.get(`/api/reviews/product/${idProducts}`)
                ]);

                setProduct(productRes.data || null);
                setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
            } catch (err) {
                setProduct(null);
                setError(err.response?.data || "Failed to load product.");
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndReviews();
    }, [idProducts]);

    const handleReviewInputChange = (e) => {
        setReviewInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setReviewError("Please login to leave a review.");
            return;
        }

        try {
            setIsSubmittingReview(true);
            setReviewError("");

            const payload = {
                rating: Number(reviewInput.rating),
                comment: reviewInput.comment.trim(),
            };

            const res = await axios.post(
                `/api/reviews/product/${idProducts}`,
                payload,
                { withCredentials: true }
            );

            setReviews((prev) => [res.data, ...prev]);
            setReviewInput({ rating: 5, comment: "" });
        } catch (err) {
            setReviewError(err.response?.data || "Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const getRatingTotal = () => {
        if (reviews.length === 0) return "No ratings yet";
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        return `Average Rating: ${(total / reviews.length).toFixed(1)} / 5 (${reviews.length} review${reviews.length > 1 ? "s" : ""})`;
    };

    const handleAddToCart = async () => {
        if (!currentUser) {
            alert("Please login to add items to cart.");
            return;
        }

        if (!product) return;

        try {
            await axios.post(
                "/api/shoppingcart/items",
                { idProduct: product.idProducts, amount: 1 },
                { withCredentials: true }
            );
            alert("Item added to cart.");
        } catch (err) {
            alert(err.response?.data || "Could not add item to cart.");
        }
    };

    const handleAddToRental = async () => {
        if (!currentUser) {
            alert("Please login to rent items.");
            return;
        }

        if (!product) return;

        try {
            await axios.post(
                "/api/rentals/cart/items",
                { idProduct: product.idProducts, quantity: 1 },
                { withCredentials: true }
            );
            alert("Item added to rental cart!");
        } catch (err) {
            alert(err.response?.data || "Could not add item to rental cart.");
        }
    };

    if (loading) {
        return <div className="productPage">Loading product...</div>;
    }

    if (!product) {
        return (
            <div className="productPage">
                <p>{error || "Product not found."}</p>
                <Link to="/">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="productPage">
            <div className="productCard">
                <img src={product.image} alt={product.product_name} />
                <h1>{product.product_name}</h1>
                <p className="price">${Number(product.price).toFixed(2)}</p>
                <p>Stock: {product.stock}</p>
                {product.category_name && <p>Category: {product.category_name}</p>}
                {product.brand_name && <p>Brand: {product.brand_name}</p>}
                {product.size && <p>Size: {product.size}</p>}
                <p>{getRatingTotal()}</p>

                {error && <p>{error}</p>}

                <div className="actions">
                    <button onClick={handleAddToCart}>Add to Cart</button>
                    <button onClick={handleAddToRental}>Rent</button>
                    <Link to="/">Back to Home</Link>
                </div>

                <div className="reviewsSection">
                    <h2>Reviews</h2>

                    {currentUser ? (
                        <form className="reviewForm" onSubmit={handleSubmitReview}>
                            <label htmlFor="rating">Rating</label>
                            <select
                                id="rating"
                                name="rating"
                                value={reviewInput.rating}
                                onChange={handleReviewInputChange}
                            >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>

                            <label htmlFor="comment">Comment</label>
                            <textarea
                                id="comment"
                                name="comment"
                                maxLength={250}
                                value={reviewInput.comment}
                                onChange={handleReviewInputChange}
                                placeholder="Write your review (max 250 characters)"
                            />

                            <button type="submit" disabled={isSubmittingReview}>
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    ) : (
                        <p>Please login to leave a review.</p>
                    )}

                    {reviewError && <p>{reviewError}</p>}

                    <div className="reviewList">
                        {reviews.length === 0 ? (
                            <p>No reviews yet.</p>
                        ) : (
                            reviews.map((review) => (
                                <div className="reviewItem" key={review.idReviews}>
                                    <p><strong>{review.username}</strong></p>
                                    <p>Rating: {review.rating}/5</p>
                                    <p>{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Product;