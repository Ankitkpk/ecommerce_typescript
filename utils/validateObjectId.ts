import mongoose from "mongoose";

const validateId = (id: string): boolean => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("Invalid ID");
  return isValid;
};

export default validateId;