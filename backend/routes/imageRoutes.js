import express from "express";
import multer from "multer";
import fs from "fs";
import { analyzeImageWithGemini } from "../services/geminiService.js";
import Image from "../models/imageModel.js";
import cloudinary from "../services/Cloudinary.js";

const router = express.Router();

// ✅ Multer storage configuration
const upload = multer({
  dest: "uploads/",

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  },
});

router.post("/upload", upload.single("image"), async (req, res) => {
  console.log("✅ I am at upload middleware");

  if (!req.file) {
    console.log("❌ No file received.");
    return res.status(400).json({ message: "No image uploaded" });
  }

  try {
    // ✅ Read image and convert to Base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    // ✅ Upload to Cloudinary first
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "resumes", // Save in Cloudinary folder
      resource_type: "image", // Upload as image
    });

    console.log("✅ Uploaded to Cloudinary:", result.url);

    // ✅ Analyze the image with Gemini
    const materials = await analyzeImageWithGemini(imageBase64);

    // ✅ Save the result in MongoDB
    const newImage = new Image({
      imageUrl: result.secure_url, // ✅ Use Cloudinary URL
      materials,
      uploadedAt: new Date(),
    });

    await newImage.save();

    // ✅ Cleanup the uploaded image
    fs.unlinkSync(req.file.path);

    // ✅ Send response
    res.status(200).json({
      message: "Upload successful",
      materials,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
