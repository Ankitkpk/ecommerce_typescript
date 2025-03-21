import express from "express";
import { Login, registerUser, getUser, deleteUser, updateUser } from "../controller/userController";
import { AuthenticatedUser, isAdmin } from "../middleware/auth";

const router = express.Router();

router.route("/login").post(Login);
router.route("/register").post(registerUser);
router.route("/user/:id").get(isAdmin, getUser);
router.route("/deleteUser/:id").delete(isAdmin, deleteUser);
router.route("/updateUser/:id").put(isAdmin, updateUser);

export default router;