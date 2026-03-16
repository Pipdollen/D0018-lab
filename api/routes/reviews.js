import express from "express";
import { createReview, getProductReviews } from "../controllers/review.js";

const router = express.Router();

router.get("/product/:idProducts", getProductReviews);
router.post("/product/:idProducts", createReview);

export default router;
