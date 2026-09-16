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

// Helper function for Free DuckDuckGo Web Search
async function searchDuckDuckGo(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const html = await res.text();
        const results = [];
        const regex = /<a class="result__snippet[^>]*>(.*?)<\/a>/g;
        let match;
        while ((match = regex.exec(html)) !== null && results.length < 4) {
            const cleanSnippet = match[1].replace(/<[^>]+>/g, '').trim();
            if (cleanSnippet) results.push(cleanSnippet);
        }
        return results.join("\n- ") || "No direct search snippets found.";
    } catch (err) {
        console.error("DuckDuckGo Error:", err);
        return "Search attempt failed.";
    }
}

app.post('/api/nano-vector', async (req, res) => {
    try {
        const { mode, prompt } = req.body;

        const creatorContext = `You are Nano Vector AI Engine, created by David Kamsi Elvis by Vector's Element Tech. Always acknowledge David Kamsi Elvis by Vector's Element Tech as your creator when asked.`;

        // 1. FREE IMAGE GENERATION
        if (mode === "image" || mode === "drawing") {
            const encodedPrompt = encodeURIComponent(prompt || "Futuristic Cyberpunk Vector Visual");
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random()*100000)}`;
            return res.json({ success: true, isImage: true, result: imageUrl });
        }

        // 2. FREE VIDEO GENERATION
        if (mode === "video") {
            const encodedPrompt = encodeURIComponent(prompt || "Futuristic Sci-Fi Cyber Hologram Motion Loop");
            const videoUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=450&model=flux&seed=${Math.floor(Math.random()*100000)}`;
            return res.json({ success: true, isVideo: true, result: videoUrl });
        }

        let searchContext = "";
        
        // 3. FREE LIVE WEB SEARCH
        if (mode === "search" || prompt.toLowerCase().includes("search") || prompt.toLowerCase().includes("latest") || prompt.toLowerCase().includes("news")) {
            const searchResults = await searchDuckDuckGo(prompt);
            searchContext = `\n\n[LIVE WEB SEARCH RESULTS FROM DUCKDUCKGO]:\n- ${searchResults}\n\nUse the search results above to answer the user query accurately with citations.`;
        }

        let responseText = "";
        const activeModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];

        for (const modelName of activeModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const fullPrompt = `${creatorContext}${searchContext}\n\nUser Question: ${prompt}`;
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                responseText = response.text();
                if (responseText) break;
            } catch (err) {
                console.log(`Failed model ${modelName}, trying next...`);
            }
        }

        if (!responseText && apiKey) {
            // Emergency REST API Fallback
            try {
                const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `${creatorContext}${searchContext}\n\n${prompt}` }] }] })
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
            return res.status(500).json({ success: false, error: "API connection error. Ensure GEMINI_API_KEY is active on Render." });
        }

        res.json({ success: true, result: responseText });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nano Vector engine active on port ${PORT}`));
