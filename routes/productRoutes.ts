import express from "express";
import { createProduct } from "../controller/productController";
import { AuthenticatedUser} from "../middleware/auth";

const router = express.Router();

router.route("/createProduct").post( createProduct);
export default router;

