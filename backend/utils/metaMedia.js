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

/**
 * Sends a plain text message via Meta WhatsApp Cloud API
 */
const sendMetaWhatsAppMessage = (toPhone, messageText) => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("[Meta WhatsApp Message] Missing token or phoneId");
    return Promise.resolve({ success: false, reason: "CREDENTIALS_MISSING" });
  }

  let cleanPhone = String(toPhone).replace(/\D/g, "");
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: { preview_url: false, body: messageText },
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
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, response: parsed });
        } catch (e) {
          resolve({ success: false, error: data });
        }
      });
    });

    req.on("error", (e) => resolve({ success: false, error: e.message }));
    req.write(payload);
    req.end();
  });
};

/**
 * Download (and decrypt) a photo/document uploaded inside a WhatsApp Flow.
 *
 * Flow PhotoPicker media is NOT a regular Graph API media ID — it is delivered as an
 * encrypted file on a time-limited CDN URL (~15 min) plus `encryption_metadata`
 * (encryption_key, hmac_key, iv, encrypted_hash, plaintext_hash, all base64).
 * We download the ciphertext, strip the trailing 10-byte HMAC, and AES-256-CBC
 * decrypt it with the provided key + iv. Falls back to a plain download, or to the
 * Graph media API if the item is just a media id.
 *
 * @param {object|string} item one element of responseJson.<photo field>
 * @returns {Promise<Buffer|null>} the decrypted image bytes, or null
 */
const crypto = require("crypto");
const downloadFlowMediaBuffer = async (item) => {
  try {
    if (!item) return null;
    // Plain media id (string) -> Graph API
    if (typeof item === "string") return await fetchMetaMediaBuffer(item.trim());
    if (typeof item !== "object") return null;

    const meta = item.encryption_metadata || item.encryptionMetadata;
    const cdnUrl = item.cdn_url || item.url || item.cdnUrl;

    // Encrypted flow media (the normal case for PhotoPicker)
    if (cdnUrl && meta && meta.encryption_key && meta.iv) {
      const res = await fetch(cdnUrl, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        console.warn("[Flow Media] CDN download failed:", res.status);
        return null;
      }
      const encrypted = Buffer.from(await res.arrayBuffer());
      const encKey = Buffer.from(meta.encryption_key, "base64");
      const iv = Buffer.from(meta.iv, "base64");
      // Last 10 bytes are the HMAC tag; the rest is AES-CBC ciphertext
      const ciphertext = encrypted.subarray(0, encrypted.length - 10);
      try {
        if (meta.hmac_key) {
          const hmacKey = Buffer.from(meta.hmac_key, "base64");
          const mac = encrypted.subarray(encrypted.length - 10);
          const expected = crypto
            .createHmac("sha256", hmacKey)
            .update(Buffer.concat([iv, ciphertext]))
            .digest()
            .subarray(0, 10);
          if (!expected.equals(mac)) console.warn("[Flow Media] HMAC mismatch (continuing to decrypt)");
        }
      } catch (hErr) {}
      const algo = encKey.length === 16 ? "aes-128-cbc" : "aes-256-cbc";
      const decipher = crypto.createDecipheriv(algo, encKey, iv);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      console.log(`[Flow Media] Decrypted flow image (${decrypted.length} bytes)`);
      return decrypted;
    }

    // Unencrypted CDN URL
    if (cdnUrl && !meta) {
      const res = await fetch(cdnUrl, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    }

    // Plain Graph media id on the object
    const mediaId = item.media_id || item.id || item.file_id;
    if (mediaId) return await fetchMetaMediaBuffer(String(mediaId).trim());

    return null;
  } catch (e) {
    console.warn("[Flow Media] download/decrypt error:", e.message);
    return null;
  }
};

module.exports = {
  fetchMetaMediaBuffer,
  downloadFlowMediaBuffer,
  uploadMetaMedia,
  sendMetaImageMessage,
  sendMetaWhatsAppMessage,
};

