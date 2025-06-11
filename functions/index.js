const functions = require("firebase-functions");
const axios = require("axios");

exports.proxyAPI = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for the Firebase Function response
  res.set("Access-Control-Allow-Origin", "https://pizzahat.web.app");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    // Extract the API endpoint from the URL
    const apiPath = req.path.split("/").filter(Boolean)[0] || "api_user.php";
    const apiFile = apiPath.includes(".php") ? apiPath : `${apiPath}.php`;

    const response = await axios({
      method: req.method,
      url: `https://pizzahat.wuaze.com/${apiFile}${req.url}`,
      data: req.body,
      params: req.query,
      headers: {
        "Content-Type": req.get("Content-Type") || "application/json",
      },
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send({
      error: "Proxy request failed",
      details: error.message,
    });
  }
});
