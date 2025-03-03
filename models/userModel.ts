import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: string;
  isBlocked: boolean;
  cart: { product: mongoose.Types.ObjectId; quantity: number }[];
  wishlist: mongoose.Types.ObjectId[];
  createPasswordResetToken(): string;
  isPasswordMatched(password: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    role: { type: String, default: "user" },
    isBlocked: { type: Boolean, default: false },
    cart: [{ product: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

UserSchema.methods.createPasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 100 * 60 * 1000);
  return this.passwordResetToken;
};


UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hashed = await bcrypt.hash(this.password, 10);
    if (!hashed) return next(new Error("Could not hash the password"));
    this.password = hashed;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to Compare Password
UserSchema.methods.isPasswordMatched = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
