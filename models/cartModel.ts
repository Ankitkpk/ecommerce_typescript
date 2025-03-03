import mongoose, { Schema, Document, Model } from "mongoose";

interface ICartItem {
  qty: number;
  price: number;
  product: mongoose.Types.ObjectId;
}


interface ICart extends Document {
  cartItems: ICartItem[];
  user: mongoose.Types.ObjectId;
  cartTotal: number;
}
const CartSchema: Schema<ICart> = new Schema(
  {
    cartItems: [
      {
        qty: { type: Number, required: true },
        price: { type: Number, required: true }, // Added price to avoid virtual field errors
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      },
    ],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CartSchema.virtual("cartTotal").get(function (this: ICart) {
  return this.cartItems.reduce((total, item) => total + item.qty * item.price, 0);
});

const Cart: Model<ICart> = mongoose.model<ICart>("Cart", CartSchema);
export default Cart;
