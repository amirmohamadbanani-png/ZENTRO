require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(cors({ origin: ["https://localhost", "capacitor://localhost", "https://zentro-usle.onrender.com"], methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(PUBLIC_DIR));

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    service: "ZENTRO API",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    aiProvider: "Google Gemini",
    model: GEMINI_MODEL
  });
});

app.post("/api/ai", async (req, res) => {
  const { task, text, language } = req.body || {};
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "AI is not configured yet. The site owner must add GEMINI_API_KEY to the hosting environment."
    });
  }
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Please enter some text first." });
  }

  const prompts = {
    prompt: "Improve this idea and turn it into a clear, detailed AI prompt.",
    caption: "Write 5 engaging social media captions for this content.",
    summarize: "Summarize this text clearly. Keep the important points.",
    translate: `Translate the following text into ${String(language || "English").slice(0, 60)}. Return only the translation.`,
    rewrite: "Rewrite this text to be clearer, more natural, and well organized."
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are ZENTRO, a helpful writing assistant. ${prompts[task] || prompts.rewrite}` }]
          },
          contents: [{ role: "user", parts: [{ text: text.slice(0, 20000) }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || "Gemini request failed. Check the server API key and free-tier quota.";
      return res.status(502).json({ error: message });
    }

    const result = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("")
      .trim();

    if (!result) {
      return res.status(502).json({ error: "The AI provider returned an empty response. Please try again." });
    }
    return res.json({ result });
  } catch (_error) {
    return res.status(502).json({ error: "Could not connect to the AI provider. Check the server configuration." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

app.listen(PORT, () => console.log("ZENTRO running on port " + PORT));
