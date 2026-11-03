const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const TOKEN = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
const FLOW_ID = process.env.WHATSAPP_FLOW_ID || "1126482169890474";

const STATE_DISTRICTS = require("../data/indiaLocations.json");
const INDIAN_STATES = Object.keys(STATE_DISTRICTS).sort((a, b) => a.localeCompare(b));

const sampleDistricts = (STATE_DISTRICTS["Tamil Nadu"] || []).slice(0, 50).map((d) => ({
  id: d,
  title: d,
}));

// Build the updated Maha Seva Dal Flow JSON (Version 6.0)
const msdFlowJson = {
  version: "6.0",
  data_api_version: "3.0",
  routing_model: {
    CADRE_PROFILE: ["CADRE_STATE"],
    CADRE_STATE: ["CADRE_LOCATION"],
    CADRE_LOCATION: ["CADRE_PLEDGE"],
    CADRE_PLEDGE: [],
  },
  screens: [
    {
      id: "CADRE_PROFILE",
      title: "Maha Seva Dal",
      terminal: false,
      data: {
        full_name: { type: "string", __example__: "Jaysurya S" },
        districts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
            },
          },
          __example__: sampleDistricts,
        },
      },
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "National Cadre Enrollment",
          },
          {
            type: "TextSubheading",
            text: "Estd. 1947 · Unity of People",
          },
          {
            type: "TextBody",
            text: "Step 1 of 4: Personal & Volunteer Profile",
          },
          {
            type: "Form",
            name: "profile_form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "Full Name",
                required: true,
                "input-type": "text",
                "helper-text": "Official name as per Aadhaar / Voter ID",
              },
              {
                type: "TextInput",
                name: "father_or_husband_name",
                label: "Father / Husband Name",
                required: true,
                "input-type": "text",
                "helper-text": "Parent or spouse full name",
              },
              {
                type: "TextInput",
                name: "dob",
                label: "Date of Birth (DD/MM/YYYY)",
                required: true,
                "input-type": "text",
                "helper-text": "e.g. 15/08/1995",
              },
              {
                type: "Dropdown",
                name: "gender",
                label: "Gender",
                required: true,
                "data-source": [
                  { id: "Male", title: "Male" },
                  { id: "Female", title: "Female" },
                  { id: "Other", title: "Other" },
                ],
              },
              {
                type: "Dropdown",
                name: "blood_group",
                label: "Blood Group",
                required: true,
                "data-source": [
                  { id: "A+", title: "A+" },
                  { id: "A-", title: "A-" },
                  { id: "B+", title: "B+" },
                  { id: "B-", title: "B-" },
                  { id: "O+", title: "O+" },
                  { id: "O-", title: "O-" },
                  { id: "AB+", title: "AB+" },
                  { id: "AB-", title: "AB-" },
                ],
              },
              {
                type: "Footer",
                label: "Next: Select State Unit",
                "on-click-action": {
                  name: "navigate",
                  next: {
                    type: "screen",
                    name: "CADRE_STATE",
                  },
                  payload: {
                    full_name: "${form.full_name}",
                    father_or_husband_name: "${form.father_or_husband_name}",
                    dob: "${form.dob}",
                    gender: "${form.gender}",
                    blood_group: "${form.blood_group}",
                    districts: "${data.districts}",
                  },
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: "CADRE_STATE",
      title: "Select State Unit",
      terminal: false,
      data: {
        full_name: { type: "string", __example__: "Jaysurya S" },
        father_or_husband_name: { type: "string", __example__: "Rajakanth" },
        dob: { type: "string", __example__: "15/08/1995" },
        gender: { type: "string", __example__: "Male" },
        blood_group: { type: "string", __example__: "B+" },
        districts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
            },
          },
          __example__: sampleDistricts,
        },
      },
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "State Unit Selection",
          },
          {
            type: "TextSubheading",
            text: "Step 2 of 4: Choose your State or Union Territory",
          },
          {
            type: "TextBody",
            text: "Selecting your state will automatically load all official districts in the next step.",
          },
          {
            type: "Form",
            name: "state_form",
            children: [
              {
                type: "Dropdown",
                name: "state",
                label: "State / Union Territory",
                required: true,
                "data-source": INDIAN_STATES.map((s) => ({ id: s, title: s })),
              },
              {
                type: "Footer",
                label: "Next: Choose District & Wing",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    screen: "CADRE_STATE",
                    state: "${form.state}",
                    full_name: "${data.full_name}",
                    father_or_husband_name: "${data.father_or_husband_name}",
                    dob: "${data.dob}",
                    gender: "${data.gender}",
                    blood_group: "${data.blood_group}",
                  },
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: "CADRE_LOCATION",
      title: "District & Seva Wing",
      terminal: false,
      data: {
        full_name: { type: "string", __example__: "Jaysurya S" },
        father_or_husband_name: { type: "string", __example__: "Rajakanth" },
        dob: { type: "string", __example__: "15/08/1995" },
        gender: { type: "string", __example__: "Male" },
        blood_group: { type: "string", __example__: "B+" },
        state: { type: "string", __example__: "Tamil Nadu" },
        districts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
            },
          },
          __example__: sampleDistricts,
        },
      },
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "District Unit & Seva Wing",
          },
          {
            type: "TextSubheading",
            text: "Step 3 of 4: Select District and Field of Service",
          },
          {
            type: "Form",
            name: "location_form",
            children: [
              {
                type: "Dropdown",
                name: "district",
                label: "Choose District Unit",
                required: true,
                "data-source": "${data.districts}",
              },
              {
                type: "TextInput",
                name: "emergency_contact",
                label: "Emergency / Secondary Contact",
                required: true,
                "input-type": "phone",
                "min-chars": 10,
                "max-chars": 10,
                "helper-text": "Must be exactly 10 digits",
              },
              {
                type: "Dropdown",
                name: "assigned_wing",
                label: "Assigned Seva Wing",
                required: true,
                "data-source": [
                  { id: "Seva Dal Volunteer Cadre", title: "Seva Dal Volunteer Cadre" },
                  { id: "Youth Wing", title: "Youth Wing (Yuva Dal)" },
                  { id: "Women Wing", title: "Women Wing (Mahila Dal)" },
                  { id: "Healthcare & Medical Seva", title: "Healthcare & Medical Seva" },
                  { id: "Education & Child Welfare", title: "Education & Child Welfare" },
                  { id: "Cultural & Heritage Wing", title: "Cultural & Heritage Wing" },
                  { id: "Legal & Civic Rights Cell", title: "Legal & Civic Rights Cell" },
                ],
              },
              {
                type: "TextInput",
                name: "address",
                label: "Residential Address",
                required: true,
                "input-type": "text",
                "helper-text": "Street, Door No, Area",
              },
              {
                type: "TextInput",
                name: "pincode",
                label: "Postal PIN Code",
                required: true,
                "input-type": "text",
                "min-chars": 6,
                "max-chars": 6,
                "helper-text": "6-digit postal code (e.g. 600001)",
              },
              {
                type: "Footer",
                label: "Next: Photo & Oath",
                "on-click-action": {
                  name: "navigate",
                  next: {
                    type: "screen",
                    name: "CADRE_PLEDGE",
                  },
                  payload: {
                    full_name: "${data.full_name}",
                    father_or_husband_name: "${data.father_or_husband_name}",
                    dob: "${data.dob}",
                    gender: "${data.gender}",
                    blood_group: "${data.blood_group}",
                    state: "${data.state}",
                    district: "${form.district}",
                    emergency_contact: "${form.emergency_contact}",
                    assigned_wing: "${form.assigned_wing}",
                    address: "${form.address}",
                    pincode: "${form.pincode}",
                  },
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: "CADRE_PLEDGE",
      title: "Cadre Oath of Service",
      terminal: true,
      data: {
        full_name: { type: "string", __example__: "Jaysurya S" },
        father_or_husband_name: { type: "string", __example__: "Rajakanth" },
        dob: { type: "string", __example__: "15/08/1995" },
        gender: { type: "string", __example__: "Male" },
        blood_group: { type: "string", __example__: "B+" },
        state: { type: "string", __example__: "Tamil Nadu" },
        district: { type: "string", __example__: "Chennai" },
        emergency_contact: { type: "string", __example__: "9888888888" },
        assigned_wing: { type: "string", __example__: "Education & Child Welfare" },
        address: { type: "string", __example__: "56 Street, Chennai" },
        pincode: { type: "string", __example__: "600001" },
      },
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "Cadre Photo & Oath of Service",
          },
          {
            type: "TextSubheading",
            text: "Step 4 of 4: Passport Photo & 1947 Pledge",
          },
          {
            type: "TextBody",
            text: "Attach your passport-style headshot for your official Digital Cadre ID Card, and solemnly affirm your commitment to national integration and community seva.",
          },
          {
            type: "Form",
            name: "pledge_form",
            children: [
              {
                type: "PhotoPicker",
                name: "photo",
                label: "Passport Size Photo",
                description: "Take a selfie or choose from gallery",
                "photo-source": "camera_gallery",
                "min-uploaded-photos": 1,
                "max-uploaded-photos": 1,
                "max-file-size-kb": 5120,
              },
              {
                type: "CheckboxGroup",
                name: "oath_accepted",
                label: "Confirmation",
                required: true,
                "data-source": [
                  {
                    id: "agree",
                    title: "I accept the Cadre Code of Conduct & Pledge",
                  },
                ],
              },
              {
                type: "Footer",
                label: "Complete Enrollment",
                "on-click-action": {
                  name: "complete",
                  payload: {
                    full_name: "${data.full_name}",
                    father_or_husband_name: "${data.father_or_husband_name}",
                    dob: "${data.dob}",
                    gender: "${data.gender}",
                    blood_group: "${data.blood_group}",
                    state: "${data.state}",
                    district: "${data.district}",
                    emergency_contact: "${data.emergency_contact}",
                    assigned_wing: "${data.assigned_wing}",
                    address: "${data.address}",
                    pincode: "${data.pincode}",
                    photo: "${form.photo}",
                    oath_accepted: "${form.oath_accepted}",
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

function uploadFlowAsset(flowId, jsonContent) {
  return new Promise((resolve, reject) => {
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    const crlf = "\r\n";

    let postData = [];
    postData.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="name"${crlf}${crlf}flow.json${crlf}`));
    postData.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="asset_type"${crlf}${crlf}FLOW_JSON${crlf}`));
    postData.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="file"; filename="flow.json"${crlf}Content-Type: application/json${crlf}${crlf}`));
    postData.push(Buffer.from(jsonContent));
    postData.push(Buffer.from(`${crlf}--${boundary}--${crlf}`));

    const payloadBuffer = Buffer.concat(postData);

    const options = {
      hostname: "graph.facebook.com",
      path: `/v21.0/${flowId}/assets`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": payloadBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);
    req.write(payloadBuffer);
    req.end();
  });
}

function publishFlow(flowId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "graph.facebook.com",
      path: `/v21.0/${flowId}/publish`,
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
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

(async () => {
  try {
    console.log(`1. Updating Flow JSON for Flow ID: ${FLOW_ID}...`);
    const flowJsonStr = JSON.stringify(msdFlowJson, null, 2);

    // Save local copy
    fs.writeFileSync(path.resolve(__dirname, "../../wacto/msd_whatsapp_flow.json"), flowJsonStr);

    const uploadRes = await uploadFlowAsset(FLOW_ID, flowJsonStr);
    console.log("Upload result:", uploadRes);

    if (uploadRes.data?.validation_errors?.length > 0) {
      console.error("❌ Validation Errors:", uploadRes.data.validation_errors);
      process.exit(1);
    }

    console.log("2. Publishing updated Flow...");
    const pubRes = await publishFlow(FLOW_ID);
    console.log("Publish result:", pubRes);

    console.log("\x1b[32m[PASS ✅] Flow 1126482169890474 updated and published successfully!\x1b[0m");
  } catch (err) {
    console.error("Error during flow update:", err);
  }
})();
