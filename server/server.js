const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const PORT = process.env.PORT || 3000;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.use(cors({
  origin: ALLOWED_ORIGIN === "*" ? true : ALLOWED_ORIGIN,
  methods: ["GET", "POST"]
}));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Eitan orders server is running"
  });
});

app.get("/products", async (req, res) => {
  try {
    if (!APPS_SCRIPT_URL) {
      throw new Error("Missing APPS_SCRIPT_URL");
    }

    const response = await fetch(APPS_SCRIPT_URL);
    const data = await response.json();

    res.json(data);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post("/order", async (req, res) => {
  try {
    if (!APPS_SCRIPT_URL) {
      throw new Error("Missing APPS_SCRIPT_URL");
    }

    const orderData = req.body;

    if (!orderData || !orderData.customer || !Array.isArray(orderData.items)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order data"
      });
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(orderData)
    });

    const text = await response.text();

    res.json({
      success: true,
      forwarded: true,
      appsScriptResponse: text
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
