import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeImageWithGemini = async (imageBase64) => {
  console.log("🔥 Sending image to Gemini...");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ✅ Strict prompt to force only a JSON array response
    const prompt = `
      Identify and list all visible materials in this image.
      - **Return ONLY a plain JSON array** with no formatting, Markdown, or extra characters.
      - Example output: ["metal", "plastic", "wood"]
    `;

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          ],
        },
      ],
    });

    console.log("🚀 Gemini Response:", JSON.stringify(response, null, 2));

    const candidates = response?.response?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from AI model");
    }

    const contentParts = candidates[0]?.content?.parts;
    if (!contentParts || contentParts.length === 0) {
      throw new Error("AI response has no content parts");
    }

    let rawMaterials = contentParts[0]?.text?.trim() || "[]";

    // ✅ Remove any Markdown or formatting
    rawMaterials = rawMaterials.replace(/```json|```/g, "").trim();

    let materials = [];
    try {
      materials = JSON.parse(rawMaterials);
    } catch (error) {
      console.error("❌ Failed to parse JSON:", error.message);
      throw new Error("Failed to parse materials array");
    }

    console.log(`✅ Extracted Materials:`, materials);
    return materials;
  } catch (error) {
    console.error("❌ Error with Gemini API:", error.message);
    throw error;
  }
};
