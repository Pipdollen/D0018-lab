import React, {useState, useEffect} from 'react'
import "./additems.scss";
import axios from "axios";

const AddItems = () => {
    const [inputs, setInputs] = useState({
        productname: "",
        price:"",
        category:"",
        brand:"",
        size:"",
        stock:"",
        productimage:"",
    })

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [err, setErr] = useState(null);

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
                setErr("Failed to load form options");
            }
        };
        fetchDropdownData();
    }, []);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setErr(null);

        try{
            await axios.post("/api/items/additem", inputs);
            setErr("Item added to Products page successfully!");
            // Reset form
            setInputs({
                productname: "",
                price:"",
                category:"",
                brand:"",
                size:"",
                stock:"",
                productimage:"",
            });
        } catch (err) {
            setErr(err.response?.data || "Failed to add item");
        }
    };


    return (
        <div className="AddItems">
            <h1>Fill in product information</h1>
            <form>
                <input type="text" placeholder="Product name" name="productname" onChange={handleChange} value={inputs.productname}/>
                <input type="number" placeholder="Product Price" name="price" onChange={handleChange} value={inputs.price}/>
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
                <input type="number" placeholder="Stock" name="stock" onChange={handleChange} value={inputs.stock}/>
                <input type="text" placeholder="Product image URL" name="productimage" onChange={handleChange} value={inputs.productimage}/>
                <button onClick={handleClick}>Add Item</button>
                {err && <p className="error-message">{err}</p>}
            </form>
        </div>
    )
}

export default AddItems;