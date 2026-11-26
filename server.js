require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.static(PUBLIC_DIR));

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    service: "ZENTRO API",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4o-mini"
  });
});

app.post("/api/ai", async (req, res) => {
  const { task, text, language } = req.body || {};
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "AI is not configured yet. Add OPENAI_API_KEY in your hosting environment."
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
    const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are ZENTRO, a helpful writing assistant. ${prompts[task] || prompts.rewrite}` },
          { role: "user", content: text.slice(0, 20000) }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({ error: data.error?.message || "AI provider request failed." });
    }
    return res.json({ result: data.choices?.[0]?.message?.content || "No response returned." });
  } catch (_error) {
    return res.status(502).json({ error: "Could not connect to the AI provider. Check the server configuration." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

app.listen(PORT, () => console.log(`ZENTRO running on port ${PORT}`));
