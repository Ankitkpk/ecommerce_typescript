import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRating {
  stars: number;
  comment: string;
  postedBy: mongoose.Types.ObjectId;
}

export interface IProduct extends Document {
  title: string;
  price: number;
  description: string;
  quantity: number;
  slug: string;
  brand?: string;
  category?:string;
  sold: number;
  discount?: number;
  images: string[];
  totalRatings: number;
  ratings: IRating[];
}

export interface IProductDocument extends IProduct, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProductDocument> = new Schema(
  {
    title: { type: String, trim: true, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    slug: { type: String, required: true },
    brand: { type: String },
    category: { type: String, default: "" },
    sold: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    totalRatings: { type: Number, default: 0 },
    ratings: [
      {
        stars: { type: Number},
        comment: { type: String },
        postedBy: { type: Schema.Types.ObjectId, ref: "User"  },
      },
    ],
  },
  { timestamps: true }
);

const Product: Model<IProductDocument> = mongoose.model<IProductDocument>("Product", ProductSchema);
export default Product;
