module.exports = async function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
if (req.method === "OPTIONS") return res.status(200).end();
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const query = async (filter) => {
const r = await fetch(`${SUPABASE_URL}/rest/v1/users?${filter}&limit=1`, {
headers: {
"apikey": SUPABASE_KEY,
"Authorization": `Bearer ${SUPABASE_KEY}`,
"Content-Type": "application/json"
}
});
return r.json();
};

const { action, email, password, userId } = req.body;

if (action === "login") {
if (!email || !password) return res.status(400).json({ error: "Email and password required" });
const data = await query(`email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=*`);
if (!data || !data[0]) return res.status(401).json({ error: "Invalid email or password" });
const user = data[0];
if (user.password !== password) return res.status(401).json({ error: "Invalid email or password" });
if (!user.active) return res.status(403).json({ error: "Your account has been deactivated. Please contact francisco@streamflux.app" });
const now = new Date();
const trialEnd = new Date(user.trial_ends_at);
const trialActive = now < trialEnd;
if (!trialActive && !user.subscribed) return res.status(403).json({ error: "Your free trial has ended. Please subscribe at streamflux.app", trialExpired: true });
const daysLeft = trialActive ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : 0;
return res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, trialActive, daysLeft, subscribed: user.subscribed } });
}

if (action === "check") {
if (!userId) return res.status(400).json({ error: "No user ID" });
const data = await query(`id=eq.${userId}&select=*`);
if (!data || !data[0]) return res.status(401).json({ error: "Session expired. Please log in again." });
const user = data[0];
if (!user.active) return res.status(403).json({ error: "Account deactivated." });
const now = new Date();
const trialEnd = new Date(user.trial_ends_at);
const trialActive = now < trialEnd;
if (!trialActive && !user.subscribed) return res.status(403).json({ error: "Trial expired.", trialExpired: true });
const daysLeft = trialActive ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : 0;
return res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, trialActive, daysLeft, subscribed: user.subscribed } });
}

return res.status(400).json({ error: "Invalid action" });
};

