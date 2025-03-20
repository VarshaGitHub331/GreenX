import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const tokenBlacklist = new Set();
// ✅ User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, preferences } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      preferences,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send full user details along with the token
    res.status(200).json({
      message: "Register successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        preferences: newUser.preferences,
      },
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ User Login with Full User Info
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send full user details along with the token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// ✅ Get User Preferences
router.get("/preferences/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.post("/:id/preferences", async (req, res) => {
  const { id } = req.params;
  const { preferences } = req.body;
  console.log(id);
  console.log(preferences);
  if (!Array.isArray(preferences) || preferences.length === 0) {
    return res
      .status(400)
      .json({ message: "Preferences must be a non-empty array." });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // ✅ Add return to prevent further execution
    }

    // ✅ Update preferences
    user.preferences = preferences;
    await user.save();

    return res.status(200).json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);

    // ✅ Add return to prevent multiple responses
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    tokenBlacklist.add(token);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid token or already logged out" });
  }
});
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  if (tokenBlacklist.includes(token)) {
    return res
      .status(401)
      .json({ message: "Token invalid, please login again" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid Token" });
  }
};
// ✅ Get user preferences by ID
router.get("/:id/preferences", async (req, res) => {
  const { id } = req.params;

  // ✅ Validate ID format
  if (!id) {
    return res.status(400).json({ message: "Invalid or missing user ID" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Send current preferences
    res.status(200).json({
      preferences: user.preferences || [],
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
