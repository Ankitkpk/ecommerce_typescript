import express from "express";
import { Login , registerUser , getUser , deleteUser , updateUser } from "../controller/userController";

const router = express.Router();

router.post("/login", Login);
router.post("/register", registerUser);
router.get("/user/:id", getUser);
router.delete("/deleteUser/:id", deleteUser);
router.put('/updateUser/:id' , updateUser);

export default router;