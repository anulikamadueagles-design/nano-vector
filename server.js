const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const CREATOR_INFO = {
    creator: "David Kamsi Elvis",
    organization: "Vector's Element Tech",
    systemName: "Nano Vector AI Engine v2.0",
    hologramMode: "Active Quantum Matrix"
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "DEMO_KEY");

app.get('/api/info', (req, res) => {
    res.json({ success: true, data: CREATOR_INFO, status: "ONLINE", totalFeatures: 140 });
});

app.post('/api/nano-vector', async (req, res) => {
    try {
        const { feature, category, prompt, context } = req.body;
        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                success: true,
                result: `[QUANTUM SIMULATION MODE]\nCreator: ${CREATOR_INFO.creator} (${CREATOR_INFO.organization})\nSystem: ${CREATOR_INFO.systemName}\nTask: [${category} -> ${feature}]\nInput: "${prompt}"\n\nNote: Add GEMINI_API_KEY to Render Environment Variables for live outputs.`,
                creator: CREATOR_INFO
            });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemPrompt = `You are Nano Vector, an advanced AI platform developed by ${CREATOR_INFO.creator} at ${CREATOR_INFO.organization}.\nCategory: ${category}\nFeature: ${feature}\nPrompt: ${prompt}`;
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        res.json({ success: true, result: response.text(), creator: CREATOR_INFO });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Nano Vector AI active on port ${PORT}`));
