module.exports = async function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
if (req.method === "OPTIONS") return res.status(200).end();
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

try {
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

if (!SUPABASE_URL) return res.status(500).json({ error: "Missing SUPABASE_URL env variable" });
if (!SUPABASE_KEY) return res.status(500).json({ error: "Missing SUPABASE_SERVICE_KEY env variable" });
if (!ADMIN_KEY) return res.status(500).json({ error: "Missing ADMIN_SECRET_KEY env variable" });

const { adminKey, action } = req.body;
if (!adminKey) return res.status(401).json({ error: "No admin key provided" });
if (adminKey !== ADMIN_KEY) return res.status(401).json({ error: "Wrong admin key" });

const headers = {
"apikey": SUPABASE_KEY,
"Authorization": `Bearer ${SUPABASE_KEY}`,
"Content-Type": "application/json",
"Prefer": "return=representation"
};

if (action === "list_users") {
const r = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,name,email,plan,trial_ends_at,subscribed,active,created_at&order=created_at.desc`, { headers });
const data = await r.json();
if (!r.ok) return res.status(400).json({ error: "Supabase error: " + JSON.stringify(data) });
return res.status(200).json({ success: true, users: data });
}

if (action === "add_user") {
const { name, email, password, plan, trialDays = 7 } = req.body;
if (!name || !email || !password || !plan) return res.status(400).json({ error: "name, email, password, plan required" });
const trialEndsAt = new Date();
trialEndsAt.setDate(trialEndsAt.getDate() + parseInt(trialDays));
const r = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
method: "POST", headers,
body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password, plan, trial_ends_at: trialEndsAt.toISOString(), subscribed: false, active: true, created_at: new Date().toISOString() })
});
const data = await r.json();
if (!r.ok) return res.status(400).json({ error: "Supabase error: " + JSON.stringify(data) });
return res.status(200).json({ success: true, user: Array.isArray(data) ? data[0] : data });
}

if (action === "deactivate_user") {
const { userId } = req.body;
await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, { method: "PATCH", headers, body: JSON.stringify({ active: false }) });
return res.status(200).json({ success: true });
}

if (action === "activate_user") {
const { userId } = req.body;
await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, { method: "PATCH", headers, body: JSON.stringify({ active: true }) });
return res.status(200).json({ success: true });
}

if (action === "subscribe_user") {
const { userId } = req.body;
await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, { method: "PATCH", headers, body: JSON.stringify({ subscribed: true }) });
return res.status(200).json({ success: true });
}

return res.status(400).json({ error: "Invalid action: " + action });

} catch (e) {
return res.status(500).json({ error: "Server exception: " + e.message });
}
};

