import React, { useState, useEffect } from 'react'
import "./additems.scss";
import axios from "axios";

const AddItems = () => {
    const [inputs, setInputs] = useState({
        productname: "",
        price: "",
        category: "",
        brand: "",
        size: "",
        stock: "",
        productimage: "",
        productId: "",
        newStock: "",
        newPrice: "",
    })

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [err, setErr] = useState(null);
    const [products, setProducts] = useState([]);

    const normalizeRows = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.rows)) return payload.rows;
        return [];
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [categoriesRes, brandsRes, sizesRes, productsRes,] = await Promise.all([
                    axios.get("/api/items/categories"),
                    axios.get("/api/items/brands"),
                    axios.get("/api/items/sizes"),
                    axios.get(`/api/items/allitems`),
                ]);
                setCategories(normalizeRows(categoriesRes.data));
                setBrands(normalizeRows(brandsRes.data));
                setSizes(normalizeRows(sizesRes.data));
                setProducts(normalizeRows(productsRes.data));
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                setCategories([]);
                setBrands([]);
                setSizes([]);
                setProducts([]);
                setErr("Failed to load form options");
            }
        };
        fetchDropdownData();
    }, []);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const refreshProducts = async () => {
        try {
            const productsRes = await axios.get("/api/items/allitems");
            setProducts(normalizeRows(productsRes.data));
        } catch (error) {
            setProducts([]);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setErr(null);

        try {
            await axios.post("/api/items/additem", {
                productname: inputs.productname,
                price: inputs.price,
                category: inputs.category,
                brand: inputs.brand,
                size: inputs.size,
                stock: inputs.stock,
                productimage: inputs.productimage,
            });
            setErr("Item added to Products page successfully!");
            // Reset form
            setInputs({
                productname: "",
                price: "",
                category: "",
                brand: "",
                size: "",
                stock: "",
                productimage: "",
                productId: "",
                newStock: "",
                newPrice: "",
            });
            await refreshProducts();
        } catch (err) {
            setErr(err.response?.data || "Failed to add item");
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        setErr(null);

        try {
            if (!inputs.productId) {
                setErr("Please select a product.");
                return;
            }

            if (inputs.newStock === "") {
                setErr("Please enter a new stock value.");
                return;
            }

            await axios.put(`/api/items/stock/${inputs.productId}`, {
                stock: Number(inputs.newStock),
            });

            setErr("Stock updated successfully!");
            setInputs((prev) => ({
                ...prev,
                productId: "",
                newStock: "",
            }));
            await refreshProducts();
        } catch (err) {
            setErr(err.response?.data || "Failed to update stock");
        }
    };

    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        setErr(null);

        try {
            if (!inputs.productId) {
                setErr("Please select a product.");
                return;
            }

            if (inputs.newPrice === "") {
                setErr("Please enter a new price value.");
                return;
            }

            await axios.put(`/api/items/price/${inputs.productId}`, {
                price: Number(inputs.newPrice),
            });

            setErr("Price updated successfully!");
            setInputs((prev) => ({
                ...prev,
                productId: "",
                newPrice: "",
            }));
            await refreshProducts();
        } catch (err) {
            setErr(err.response?.data || "Failed to update price");
        }
    };


    return (
        <div className="AddItems">
            <h1>Fill in product information</h1>
            <form>
                <input type="text" placeholder="Product name" name="productname" onChange={handleChange} value={inputs.productname} />
                <input type="number" placeholder="Product Price" name="price" onChange={handleChange} value={inputs.price} />
                <select name="category" id="category" onChange={handleChange} value={inputs.category}>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat.idCategories} value={cat.idCategories}>
                            {cat.category_name}
                        </option>
                    ))}
                </select>
                <select name="brand" id="brand" onChange={handleChange} value={inputs.brand}>
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                        <option key={brand.idBrands} value={brand.idBrands}>
                            {brand.brand_name}
                        </option>
                    ))}
                </select>
                <select name="size" id="size" onChange={handleChange} value={inputs.size}>
                    <option value="">Select Size</option>
                    {sizes.map((size) => (
                        <option key={size.idSizes} value={size.idSizes}>
                            {size.size}
                        </option>
                    ))}
                </select>
                <input type="number" placeholder="Stock" name="stock" onChange={handleChange} value={inputs.stock} />
                <input type="text" placeholder="Product image URL" name="productimage" onChange={handleChange} value={inputs.productimage} />
                <button onClick={handleAddItem}>Add Item</button>
                {err && <p className="error-message">{err}</p>}
            </form>

            <h1>Change stock</h1>
            <form>
                <select name="productId" id="productId" onChange={handleChange} value={inputs.productId}>
                    <option value="">Select Product</option>
                    {products.map((product) => (
                        <option key={product.idProducts} value={product.idProducts}>
                            {product.product_name || product.productname}
                        </option>
                    ))}
                </select>
                <p>Current Stock: {products.find(p => p.idProducts === Number(inputs.productId))?.stock || "N/A"}  </p>
                <input type="number" placeholder="New Stock" name="newStock" onChange={handleChange} value={inputs.newStock} />
                <button onClick={handleUpdateStock}>Update Stock</button>
                {err && <p className="error-message">{err}</p>}
            </form>

            <h1>Change Price</h1>
            <form>
                <select name="productId" id="productId" onChange={handleChange} value={inputs.productId}>
                    <option value="">Select Product</option>
                    {products.map((product) => (
                        <option key={product.idProducts} value={product.idProducts}>
                            {product.product_name || product.productname}
                        </option>
                    ))}
                </select>
                <p>Current Price: {products.find(p => p.idProducts === Number(inputs.productId))?.price || "N/A"}  </p>
                <input type="number" placeholder="New Price" name="newPrice" onChange={handleChange} value={inputs.newPrice} />
                <button onClick={handleUpdatePrice}>Update Price</button>
                {err && <p className="error-message">{err}</p>}
            </form>
        </div>
    )
}

export default AddItems;