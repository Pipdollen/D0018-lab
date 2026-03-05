
import "./home.scss";
import Product from '../../components/product/Product';
import React, { useState, useEffect } from 'react'
import axios from 'axios';

const Home = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchItemsData = async () => {
            try {
                const [itemsRes] = await Promise.all([
                    axios.get("/api/items/allitems"),
                ]);
                setItems(itemsRes.data);

            } catch (error) {
                console.error("Error fetching items data:", error);
                setItems([]);
            }
        };
        fetchItemsData();
    }, []);

    return <div className="home">
        <div className="Products">
            <div className="productList">
                {items.map(item => (
                    <Product product={item} key={item.idProducts} />
                ))}
            </div>
        </div>
    </div>
}

export default Home;