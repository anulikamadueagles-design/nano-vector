const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/nano-vector', async (req, res) => {
    try {
        const { category, feature, prompt } = req.body;

        // Custom Creator System Prompt
        const systemInstruction = `You are Nano Vector AI Engine, an advanced AI system created by David Kamsi Elvis by Vectors Element Tech. 
Your personality is intelligent, sleek, professional, and friendly. 
When asked about your creator, clearly state that you were created by David Kamsi Elvis by Vectors Element Tech.
Category: ${category}
Feature: ${feature}
User Input: ${prompt}`;

        if (feature === "AI Image Generator" || feature === "Drawing Canvas AI") {
            const encodedPrompt = encodeURIComponent(prompt || "Sci-Fi Cyberpunk AI Hologram Face");
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=800&seed=${Math.floor(Math.random()*10000)}`;
            return res.json({ success: true, isImage: true, result: imageUrl });
        }

        // Active Gemini models for 2026
        const activeModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
        let responseText = null;
        let lastError = null;

        for (const modelName of activeModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(systemInstruction);
                const response = await result.response;
                responseText = response.text();
                if (responseText) break;
            } catch (err) {
                lastError = err;
            }
        }

        if (!responseText) {
            throw lastError || new Error("No available Gemini model could process the request.");
        }

        res.json({ success: true, result: responseText });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nano Vector running on port ${PORT}`));
