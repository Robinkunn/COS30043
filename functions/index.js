const functions = require("firebase-functions");
const axios = require("axios");

exports.proxyAPI = functions.https.onRequest(async (req, res) => {
  try {
    // Forward the request to your InfinityFree API
    const response = await axios({
      method: req.method,
      url: `https://pizzahat.wuaze.com/api_user.php${req.url}`,
      data: req.body,
      params: req.query,
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send({error: "Proxy request failed"});
  }
});
// This blank line at the end is required