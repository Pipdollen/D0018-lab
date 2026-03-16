import "./leftBar.scss";
import React, { useState, useEffect } from 'react'
import axios from 'axios';

const LeftBar = ({ filters, onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [sizes, setSizes] = useState([]);

    const normalizeRows = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.rows)) return payload.rows;
        return [];
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [categoriesRes, brandsRes, sizesRes] = await Promise.all([
                    axios.get("/api/items/categories"),
                    axios.get("/api/items/brands"),
                    axios.get("/api/items/sizes")
                ]);
                setCategories(normalizeRows(categoriesRes.data));
                setBrands(normalizeRows(brandsRes.data));
                setSizes(normalizeRows(sizesRes.data));
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                setCategories([]);
                setBrands([]);
                setSizes([]);
            }
        };
        fetchDropdownData();
    }, []);

    const handleInputChange = (e) => {
        onFilterChange(e.target.name, e.target.value);
    };

    return (
        <div className="leftBar">
            <h1>Filters</h1>
            <div className="categories">
                <h2>Categories</h2>
                <select name="category" id="categories" value={filters.category} onChange={handleInputChange}>
                    <option value="all">All</option>
                    {categories.map((cat) => (
                        <option key={cat.idCategories} value={cat.idCategories}>
                            {cat.category_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="PriceRange">
                <h2>Price range</h2>
                <div className="priceRange">
                    <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleInputChange} />
                    <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleInputChange} />
                </div>
            </div>
            <div className="brand">
                <h2>Brand</h2>
                <select name="brand" id="brand" value={filters.brand} onChange={handleInputChange}>
                    <option value="all">All</option>
                    {brands.map((brand) => (
                        <option key={brand.idBrands} value={brand.idBrands}>
                            {brand.brand_name}
                        </option>
                    ))}
                </select>
                <h2>Size</h2>
                <select name="size" id="size" value={filters.size} onChange={handleInputChange}>
                    <option value="all">All</option>
                    {sizes.map((size) => (
                        <option key={size.idSizes} value={size.idSizes}>
                            {size.size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default LeftBar;