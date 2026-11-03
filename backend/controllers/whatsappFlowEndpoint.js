const crypto = require("crypto");
const path = require("path");
const STATE_DISTRICTS = require("../data/indiaLocations.json");

// Helper to get districts for any state
const getDistrictDataSource = (stateName) => {
  const list = STATE_DISTRICTS[stateName] || STATE_DISTRICTS["Tamil Nadu"] || ["Other District"];
  return list.slice(0, 100).map((d) => ({
    id: d,
    title: d,
  }));
};

// Parse RSA private key from environment
const getPrivateKey = () => {
  const rawKey = (process.env.WHATSAPP_PRIVATE_KEY || "")
    .replace(/\\n/g, "\n")
    .replace(/^"|"$/g, "");
  return crypto.createPrivateKey(rawKey);
};

/**
 * Decrypt request payload from Meta
 */
const decryptRequest = (body) => {
  const { encrypted_flow_data, encrypted_aes_key, initial_vector } = body;
  const privateKey = getPrivateKey();

  // 1. Decrypt AES key with RSA-OAEP (SHA-256)
  const decryptedAesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encrypted_aes_key, "base64")
  );

  // 2. Decrypt flow data with AES-128-GCM
  const flowDataBuffer = Buffer.from(encrypted_flow_data, "base64");
  const tagLength = 16;
  const ciphertext = flowDataBuffer.subarray(0, flowDataBuffer.length - tagLength);
  const authTag = flowDataBuffer.subarray(flowDataBuffer.length - tagLength);

  const decipher = crypto.createDecipheriv(
    "aes-128-gcm",
    decryptedAesKey,
    Buffer.from(initial_vector, "base64")
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return {
    decryptedAesKey,
    initialVector: Buffer.from(initial_vector, "base64"),
    data: JSON.parse(decrypted),
  };
};

/**
 * Encrypt response payload back to Meta
 */
const encryptResponse = (decryptedAesKey, initialVector, responsePayload) => {
  // Flip IV bits as required by WhatsApp Flow spec
  const flippedIv = Buffer.from(initialVector.map((b) => b ^ 0xff));

  const cipher = crypto.createCipheriv("aes-128-gcm", decryptedAesKey, flippedIv);
  let encrypted = cipher.update(JSON.stringify(responsePayload), "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final(), cipher.getAuthTag()]);

  return encrypted.toString("base64");
};

/**
 * Handle incoming Flow Endpoint requests (Health Check & Dynamic District Exchanges)
 */
const handleFlowEndpoint = async (req, res) => {
  try {
    const { encrypted_flow_data, encrypted_aes_key, initial_vector } = req.body || {};

    if (!encrypted_flow_data || !encrypted_aes_key || !initial_vector) {
      console.log("\x1b[36m[Flow Endpoint] Plain ping received\x1b[0m");
      return res.status(200).json({ data: { status: "active" } });
    }

    const { decryptedAesKey, initialVector, data } = decryptRequest(req.body);
    const { action, screen, data: flowData } = data;

    console.log(`\x1b[32m[PASS ✅] Flow Endpoint Action: "${action}" | Screen: "${screen}"\x1b[0m`);

    let responsePayload = {};

    // 1. Meta Health Check Ping
    if (action === "ping") {
      responsePayload = {
        data: {
          status: "active",
        },
      };
    }
    // 2. Initial Flow open
    else if (action === "INIT") {
      responsePayload = {
        screen: "CADRE_PROFILE",
        data: {
          full_name: "",
          districts: getDistrictDataSource("Tamil Nadu"),
        },
      };
    }
    // 3. Dynamic Screen data exchange (Populates Districts dropdown based on State!)
    else if (action === "data_exchange") {
      const selectedState = flowData?.state || "Tamil Nadu";
      const districtList = getDistrictDataSource(selectedState);

      console.log(
        `\x1b[36m[Flow Endpoint] Populating ${districtList.length} districts for State: "${selectedState}"\x1b[0m`
      );

      // Track candidate's progress in Incomplete Leads recovery CRM
      const phoneMatch = String(data.flow_token || "").match(/msd_(\d{10,12})/);
      const extractedPhone = phoneMatch
        ? phoneMatch[1].slice(-10)
        : String(flowData?.emergency_contact || "").replace(/\D/g, "").slice(-10);

      if (extractedPhone && extractedPhone.length === 10) {
        try {
          const IncompleteLead = require("../models/IncompleteLead");
          await IncompleteLead.findOneAndUpdate(
            { mobile: extractedPhone },
            {
              $set: {
                mobile: extractedPhone,
                fullName: flowData?.full_name || "WhatsApp Cadre Applicant",
                channel: "whatsapp",
                lastStepCompleted: "WA_STEP_2_LOCATION",
                lastStepLabel: "WA Step 2: District Unit & Wing Selection",
                partialData: {
                  state: selectedState,
                  district: flowData?.district || "",
                  wing: flowData?.assigned_wing || "",
                  emergencyContact: flowData?.emergency_contact || "",
                  dob: flowData?.dob || "",
                  gender: flowData?.gender || "",
                },
                status: "ABANDONED",
                abandonedAt: new Date(),
              },
              $setOnInsert: { nudgeCount: 0, lastNudgedAt: null },
            },
            { upsert: true }
          );
        } catch (leadErr) {
          console.error("[Flow Endpoint Lead Track Err]:", leadErr.message);
        }
      }

      responsePayload = {
        screen: "CADRE_LOCATION",
        data: {
          ...flowData,
          state: selectedState,
          districts: districtList,
        },
      };
    }
    // 4. Default fallback
    else {
      responsePayload = {
        data: {
          status: "active",
        },
      };
    }

    const encryptedBase64 = encryptResponse(decryptedAesKey, initialVector, responsePayload);
    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(encryptedBase64);
  } catch (err) {
    console.error("\x1b[31m[Flow Endpoint Error]:\x1b[0m", err.message);
    return res.status(500).send(err.message);
  }
};

module.exports = {
  handleFlowEndpoint,
  decryptRequest,
  encryptResponse,
  getDistrictDataSource,
};
