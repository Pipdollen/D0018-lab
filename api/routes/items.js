import express from 'express';
import {addItem, getItem, getAllItems, getCategories, getBrands, getSizes} from '../controllers/item.js';
const router = express.Router();

// TODO: Add item controller and handlers
router.get("/find/:ItemId", getItem);
router.post("/additem", addItem);
router.get("/allitems", getAllItems);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/sizes", getSizes);


export default router;