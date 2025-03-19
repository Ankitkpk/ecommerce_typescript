import express from "express";
import { Login , registerUser } from "../controller/userController";

const router = express.Router();

router.post("/login", Login);
router.post("/register", registerUser);

export default router;