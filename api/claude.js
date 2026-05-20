export default async function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
if (req.method === "OPTIONS") return res.status(200).end();
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

const { prompt, system, maxTokens = 1000 } = req.body;
if (!prompt) return res.status(400).json({ error: "No prompt provided" });

try {
const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": process.env.ANTHROPIC_API_KEY,
"anthropic-version": "2023-06-01",
},
body: JSON.stringify({
model: "claude-sonnet-4-6",
max_tokens: maxTokens,
system: system || "You are the world's best real estate copywriter. You ALWAYS respond with ONLY a valid JSON object. No markdown. No backticks. No explanation. Just the raw JSON object.",
messages: [{ role: "user", content: prompt }],
}),
});

const data = await response.json();
if (data.error) return res.status(400).json({ error: data.error.message });
const text = data.content.map(b => b.type === "text" ? b.text : "").join("").trim();
return res.status(200).json({ text });
} catch (err) {
return res.status(500).json({ error: err.message });
}
}

