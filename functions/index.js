const functions = require("firebase-functions");
const axios = require("axios");
const path = require("path");

exports.proxyAPI = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "https://pizzahat.web.app");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    // Extract PHP file and remaining path
    const match = req.url.match(/^\/(api_\w+\.php)(.*)$/);
    if (!match) {
      return res.status(400).send({error: "Invalid API path"});
    }

    const phpFile = match[1];        // e.g. api_user.php
    const remainingPath = match[2];  // e.g. ?id=5 or /123

    const response = await axios({
      method: req.method,
      url: `https://pizzahat.wuaze.com/${phpFile}${remainingPath}`,
      data: req.body,
      params: req.query,
      headers: {
        "Content-Type": req.get("Content-Type") || "application/json",
      },
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send({error: "Proxy request failed"});
  }
});
