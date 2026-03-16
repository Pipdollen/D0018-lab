import express from "express";
import {
    changePassword,
    UpdateUser,
} from "../controllers/user.js";

const router = express.Router();

router.put("/changePassword", changePassword);
router.put("/updateUser", UpdateUser);


export default router;
