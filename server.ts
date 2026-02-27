import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  app.post("/api/gemini", async (req, res) => {
    const { prompt, tool } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }

    try {
      // System instructions based on the tool
      const systemInstructions = {
        "CV Optimizer": "You are a professional career coach. Optimize the following CV content for impact, clarity, and ATS compatibility.",
        "Cover Letter Generator": "You are a professional writer. Generate a compelling cover letter based on the provided job description and user background.",
        "Essay Improver": "You are an academic editor. Improve the following essay for grammar, flow, and academic tone while preserving the original meaning.",
        "Research Topic Generator": "Generate 5 innovative and feasible research topics based on the provided field of study.",
        "GPA Calculator": "Calculate GPA based on provided grades and provide academic advice for improvement.",
        "CGPA Converter": "Convert CGPA between different scales (e.g., 4.0 to 5.0 or percentage) and explain the conversion logic.",
        "Grade Calculator": "Predict O Level / A Level grades based on provided marks and historical thresholds.",
        "SPSS Guide": "Provide a step-by-step guide on how to perform the requested statistical analysis in SPSS.",
        "AI Essay Scoring": "Score the following essay out of 100 based on coherence, argument strength, and grammar. Provide constructive feedback.",
        "AI Research Proposal Helper": "Help structure and refine the following research proposal idea into a formal academic format.",
        "Resume Builder": "Format the provided professional details into a clean, structured resume layout (Markdown).",
        "AI Code Helper": "You are a senior software engineer. Help debug, explain, or write code based on the user's request.",
        "AI Question Generator": "Generate 5 challenging study questions (with answers) based on the provided text.",
        "AI Flashcard Maker": "Create a set of 5 front/back flashcards based on the provided study material.",
        "AI Citation Formatter": "Format the provided source into the requested citation style (APA, MLA, Chicago, etc.).",
        "AI Summary Tool": "Provide a concise summary of the following text, highlighting key points.",
        "AI Study Planner": "Create a detailed 7-day study schedule based on the user's subjects and exam date.",
        "AI Thesis Topic Generator": "Generate 3 high-level thesis topics for a Master's or PhD level based on the provided interest area.",
        "AI Presentation Slide Gen": "Outline a 10-slide presentation based on the provided topic, including slide titles and key bullet points.",
        "AI Data Analyzer": "Interpret the provided data set and provide key insights and trends."
      };

      const instruction = systemInstructions[tool as keyof typeof systemInstructions] || "You are a helpful academic assistant.";

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: `${instruction}\n\nUser Input: ${prompt}` }] }],
      });

      res.json({ response: result.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
