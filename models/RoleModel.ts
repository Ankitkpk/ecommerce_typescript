import mongoose, { Document, Schema, Model } from "mongoose";

interface IPermission {
  resource: string; 
  actions: string[]; // Example: ["create", "read", "update", "delete"]
}

// Define Role Interface
interface IRole extends Document {
  name: "admin" | "vendor" | "customer";
  permissions: IPermission[];
}

// Define Role Schema
const RoleSchema: Schema<IRole> = new Schema(
  {
    name: {
      type: String,
      enum: ["admin", "vendor", "customer"],
      required: true,
      unique: true,
    },
    permissions: [
      {
        resource: { type: String, required: true },
        actions: [{ type: String, required: true }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Role: Model<IRole> = mongoose.model<IRole>("Role", RoleSchema);
export default Role;
