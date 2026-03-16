import express from 'express';
import {addItem, getItem, getAllItems, getCategories, getBrands, getSizes, updateStock, updatePrice} from '../controllers/item.js';
const router = express.Router();

// TODO: Add item controller and handlers
router.get("/find/:idProducts", getItem);
router.post("/additem", addItem);
router.get("/allitems", getAllItems);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/sizes", getSizes);
router.get("/stock/:idProducts", getItem);
router.put("/stock/:idProducts", updateStock);
router.put("/price/:idProducts", updatePrice);



export default router;