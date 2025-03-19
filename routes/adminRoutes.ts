import { Router } from "express";
import {signupAdmin, loginAdmin, forgetPassword, resetPassword}  from '../controller/adminController'

const router=Router();

router.post("/adminSignup", signupAdmin);
router.post("/adminLogin", loginAdmin); 
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;