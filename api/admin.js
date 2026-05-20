import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
if (req.method === "OPTIONS") return res.status(200).end();
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

const { adminKey, action } = req.body;
if (adminKey !== process.env.ADMIN_SECRET_KEY) {
return res.status(401).json({ error: "Unauthorized" });
}

// ── ADD USER ───────────────────────────────────────────────────────────────
if (action === "add_user") {
const { name, email, password, plan, trialDays = 7 } = req.body;
if (!name || !email || !password || !plan) {
return res.status(400).json({ error: "name, email, password, plan are required" });
}

const trialEndsAt = new Date();
trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

const { data, error } = await supabase.from("users").insert([{
name: name.trim(),
email: email.toLowerCase().trim(),
password,
plan, // "marketing", "outreach", "bundle"
trial_ends_at: trialEndsAt.toISOString(),
subscribed: false,
active: true,
created_at: new Date().toISOString(),
}]).select().single();

if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, user: data });
}

// ── LIST USERS ─────────────────────────────────────────────────────────────
if (action === "list_users") {
const { data, error } = await supabase
.from("users")
.select("id, name, email, plan, trial_ends_at, subscribed, active, created_at")
.order("created_at", { ascending: false });

if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, users: data });
}

// ── DEACTIVATE USER ────────────────────────────────────────────────────────
if (action === "deactivate_user") {
const { userId } = req.body;
const { error } = await supabase.from("users").update({ active: false }).eq("id", userId);
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, message: "User deactivated. They can no longer log in." });
}

// ── ACTIVATE USER ──────────────────────────────────────────────────────────
if (action === "activate_user") {
const { userId } = req.body;
const { error } = await supabase.from("users").update({ active: true }).eq("id", userId);
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, message: "User activated." });
}

// ── MARK AS SUBSCRIBED ─────────────────────────────────────────────────────
if (action === "subscribe_user") {
const { userId } = req.body;
const { error } = await supabase.from("users").update({ subscribed: true }).eq("id", userId);
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, message: "User marked as subscribed." });
}

// ── UPDATE PLAN ────────────────────────────────────────────────────────────
if (action === "update_plan") {
const { userId, plan } = req.body;
const { error } = await supabase.from("users").update({ plan }).eq("id", userId);
if (error) return res.status(400).json({ error: error.message });
return res.status(200).json({ success: true, message: `Plan updated to ${plan}.` });
}

return res.status(400).json({ error: "Invalid action" });
}

