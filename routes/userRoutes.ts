import express from "express";
import { Login } from "../controller/userController";

const router = express.Router();

router.post("/login", Login);

export default router;