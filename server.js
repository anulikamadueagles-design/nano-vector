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

        // Custom System Instruction with Creator Attribution
        const systemInstruction = `You are Vector (Nano Vector AI Engine), a futuristic blue AI security and core intelligence assistant created by David Kamsi Elvis by Vectors Element Tech.
Category: ${category}
Feature: ${feature}
User Input: ${prompt}

Always acknowledge David Kamsi Elvis by Vectors Element Tech if asked about your creator. Provide concise, expert responses.`;

        // Image Generation Handling
        if (feature === "AI Image Generator" || feature === "Drawing Canvas AI") {
            const encodedPrompt = encodeURIComponent(prompt || "Sci-Fi Cyberpunk AI Assistant Hologram");
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=800&seed=${Math.floor(Math.random()*100000)}`;
            return res.json({ success: true, isImage: true, result: imageUrl });
        }

        // Video Generation Handling (Simulated Video Loop / GIF Prompt Matrix)
        if (feature === "AI Video Generator") {
            const encodedPrompt = encodeURIComponent(prompt || "Futuristic AI Vector Security Loop");
            const videoUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=450&nologo=true`;
            return res.json({ success: true, isVideo: true, result: videoUrl });
        }

        // Active Gemini models including gemini-3.1-pro-preview
        const activeModels = ["gemini-3.1-pro-preview", "gemini-2.0-flash", "gemini-1.5-flash"];
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
            throw lastError || new Error("Unable to connect to Gemini API models.");
        }

        res.json({ success: true, result: responseText });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nano Vector running on port ${PORT}`));
