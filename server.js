// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Forwards requests to SendGrid
app.post("/send", async (req, res) => {
  try {
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
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

app.get("/", (req, res) => res.send("SendGrid Proxy Running ✅"));

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port", process.env.PORT || 3000)
);
