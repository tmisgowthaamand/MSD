const ngrok = require("@ngrok/ngrok");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

(async function () {
  const port = process.env.PORT || 5000;
  const authtoken = process.env.NGROK_AUTHTOKEN;

  if (!authtoken) {
    console.log("\x1b[33m⚠️ NGROK_AUTHTOKEN is not set in backend/.env.\x1b[0m");
    console.log("👉 Get your free token at: \x1b[36mhttps://dashboard.ngrok.com/get-started/your-authtoken\x1b[0m");
    console.log("Add it to backend/.env as: \x1b[32mNGROK_AUTHTOKEN=your_token_here\x1b[0m\n");
  }

  try {
    const domain = process.env.NGROK_DOMAIN || "outshoot-dispute-storewide.ngrok-free.dev";
    const listener = await ngrok.forward({
      addr: port,
      authtoken: authtoken || undefined,
      authtoken_from_env: true,
      domain: domain,
    });

    const publicUrl = listener.url();
    const verifyToken =
      process.env.WHATSAPP_VERIFY_TOKEN ||
      process.env.META_WEBHOOK_VERIFY_TOKEN ||
      "HOMESERVE_BOT_VERIFY_TOKEN";
    console.log("\x1b[32m====================================================\x1b[0m");
    console.log(`\x1b[32m🚀 Ngrok Tunnel Active!\x1b[0m`);
    console.log(`📡 Public HTTPS URL : \x1b[1m\x1b[36m${publicUrl}\x1b[0m`);
    console.log(`🎯 Forwarding to    : \x1b[33mhttp://localhost:${port}\x1b[0m`);
    console.log(`🔗 Meta Webhook URL : \x1b[1m\x1b[35m${publicUrl}/api/whatsapp/webhook\x1b[0m`);
    console.log(`🔑 Webhook Token    : \x1b[1m\x1b[33m${verifyToken}\x1b[0m`);
    console.log("\x1b[32m====================================================\x1b[0m");
    console.log("Press Ctrl+C to stop the tunnel.");
  } catch (err) {
    console.error("❌ Ngrok Error:", err.message);
    if (err.message.includes("not authenticated") || err.message.includes("ERR_NGROK_4018")) {
      console.log("\n💡 Quick Free Alternative (No signup required):");
      console.log("Run: \x1b[36mnpx.cmd localtunnel --port " + port + "\x1b[0m\n");
    }
  }
})();

