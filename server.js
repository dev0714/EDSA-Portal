import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Environment variables
const SENDGRID_EMAIL_KEY = process.env.SENDGRID_EMAIL_KEY;       // transactional / bulk email key
const SENDGRID_VALIDATE_KEY = process.env.SENDGRID_VALIDATE_KEY; // email validation key
const PROXY_SECRET = process.env.PROXY_SECRET || "";             // optional secret header

if (!SENDGRID_EMAIL_KEY) {
  console.error("Missing SENDGRID_EMAIL_KEY in environment variables!");
  process.exit(1);
}
if (!SENDGRID_VALIDATE_KEY) {
  console.error("Missing SENDGRID_VALIDATE_KEY in environment variables!");
  process.exit(1);
}

// Middleware for optional security
app.use((req, res, next) => {
  if (PROXY_SECRET) {
    const key = req.headers["x-proxy-key"];
    if (!key || key !== PROXY_SECRET) {
      return res.status(403).json({ error: "Forbidden: invalid proxy key" });
    }
  }
  next();
});

// Health check
app.get("/", (req, res) => res.send("SendGrid Proxy Running ✅"));

// --- Single Email Send ---
app.post("/send", async (req, res) => {
  try {
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_EMAIL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

// --- Bulk Email Send ---
app.post("/bulk", async (req, res) => {
  try {
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_EMAIL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

// --- Email Validation ---
app.post("/validate", async (req, res) => {
  try {
    const resp = await fetch("https://api.sendgrid.com/v3/validations/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_VALIDATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SendGrid Proxy running on port ${PORT}`));
