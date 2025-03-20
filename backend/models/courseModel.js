import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  materials: [{ type: String, required: true }], // 🛠️ Raw materials
  preferences: [{ type: String, required: true }], // 🔥 Transformation methods

  steps: [
    {
      step_number: { type: Number, required: true },
      description: { type: String, required: true },
      tools_needed: [{ type: String }],
    },
  ], // ✅ AI-generated steps

  tips: [{ type: String }], // ✅ AI-generated tips
  tools: [{ type: String }], // ✅ Tools for the entire course
  imageUrl: { type: String }, // ✅ Optional course image

  createdAt: { type: Date, default: Date.now, index: true }, // ✅ Index for efficient sorting

  // ✅ Store both Creator ID and Name
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creatorName: { type: String, required: true },
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
