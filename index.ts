import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db";
import adminRoutes from './routes/adminRoutes';
import userRoutes from   './routes/userRoutes'
import cookieParser from "cookie-parser"; 
config(); 
const app = express();
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" })); 
app.use(cookieParser()); 


const PORT = process.env.PORT || 3000;

connectDB();
app.post('/admin' , adminRoutes);
app.post('/login', userRoutes);
app.post('/register',userRoutes);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
