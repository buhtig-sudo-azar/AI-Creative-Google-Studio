import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini with the API key
  // Using gemini-3.5-flash as default model
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {},
    },
  });

  // Echo endpoint to test system status in the UI
  app.get("/api/status", (req, res) => {
    res.json({
      status: "online",
      model: "gemini-3.5-flash",
      environment: process.env.NODE_ENV || "development",
      hasApiKey: !!apiKey
    });
  });

  // Endpoint to proxy Gemini generation requests safely
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, temperature } = req.body;

      if (!apiKey) {
        return res.status(500).json({
          error: "API key is not configured. Please add GEMINI_API_KEY in .env.local."
        });
      }

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a helpful and creative AI Assistant.",
          temperature: typeof temperature === "number" ? temperature : 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate text." });
    }
  });

  // Decide whether to use Vite development middleware
  // If dist/index.html doesn't exist, we must use Vite to serve the assets dynamically.
  const distHtmlPath = path.join(process.cwd(), 'dist', 'index.html');
  const useVite = process.env.NODE_ENV !== "production" || !fs.existsSync(distHtmlPath);

  if (useVite) {
    console.log("Starting server with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production static mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
