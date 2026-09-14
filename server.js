const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/nano-vector', async (req, res) => {
    try {
        const { category, feature, prompt } = req.body;

        if (feature === "AI Image Generator") {
            const encodedPrompt = encodeURIComponent(prompt || "Sci-Fi Cyberpunk AI Face Hologram");
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=800&seed=42`;
            return res.json({ success: true, isImage: true, result: imageUrl });
        }

        // Updated model primary key for current Gemini API specifications
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `You are Nano Vector AI Engine.
Category: ${category}
Feature: ${feature}
User Input: ${prompt}

Provide a direct, high-quality, and helpful response.`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        res.json({ success: true, result: response.text() });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nano Vector running on port ${PORT}`));
