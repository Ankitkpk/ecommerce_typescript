import mongoose, { Document, Schema, Model } from "mongoose";

// Define Blog Interface
interface IBlog extends Document {
  title: string;
  content: string;
  category: string;
  numViews: number;
  numLikes: number;
  likes: mongoose.Types.ObjectId[];
  image: string;
  author: string;
}

// Define Blog Schema
const BlogSchema: Schema<IBlog> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    numViews: { type: Number, default: 0 },
    numLikes: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    image: { type: String, default: "https://ibb.co/2sY9nwj" },
    author: { type: String, default: "Admin" },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const Blog: Model<IBlog> = mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;
