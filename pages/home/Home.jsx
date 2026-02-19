import React from 'react'
import "./home.scss";

const Home = () => {
    return (
        <div className="home">
            <div className="Products">
                <h1>Products</h1>
                <div className="productList">
                    <div className="product1">
                        <h2>Peregrine 7.6 FDT Teal9</h2>
                        <img src = "https://www.skistarshop.com/_next/image?url=https%3A%2F%2Fshoplab.b-cdn.net%2Fskistar_production%2Fmedia-library%2F48577%2Fvolkl_2526_peregrine-7-6_teal_FDT10_V2410745_1.png&w=640&q=75&dpl=dpl_6rNzAB8oJPGAU5roBZPF7UKAoLhe" alt="Product Image"/>
                        <p>price: 3499 kr</p>
                        <button>Add to cart</button>
                    </div>
                     <div className="product2">
                        <h2>Forza 20 S Xpress One Colour</h2>
                        <img src = "https://www.skistarshop.com/_next/image?url=https%3A%2F%2Fshoplab.b-cdn.net%2Fskistar_production%2Fmedia-library%2F37479%2FA803152_C_1.png&w=640&q=75&dpl=dpl_6rNzAB8oJPGAU5roBZPF7UKAoLhe" alt="Product Image"/>
                        <p>price: 2999 kr</p>
                        <button>Add to cart</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;