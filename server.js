const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/nano-vector', async (req, res) => {
    try {
        const { mode, prompt } = req.body;

        // System instructions & Creator identity
        const systemInstruction = `You are Nano Vector AI Engine, an advanced conversational assistant developed by David Kamsi Elvis by Vectors Element Tech.
Always acknowledge David Kamsi Elvis by Vectors Element Tech as your creator when asked. Provide direct, highly intelligent, helpful answers.`;

        // Image Generation Engine
        if (mode === "image" || mode === "drawing") {
            const encodedPrompt = encodeURIComponent(prompt || "Sci-Fi Cyberpunk Vector Visual");
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random()*100000)}`;
            return res.json({ success: true, isImage: true, result: imageUrl });
        }

        // Auto-fallback model strategy to prevent 404/deprecation errors
        const fallbackModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
        let responseText = null;
        let lastError = null;

        for (const modelName of fallbackModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const fullPrompt = `${systemInstruction}\n\nUser: ${prompt}`;
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                responseText = response.text();
                if (responseText) break;
            } catch (err) {
                lastError = err;
            }
        }

        if (!responseText) {
            // Direct REST API fallback if SDK fails
            try {
                const fetchRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }] })
                });
                const restData = await fetchRes.json();
                if (restData.candidates && restData.candidates[0].content.parts[0].text) {
                    responseText = restData.candidates[0].content.parts[0].text;
                }
            } catch (restErr) {
                console.error("REST Fallback Error:", restErr);
            }
        }

        if (!responseText) {
            throw lastError || new Error("Unable to connect to active Gemini models.");
        }

        res.json({ success: true, result: responseText });
    } catch (error) {
        console.error("Nano Vector Server Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nano Vector engine active on port ${PORT}`));
