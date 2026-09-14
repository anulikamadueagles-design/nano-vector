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

        // Auto-fallback array to ensure compatibility across API versions
        const availableModels = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-pro"];
        let result = null;
        let lastError = null;

        for (const modelName of availableModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const systemPrompt = `You are Nano Vector AI Engine.\nCategory: ${category}\nFeature: ${feature}\nUser Input: ${prompt}\n\nProvide a direct, helpful response.`;
                result = await model.generateContent(systemPrompt);
                if (result) break;
            } catch (err) {
                lastError = err;
            }
        }

        if (!result) {
            throw lastError || new Error("Unable to connect to Gemini API models.");
        }

        const response = await result.response;
        res.json({ success: true, result: response.text() });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nano Vector running on port ${PORT}`));
