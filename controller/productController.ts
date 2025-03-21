import { Request,Response } from "express";
import Product from "../models/productModel";

export const createProduct = async (req:Request, res: Response): Promise<any> => {
    try {
      const { title, price, description, quantity, slug, brand, category, discount, images } = req.body;
  
      // Check for mandatory fields
      if (!title || !price || !description || !quantity || !slug) {
        return res.status(400).json({ message: "All mandatory fields are required." });
      }
  
      // Create a new product
      const product = new Product({
        title,
        price,
        description,
        quantity,
        slug,
        brand,
        category,
        discount,
        images,
      });
  
      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  