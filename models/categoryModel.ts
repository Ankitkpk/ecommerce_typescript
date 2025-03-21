import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategory extends Document {
  title: string;
  products: mongoose.Types.ObjectId[];
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    title: { type: String, required: true, unique: true, index: true },
     products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const Category: Model<ICategory> = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
