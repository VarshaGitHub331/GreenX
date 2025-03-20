import mongoose from "mongoose";

// ✅ User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  preferences: {
    type: [String], // e.g., ["upcycling", "recycling"]
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
