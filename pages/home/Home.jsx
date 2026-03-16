
import "./home.scss";
import Product from '../../components/product/Product';
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

const Home = () => {
    const [items, setItems] = useState([]);
    const outletContext = useOutletContext() || {};
    const filters = outletContext.filters || {
        category: "all",
        brand: "all",
        size: "all",
        minPrice: "",
        maxPrice: "",
    };

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

    const filteredItems = items.filter((item) => {
        const itemPrice = Number(item.price);
        const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
        const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);

        const matchesCategory =
            filters.category === "all" ||
            Number(item.idProductCategorie) === Number(filters.category);

        const matchesBrand =
            filters.brand === "all" ||
            Number(item.idProductBrand) === Number(filters.brand);

        const matchesSize =
            filters.size === "all" ||
            Number(item.idProductSize) === Number(filters.size);

        const matchesMinPrice = minPrice === null || itemPrice >= minPrice;
        const matchesMaxPrice = maxPrice === null || itemPrice <= maxPrice;

        return (
            matchesCategory &&
            matchesBrand &&
            matchesSize &&
            matchesMinPrice &&
            matchesMaxPrice
        );
    });

    return <div className="home">
        <div className="Products">
            <div className="productList">
                {filteredItems.map(item => (
                    <Product product={item} key={item.idProducts} />
                ))}
                {filteredItems.length === 0 && <p>No products match your filters.</p>}
            </div>
        </div>
    </div>
}

export default Home;