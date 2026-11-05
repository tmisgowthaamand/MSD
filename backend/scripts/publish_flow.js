const https = require("https");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const TOKEN = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
const FLOW_ID = process.env.WHATSAPP_FLOW_ID;

const options = {
  hostname: "graph.facebook.com",
  path: `/v21.0/${FLOW_ID}/publish`,
  method: "POST",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (c) => (data += c));
  res.on("end", () => {
    console.log("STATUS:", res.statusCode);
    console.log("RESPONSE:", data);
  });
});

req.on("error", (e) => console.error(e));
req.end();

