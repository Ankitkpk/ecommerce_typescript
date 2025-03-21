import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./config/db";
import adminRoutes from './routes/adminRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from   './routes/userRoutes'
import cookieParser from "cookie-parser"; 
config(); 
const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json()); 
app.use(cookieParser()); 


const PORT = process.env.PORT || 3000;

connectDB();
app.use("/api/v1/user", userRoutes); 
app.use("/api/v1/product", productRoutes); 
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
