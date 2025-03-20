import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./services/db.js";
import imageRoutes from "./routes/imageRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // ✅ Import user routes
import courseRoutes from "./routes/courseRoutes.js"; // Adjust path as necessary

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect MongoDB
connectDB();

// ✅ API Routes
app.use("/api/images", imageRoutes);
app.use("/api/users", userRoutes); // ✅ User routes
app.use("/api/courses", courseRoutes);
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
