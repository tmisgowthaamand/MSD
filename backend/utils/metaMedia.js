const https = require("https");

/**
 * Downloads media binary buffer from Meta Graph API using media ID or handle
 */
const fetchMetaMediaBuffer = (mediaId) => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  if (!token || !mediaId) return Promise.resolve(null);

  // If mediaId is not a string or empty, bail
  const cleanId = String(mediaId).trim();
  if (!cleanId) return Promise.resolve(null);

  return new Promise((resolve) => {
    // Step 1: Query Meta Graph API for temporary download URL
    const req = https.request(
      {
        hostname: "graph.facebook.com",
        path: `/v21.0/${cleanId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.url) {
              console.warn("[Meta Media] No URL returned for media ID:", cleanId, parsed);
              return resolve(null);
            }

            // Step 2: Download binary stream from parsed.url
            const downloadUrl = new URL(parsed.url);
            const dlReq = https.request(
              {
                hostname: downloadUrl.hostname,
                path: downloadUrl.pathname + downloadUrl.search,
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "User-Agent": "curl/7.64.1",
                },
              },
              (dlRes) => {
                const chunks = [];
                dlRes.on("data", (chunk) => chunks.push(chunk));
                dlRes.on("end", () => {
                  const buf = Buffer.concat(chunks);
                  console.log(`[Meta Media] Successfully downloaded media ${cleanId} (${buf.length} bytes)`);
                  resolve(buf);
                });
              }
            );

            dlReq.on("error", (e) => {
              console.error("[Meta Media] Download error:", e.message);
              resolve(null);
            });
            dlReq.end();
          } catch (e) {
            console.error("[Meta Media] JSON parse error:", e.message);
            resolve(null);
          }
        });
      }
    );

    req.on("error", (e) => {
      console.error("[Meta Media] Lookup request error:", e.message);
      resolve(null);
    });
    req.end();
  });
};

/**
 * Uploads an image buffer to Meta WhatsApp Cloud API Media endpoint
 */
const uploadMetaMedia = (buffer, filename = "card.png", mimeType = "image/png") => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("[Meta Media Upload] Missing token or phoneId");
    return Promise.resolve({ success: false, reason: "CREDENTIALS_MISSING" });
  }

  return new Promise((resolve) => {
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    const crlf = "\r\n";

    const postData = [
      Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="messaging_product"${crlf}${crlf}whatsapp${crlf}`),
      Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="type"${crlf}${crlf}${mimeType}${crlf}`),
      Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="file"; filename="${filename}"${crlf}Content-Type: ${mimeType}${crlf}${crlf}`),
      buffer,
      Buffer.from(`${crlf}--${boundary}--${crlf}`),
    ];

    const payloadBuffer = Buffer.concat(postData);

    const options = {
      hostname: "graph.facebook.com",
      path: `/v21.0/${phoneId}/media`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": payloadBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300 && parsed.id) {
            resolve({ success: true, mediaId: parsed.id });
          } else {
            console.error("[Meta Media Upload Error]:", res.statusCode, parsed);
            resolve({ success: false, error: parsed, statusCode: res.statusCode });
          }
        } catch (e) {
          resolve({ success: false, raw: data, statusCode: res.statusCode });
        }
      });
    });

    req.on("error", (err) => {
      console.error("[Meta Media Upload Network Error]:", err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(payloadBuffer);
    req.end();
  });
};

/**
 * Sends a native WhatsApp Image message to a recipient
 */
const sendMetaImageMessage = (toPhone, mediaId, caption = "") => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return Promise.resolve({ success: false, reason: "CREDENTIALS_MISSING" });
  }

  let cleanPhone = String(toPhone).replace(/\D/g, "");
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "image",
    image: {
      id: mediaId,
      ...(caption ? { caption } : {}),
    },
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "graph.facebook.com",
      path: `/v21.0/${phoneId}/messages`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
          if (isSuccess) {
            console.log(`\x1b[32m[PASS ✅] Image message dispatched to +${cleanPhone}\x1b[0m`);
          } else {
            console.error(`\x1b[31m[FAIL ❌] Image Dispatch Error (${res.statusCode}):\x1b[0m`, parsed);
          }
          resolve({ success: isSuccess, response: parsed });
        } catch (e) {
          resolve({ success: false, error: data });
        }
      });
    });

    req.on("error", (e) => {
      console.error("[Image Dispatch Network Error]:", e.message);
      resolve({ success: false, error: e.message });
    });

    req.write(payload);
    req.end();
  });
};

module.exports = {
  fetchMetaMediaBuffer,
  uploadMetaMedia,
  sendMetaImageMessage,
};

