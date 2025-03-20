import express from "express";
import { Login , registerUser , getUser , deleteUser , updateUser } from "../controller/userController";
import { AuthenticatedUser } from "../middleware/auth";
import { isAdmin } from "../middleware/auth";
const router = express.Router();

router.post("/login", AuthenticatedUser, Login);
router.post("/register", registerUser);
router.get("/user/:id",isAdmin, getUser);
router.delete("/deleteUser/:id",isAdmin, deleteUser);
router.put('/updateUser/:id' ,isAdmin, updateUser);

export default router;