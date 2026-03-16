import express from "express";
import {
    getRentalCart,
    addRentalCartItem,
    updateRentalCartItem,
    deleteRentalCartItem,
    processRentalCheckout,
    getRentals,
} from "../controllers/rental.js";

const router = express.Router();

router.get("/cart", getRentalCart);
router.post("/cart/items", addRentalCartItem);
router.put("/cart/items/:idProduct", updateRentalCartItem);
router.delete("/cart/items/:idProduct", deleteRentalCartItem);
router.post("/checkout", processRentalCheckout);
router.get("/", getRentals);

export default router;
