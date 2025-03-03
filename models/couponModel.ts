import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountPercentage: number;
  expiryDate: Date;
  isActive: boolean;
}

const CouponSchema: Schema<ICoupon> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", CouponSchema);
export default Coupon;
