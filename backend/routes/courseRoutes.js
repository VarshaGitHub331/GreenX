import express from "express";
import Course from "../models/courseModel.js"; // Assuming courseModel is in models folder
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
router.post("/create", async (req, res) => {
  const { title, materials, preferences, imageUrl, creatorId, creatorName } =
    req.body;
  console.log(creatorId);
  console.log(creatorName);
  if (
    !materials ||
    !preferences ||
    materials.length === 0 ||
    preferences.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Materials and preferences are required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build the prompt for course generation
    const prompt = `
          Create a detailed DIY course based on the following title, materials and transformation preferences:
          -Title:${title}
          - Materials: ${materials.join(", ")}
          - Preferences: ${preferences.join(", ")}
          
          Please provide a JSON object with the following structure, without any additional formatting or special characters (such as Markdown or backticks):
    
          {
            "title": "A creative and catchy course title",
            "description": "A brief description of the course, highlighting the purpose and what learners will achieve.",
            "steps": [
              {
                "step_number": 1,
                "description": "Detailed description of the first step with any necessary tools or equipment.",
                "tools_needed": ["tool1", "tool2"]
              },
              {
                "step_number": 2,
                "description": "Detailed description of the second step with any necessary tools or equipment.",
                "tools_needed": ["tool1"]
              }
            ],
            "tips": [
              "Tip 1: A helpful tip to ensure success.",
              "Tip 2: Another tip for better results."
            ],
            "tools": ["tool1", "tool2"] // List of tools needed for the entire project.
          }
        `;

    // Call the model to generate course content
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Log the full response for debugging
    console.log("Full API Response:", response);

    // Check if the response has candidates and valid content
    if (
      !response ||
      !response.response ||
      !response.response.candidates ||
      response.response.candidates.length === 0
    ) {
      throw new Error("No candidates found in the response from the AI model");
    }

    // Extract the first candidate and its content
    const candidate = response.response.candidates[0];
    const content = candidate?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No valid content found in the AI model response");
    }

    // Remove any unwanted formatting like Markdown backticks or extra spaces
    const cleanedResponse = content.replace(/```json|```/g, "").trim();

    // Try to parse the cleaned response
    let courseData;
    try {
      courseData = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error parsing the course data:", error);
      return res
        .status(500)
        .json({ error: "Failed to parse AI-generated course data" });
    }

    // Ensure the required properties exist in the parsed courseData
    if (!courseData.title || !courseData.description || !courseData.steps) {
      return res
        .status(400)
        .json({ error: "Invalid course structure received from AI" });
    }

    // Create and save the new course
    const newCourse = new Course({
      title: courseData.title,
      description: courseData.description,
      materials,
      preferences,
      steps: courseData.steps.map((step) => ({
        step_number: step.step_number,
        description: step.description,
        tools_needed: step.tools_needed || [],
      })),
      tips: courseData.tips || [],
      tools: courseData.tools || [], // Ensure tools are defined
      imageUrl,
      creatorId,
      creatorName,
    });

    await newCourse.save();

    // Return the created course details in the response
    res
      .status(201)
      .json({ message: "DIY Course created successfully", course: newCourse });
  } catch (error) {
    console.error("Error generating or saving course:", error);
    res
      .status(500)
      .json({ error: error.message || "An unexpected error occurred" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching all courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// ✅ Fetch courses by creator
router.get("/creator/:creatorId", async (req, res) => {
  const { creatorId } = req.params;

  try {
    const courses = await Course.find({ creatorId });
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching creator courses:", error);
    res.status(500).json({ message: "Failed to fetch creator courses" });
  }
});
// ✅ Single route for preferences + Gemini filtering
router.post("/recommend", async (req, res) => {
  const { preferences, materials } = req.body;

  if (!preferences || !materials) {
    return res
      .status(400)
      .json({ message: "Preferences and materials required" });
  }

  try {
    // ✅ Step 1: Fetch courses by preferences
    const courses = await Course.find({
      preferences: { $in: preferences },
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: "No matching courses found" });
    }

    // ✅ Step 2: Prepare Gemini prompt
    const prompt = `
      Filter the following courses based on the given materials. Only include courses that involve all or most of the materials.
  
      - **Courses:**
      ${courses
        .map(
          (course) => `
        - Title: ${course.title}
        - Description: ${course.description}
        - Materials: ${course.materials.join(", ")}
        `
        )
        .join("\n")}
  
      - **Materials to match:** ${materials.join(", ")}
  
      Please return the filtered courses in this JSON format:
      [
        {
          "title": "Course Title",
          "description": "Brief course description",
          "steps": [
            {
              "step_number": 1,
              "description": "Step description",
              "tools_needed": ["Tool1", "Tool2"]
            }
          ],
          "tips": ["Tip1", "Tip2"],
          "tools": ["Tool1", "Tool2"],
          "imageUrl": "https://course-image.com",
          "difficulty": "Beginner / Intermediate / Advanced"
        }
      ]
      `;

    // ✅ Step 3: Call Gemini model (same as your `create` route)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    console.log("Full Gemini Response:", response);

    if (
      !response ||
      !response.response ||
      !response.response.candidates ||
      response.response.candidates.length === 0
    ) {
      throw new Error("No candidates found in the response from the AI model");
    }

    // ✅ Extract and clean the response
    const candidate = response.response.candidates[0];
    const content = candidate?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No valid content found in the AI model response");
    }

    const cleanedResponse = content.replace(/```json|```/g, "").trim();

    // ✅ Parse the Gemini response
    let filteredCourses;
    try {
      filteredCourses = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return res
        .status(500)
        .json({ message: "Failed to parse Gemini response" });
    }

    // ✅ Return the final filtered courses
    res.json({ filteredCourses });
  } catch (error) {
    console.error("Error in recommendation:", error.message);
    res.status(500).json({ message: "Error filtering courses" });
  }
});
export default router;
