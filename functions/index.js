const functions = require("firebase-functions");
const axios = require("axios");

exports.proxyAPI = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for the Firebase Function response
  res.set("Access-Control-Allow-Origin", "https://pizzahat.web.app");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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

    // Emulate DELETE/PUT using POST + _method override
    let method = req.method;
    let data = req.body;
    let params = req.query;

    if (req.method === "DELETE" || req.method === "PUT") {
      method = "POST";
      if (
        req.get("Content-Type") &&
        req.get("Content-Type").includes("application/json")
      ) {
        data = {...req.body, _method: req.method};
      } else if (
        req.get("Content-Type") &&
        req.get("Content-Type").includes("application/x-www-form-urlencoded")
      ) {
        const urlSearchParams = new URLSearchParams(req.body);
        urlSearchParams.append("_method", req.method);
        data = urlSearchParams.toString();
      } else {
        params = {...req.query, _method: req.method};
      }
    }

    const apiUrl =
      `https://pizzahat.wuaze.com/${apiFile}` +
      req.url.replace(/^\/[^/]+/, "");

    const response = await axios({
      method,
      url: apiUrl,
      data,
      params,
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
