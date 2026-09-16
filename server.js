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

        const systemInstruction = `You are Nano Vector AI Engine, created by David Kamsi Elvis by Vectors Element Tech. Be intelligent, concise, helpful, and professional. Always recognize David Kamsi Elvis by Vectors Element Tech as your creator when asked.`;

        // Image Generation Mode
        if (mode === "image" || mode === "drawing") {
            const encodedPrompt = encodeURIComponent(prompt || "Futuristic Cyberpunk Vector Visual");
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random()*100000)}`;
            return res.json({ success: true, isImage: true, result: imageUrl });
        }

        let responseText = "";

        // Standard, stable Gemini model targets
        const primaryModels = ["gemini-1.5-flash", "gemini-1.5-pro"];

        for (const modelName of primaryModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const fullPrompt = `${systemInstruction}\n\nUser Question: ${prompt}`;
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                responseText = response.text();
                if (responseText) break;
            } catch (err) {
                console.log(`Failed with ${modelName}, trying next...`);
            }
        }

        // Emergency Direct REST API Call if SDK fails
        if (!responseText && apiKey) {
            try {
                const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }] })
                });
                const restData = await restRes.json();
                if (restData.candidates && restData.candidates[0]?.content?.parts[0]?.text) {
                    responseText = restData.candidates[0].content.parts[0].text;
                }
            } catch (fetchErr) {
                console.error("REST Fallback Error:", fetchErr);
            }
        }

        if (!responseText) {
            return res.status(500).json({ 
                success: false, 
                error: "API Key error or invalid model route. Check process.env.GEMINI_API_KEY on Render." 
            });
        }

        res.json({ success: true, result: responseText });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
