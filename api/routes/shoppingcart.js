import express from "express";
import {
    getShoppingCart,
    addShoppingCartItem,
    updateShoppingCartItem,
    deleteShoppingCartItem,
} from "../controllers/shoppingcart.js";

const router = express.Router();

router.get("/", getShoppingCart);
router.post("/items", addShoppingCartItem);
router.put("/items/:idProduct", updateShoppingCartItem);
router.delete("/items/:idProduct", deleteShoppingCartItem);

export default router;
