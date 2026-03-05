import express from "express";
import { getOrders, processCheckout } from "../controllers/checkout.js";

const router = express.Router();

router.post("/", processCheckout);
router.get("/orders", getOrders);

export default router;
