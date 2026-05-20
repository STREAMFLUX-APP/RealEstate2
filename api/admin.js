const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
if (req.method === "OPTIONS") return res.status(200).end();
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

const { adminKey, action } = req.body;
if (adminKey !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: "Unauthorized" });

if (action === "add_user") {
const { name, email, password, plan, trialDays = 7 } = req.body;
if (!name || !email || !password || !plan) return res.status(400).json({ error: "name, email, password, plan required" });
const trialEndsAt = new Date();
trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
const { data, error } = await supabase.from("users").insert([{ name: name.trim(), email: email.toLowerCase().trim(), password, plan, trial_ends_at: trialEndsAt.toISOString(), subscribed: false, active: true, created_at: new Date().toISOString() }]).select().single();
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, user: data });
}

if (action === "list_users") {
const { data, error } = await supabase.from("users").select("id, name, email, plan, trial_ends_at, subscribed, active, created_at").order("created_at", { ascending: false });
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, users: data });
}

if (action === "deactivate_user") {
const { userId } = req.body;
const { error } = await supabase.from("users").update({ active: false }).eq("id", userId);
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true });
}

if (action === "activate_user") {
const { userId } = req.body;
const { error } = await supabase.from("users").update({ active: true }).eq("id", userId);
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true });
}

if (action === "subscribe_user") {
const { userId } = req.body;
const { error } = await supabase.from("users").update({ subscribed: true }).eq("id", userId);
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true });
}

return res.status(400).json({ error: "Invalid action" });
};

