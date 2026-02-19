import "./leftBar.scss";
import React from 'react'

const LeftBar = () => {
    return (
        <div className="leftBar">
            <h1>Filters</h1>
            <div className="categories">
                <h2>Categories</h2>
                <select name="categories" id="categories" >
                    <option value="all">All</option>
                    <option value="skis">Skis</option>
                    <option value="snowboards">Snowboards</option>
                    <option value="boots">Boots</option>
                    <option value="ski-poles">Ski Poles</option>
                </select>
            </div>
            <div className="PriceRange">
                <h2>Price range</h2>
                <div className="priceRange">
                    <input type="number" placeholder="Min" />
                    <input type="number" placeholder="Max" />
                </div>
            </div>
            <div className="brand">
                <h2>Brand</h2>
                <select name="brand" id="brand" >
                    <option value="all">All</option>
                    <option value="atomic">Atomic</option>
                    <option value="salomon">Salomon</option>
                    <option value="fischer">Fischer</option>
                    <option value="rossignol">Rossignol</option>
                    <option value="head">Head</option>
                </select>
            </div>
        </div>
    )
}

export default LeftBar;