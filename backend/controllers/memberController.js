const mongoose = require("mongoose");
const Member = require("../models/Member");
const IncompleteLead = require("../models/IncompleteLead");
const WhatsAppConversation = require("../models/WhatsAppConversation");
const CardSetting = require("../models/CardSetting");
const { generateCadreIdCards } = require("../utils/idCardGenerator");
const { uploadMetaMedia, sendMetaImageMessage, sendMetaWhatsAppMessage } = require("../utils/metaMedia");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Constant-time string comparison to prevent timing attacks
const safeCompare = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};

// Escape special regex characters to prevent ReDoS and regex injection
const escapeRegex = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Data is persisted directly to DigitalOcean MongoDB (zero local file persistence)
const syncToLocalBackupFile = async () => {};

// State Code Mapping Helper (All 28 States & 8 Union Territories)
const getStateCode = (stateName) => {
  if (!stateName) return "IN";
  const map = {
    "Andaman and Nicobar Islands": "AN",
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    Assam: "AS",
    Bihar: "BR",
    Chandigarh: "CH",
    Chhattisgarh: "CG",
    "Dadra and Nagar Haveli and Daman and Diu": "DD",
    Delhi: "DL",
    Goa: "GA",
    Gujarat: "GJ",
    Haryana: "HR",
    "Himachal Pradesh": "HP",
    "Jammu and Kashmir": "JK",
    Jharkhand: "JH",
    Karnataka: "KA",
    Kerala: "KL",
    Ladakh: "LA",
    Lakshadweep: "LD",
    "Madhya Pradesh": "MP",
    Maharashtra: "MH",
    Manipur: "MN",
    Meghalaya: "ML",
    Mizoram: "MZ",
    Nagaland: "NL",
    Odisha: "OD",
    Puducherry: "PY",
    Punjab: "PB",
    Rajasthan: "RJ",
    Sikkim: "SK",
    "Tamil Nadu": "TN",
    Telangana: "TS",
    Tripura: "TR",
    "Uttar Pradesh": "UP",
    Uttarakhand: "UK",
    "West Bengal": "WB",
  };
  return map[stateName] || stateName.slice(0, 2).toUpperCase();
};

// PIN Code Prefix Validation Maps
const STATE_PIN_PREFIXES = {
  "Andaman and Nicobar Islands": ["74"],
  "Andhra Pradesh": ["51", "52", "53"],
  "Arunachal Pradesh": ["79"],
  "Assam": ["78"],
  "Bihar": ["80", "81", "82", "83", "84", "85"],
  "Chandigarh": ["16"],
  "Chhattisgarh": ["49"],
  "Dadra and Nagar Haveli and Daman and Diu": ["39"],
  "Delhi": ["11"],
  "Goa": ["40"],
  "Gujarat": ["36", "37", "38", "39"],
  "Haryana": ["12", "13"],
  "Himachal Pradesh": ["17"],
  "Jammu and Kashmir": ["18", "19"],
  "Jharkhand": ["81", "82", "83"],
  "Karnataka": ["56", "57", "58", "59"],
  "Kerala": ["67", "68", "69"],
  "Ladakh": ["19"],
  "Lakshadweep": ["68"],
  "Madhya Pradesh": ["45", "46", "47", "48"],
  "Maharashtra": ["40", "41", "42", "43", "44"],
  "Manipur": ["79"],
  "Meghalaya": ["79"],
  "Mizoram": ["79"],
  "Nagaland": ["79"],
  "Odisha": ["75", "76", "77"],
  "Puducherry": ["60"],
  "Punjab": ["14", "15", "16"],
  "Rajasthan": ["30", "31", "32", "33", "34"],
  "Sikkim": ["73"],
  "Tamil Nadu": ["60", "61", "62", "63", "64"],
  "Telangana": ["50"],
  "Tripura": ["79"],
  "Uttar Pradesh": ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
  "Uttarakhand": ["24", "26"],
  "West Bengal": ["70", "71", "72", "73", "74"],
};

const DISTRICT_PIN_PREFIXES = {
  // Karnataka
  "Bengaluru Urban": ["560"],
  "Bengaluru Rural": ["562"],
  "Kolar": ["563"],
  "Chikkaballapur": ["562", "563"],
  "Ramanagara": ["562"],
  "Tumakuru": ["572"],
  "Mysuru": ["570", "571"],
  "Mandya": ["571"],
  "Chamarajanagar": ["571"],
  "Hassan": ["573"],
  "Dakshina Kannada": ["574", "575"],
  "Udupi": ["576"],
  "Chikkamagaluru": ["577"],
  "Chitradurga": ["577"],
  "Davanagere": ["577"],
  "Shivamogga": ["577"],
  "Ballari": ["583"],
  "Vijayanagara": ["583"],
  "Koppal": ["583"],
  "Raichur": ["584"],
  "Dharwad": ["580"],
  "Gadag": ["582"],
  "Haveri": ["581"],
  "Uttara Kannada": ["581"],
  "Belagavi": ["590", "591"],
  "Bagalkot": ["587"],
  "Vijayapura": ["586"],
  "Kalaburagi": ["585"],
  "Yadgir": ["585"],
  "Bidar": ["585"],
  "Kodagu": ["571"],

  // Delhi
  "Central Delhi": ["110"],
  "East Delhi": ["110"],
  "New Delhi": ["110"],
  "North Delhi": ["110"],
  "North East Delhi": ["110"],
  "North West Delhi": ["110"],
  "Shahdara": ["110"],
  "South Delhi": ["110"],
  "South East Delhi": ["110"],
  "South West Delhi": ["110"],
  "West Delhi": ["110"],

  // Maharashtra
  "Mumbai City": ["400"],
  "Mumbai Suburban": ["400"],
  "Thane": ["400", "401"],
  "Palghar": ["401"],
  "Raigad": ["402", "410"],
  "Pune": ["411", "412"],
  "Nagpur": ["440", "441"],
  "Nashik": ["422", "423"],
  "Kolhapur": ["416"],
  "Solapur": ["413"],
  "Aurangabad": ["431"],
  "Chhatrapati Sambhajinagar": ["431"],
  "Amravati": ["444"],

  // Tamil Nadu
  "Chennai": ["600"],
  "Coimbatore": ["641"],
  "Madurai": ["625"],
  "Tiruchirappalli": ["620"],
  "Salem": ["636"],
  "Tirunelveli": ["627"],
  "Erode": ["638"],
  "Vellore": ["632"],
  "Kanchipuram": ["603", "631"],
  "Chengalpattu": ["603"],
  "Tiruvallur": ["601", "602"],

  // Telangana
  "Hyderabad": ["500"],
  "Ranga Reddy": ["500", "501"],
  "Medchal-Malkajgiri": ["500", "501"],
  "Warangal": ["506"],
  "Hanamkonda": ["506"],
  "Karimnagar": ["505"],
  "Nizamabad": ["503"],

  // Andhra Pradesh
  "Visakhapatnam": ["530", "531"],
  "Vijayawada": ["520"],
  "NTR": ["520", "521"],
  "Krishna": ["521"],
  "Guntur": ["522"],
  "Tirupati": ["517"],
  "Chittoor": ["517"],
  "Kurnool": ["518"],
  "Anantapur": ["515"],

  // West Bengal
  "Kolkata": ["700"],
  "Howrah": ["711"],
  "North 24 Parganas": ["700", "743"],
  "South 24 Parganas": ["700", "743"],
  "Darjeeling": ["734"],

  // Gujarat
  "Ahmedabad": ["380", "382"],
  "Surat": ["394", "395"],
  "Vadodara": ["390", "391"],
  "Rajkot": ["360"],
  "Bhavnagar": ["364"],
  "Gandhinagar": ["382"],

  // Rajasthan
  "Jaipur": ["302", "303"],
  "Jodhpur": ["342"],
  "Udaipur": ["313"],
  "Kota": ["324", "325"],
  "Bikaner": ["334"],
  "Ajmer": ["305"],

  // Uttar Pradesh
  "Lucknow": ["226"],
  "Kanpur Nagar": ["208"],
  "Kanpur Dehat": ["209"],
  "Varanasi": ["221"],
  "Prayagraj": ["211"],
  "Agra": ["282"],
  "Gautam Buddha Nagar": ["201"],
  "Ghaziabad": ["201"],
  "Meerut": ["250"],
  "Gorakhpur": ["273"],
  "Bareilly": ["243"],
  "Aligarh": ["202"],

  // Kerala
  "Thiruvananthapuram": ["695"],
  "Ernakulam": ["682", "683"],
  "Kozhikode": ["673"],
  "Thrissur": ["680"],
  "Kollam": ["691"],
  "Kannur": ["670"],

  // Chandigarh
  "Chandigarh": ["160"],

  // Bihar
  "Patna": ["800", "801"],
  "Gaya": ["823"],
  "Muzaffarpur": ["842"],
  "Bhagalpur": ["812"],

  // Madhya Pradesh
  "Bhopal": ["462"],
  "Indore": ["452"],
  "Gwalior": ["474"],
  "Jabalpur": ["482"],

  // Punjab
  "Ludhiana": ["141"],
  "Amritsar": ["143"],
  "Jalandhar": ["144"],
  "Patiala": ["147"],

  // Haryana
  "Gurugram": ["122"],
  "Faridabad": ["121"],
  "Panipat": ["132"],
  "Ambala": ["133", "134"],
  "Karnal": ["132"],

  // Odisha
  "Khordha (Bhubaneswar)": ["751"],
  "Cuttack": ["753"],
  "Puri": ["752"],

  // Assam
  "Kamrup Metropolitan (Guwahati)": ["781"],
};

// Helper: Convert string to clean Title Case for official identity documents
const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(?:^|\s|[-/.,'#])([a-z\u00C0-\u024F])/g, (char) => char.toUpperCase());
};

// Generate Unique Registration ID (India / National Level Cadre)
const generateRegId = async () => {
  const year = new Date().getFullYear();
  // Find highest serial currently in MSD-IND-YYYY-XXXX
  const latestMember = await Member.findOne({
    registrationId: { $regex: new RegExp(`^MSD-IND-${year}-`, "i") },
  }).sort({ registrationId: -1 });

  let nextNum = 1;
  if (latestMember && latestMember.registrationId) {
    const parts = latestMember.registrationId.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  } else {
    const totalCount = await Member.countDocuments({});
    nextNum = totalCount + 1;
  }

  const serial = String(nextNum).padStart(4, "0");
  return `MSD-IND-${year}-${serial}`;
};

// ─── Registration Validation Helpers & Enums ────────────────────────────────
const VALID_WINGS = [
  "Legal Wing",
  "Medical & Health Wing",
  "Education & Child Welfare",
  "Youth & Sports Wing",
  "Community Seva & Mahaprasadam",
  "General Seva Cadre",
];

const VALID_GENDERS = ["Male", "Female", "Other"];

const VALID_BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Not Specified", ""
];

const calculateAgeFromDob = (dobStr) => {
  if (!dobStr) return null;
  const birth = new Date(dobStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const validateRegistrationData = (body, file) => {
  const errors = {};

  const fullName = (body.fullName || "").trim();
  const fatherName = (body.fatherName || "").trim();
  const dob = (body.dob || "").trim();
  const gender = (body.gender || "").trim();
  const mobile = (body.mobile || "").trim();
  const whatsapp = (body.whatsapp || "").trim();
  const emergencyNumber = (body.emergencyNumber || "").trim();
  const emergencyRelation = (body.emergencyRelation || "").trim();
  const VALID_RELATIONS = ["Father", "Mother", "Spouse", "Sibling", "Friend", "Other"];
  const email = (body.email || "").trim();
  const bloodGroup = (body.bloodGroup || "").trim();
  const state = (body.state || "").trim();
  const district = (body.district || "").trim();
  const address = (body.address || "").trim();
  const pincode = (body.pincode || "").trim();
  const wing = (body.wing || "").trim();
  const pledgeAccepted = body.pledgeAccepted === true || body.pledgeAccepted === "true";

  // Full Name (minimum 3 letters, alphabets and spaces only)
  if (!fullName) {
    errors.fullName = "Full Name is required.";
  } else {
    const lettersOnly = fullName.replace(/[^a-zA-Z]/g, "");
    if (lettersOnly.length < 3) {
      errors.fullName = "Full Name must contain at least 3 letters.";
    } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      errors.fullName = "Full Name should contain alphabets and spaces only.";
    }
  }

  // Father's / Husband's Name (minimum 3 letters, alphabets and spaces only)
  if (!fatherName) {
    errors.fatherName = "Father's / Husband's Name is required.";
  } else {
    const lettersOnly = fatherName.replace(/[^a-zA-Z]/g, "");
    if (lettersOnly.length < 3) {
      errors.fatherName = "Father's / Husband's Name must contain at least 3 letters.";
    } else if (!/^[a-zA-Z\s]+$/.test(fatherName)) {
      errors.fatherName = "Father's / Husband's Name should contain alphabets and spaces only.";
    }
  }

  // Date of Birth & Age Eligibility
  if (!dob) {
    errors.dob = "Date of Birth is required.";
  } else {
    const age = calculateAgeFromDob(dob);
    if (age === null) {
      errors.dob = "Please enter a valid Date of Birth (YYYY-MM-DD).";
    } else if (new Date(dob) > new Date()) {
      errors.dob = "Date of Birth cannot be in the future.";
    } else if (age < 12) {
      errors.dob = "Cadre member must be at least 12 years of age to register.";
    } else if (age > 115) {
      errors.dob = "Please enter a realistic Date of Birth.";
    }
  }

  // Gender
  if (!gender || !VALID_GENDERS.includes(gender)) {
    errors.gender = "Please select a valid Gender (Male, Female, or Other).";
  }

  // Primary Mobile (10 digits starting with 6, 7, 8, 9)
  if (!mobile) {
    errors.mobile = "Primary Mobile Number is required.";
  } else if (!/^[6-9]\d{9}$/.test(mobile)) {
    errors.mobile = "Mobile Number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.";
  }

  // WhatsApp (optional, but validated if provided)
  if (whatsapp && !/^[6-9]\d{9}$/.test(whatsapp)) {
    errors.whatsapp = "WhatsApp Number must be a valid 10-digit number.";
  }

  // Emergency Contact Number (Compulsory, 10 digits, cannot match primary mobile)
  if (!emergencyNumber) {
    errors.emergencyNumber = "Emergency contact number is required.";
  } else if (!/^[6-9]\d{9}$/.test(emergencyNumber)) {
    errors.emergencyNumber = "Emergency contact number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.";
  } else if (emergencyNumber === mobile) {
    errors.emergencyNumber = "Emergency contact number cannot be the same as primary mobile number.";
  }

  // Emergency Relation (Compulsory, must be from allowed list)
  if (!emergencyRelation) {
    errors.emergencyRelation = "Please select relationship with emergency contact.";
  } else if (!VALID_RELATIONS.includes(emergencyRelation)) {
    errors.emergencyRelation = "Please select a valid relation option (Father, Mother, Spouse, Sibling, Friend, or Other).";
  }

  // Email (optional, but validated if provided)
  if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  // Blood Group
  if (bloodGroup && !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    errors.bloodGroup = "Invalid Blood Group option selected.";
  }

  // State
  if (!state) {
    errors.state = "State / Union Territory is required.";
  }

  // District
  if (!district) {
    errors.district = "District is required.";
  } else if (district.length < 2) {
    errors.district = "District name must be at least 2 characters.";
  }

  // Residential Address
  if (!address) {
    errors.address = "Residential Address is required.";
  } else if (address.length < 8) {
    errors.address = "Please provide complete address (at least 8 characters).";
  }

  // Postal PIN Code (6 digits and must match state / district)
  if (!pincode) {
    errors.pincode = "Postal PIN Code is required.";
  } else if (!/^\d{6}$/.test(pincode) || pincode.startsWith("0")) {
    errors.pincode = "PIN Code must be a valid 6-digit Indian postal code.";
  } else {
    if (state && STATE_PIN_PREFIXES[state]) {
      const validStatePrefixes = STATE_PIN_PREFIXES[state];
      if (!validStatePrefixes.some((pref) => pincode.startsWith(pref))) {
        errors.pincode = `PIN code does not match selected state ${state}.`;
      }
    }
    if (district && district !== "Other District" && DISTRICT_PIN_PREFIXES[district]) {
      const validDistPrefixes = DISTRICT_PIN_PREFIXES[district];
      if (!validDistPrefixes.some((pref) => pincode.startsWith(pref))) {
        errors.pincode = `PIN code does not match selected district ${district}.`;
      }
    }
  }

  // Primary Cadre Wing
  if (!wing || !VALID_WINGS.includes(wing)) {
    errors.wing = `Please choose a valid MSD Wing (${VALID_WINGS.join(", ")}).`;
  }

  // Seva Pledge
  if (!pledgeAccepted) {
    errors.pledgeAccepted = "You must accept the Maha Seva Dal 1947 Seva Pledge to complete registration.";
  }

  // Photo Validation (MANDATORY)
  if (!file) {
    errors.photo = "Passport size photograph is mandatory for cadre registration.";
  } else {
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(file.mimetype)) {
      errors.photo = "Photograph must be a valid JPG, PNG, or WEBP image.";
    } else if (file.size > 5 * 1024 * 1024) {
      errors.photo = "Photograph file size must not exceed 5 MB.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError: Object.values(errors)[0] || null,
  };
};

// ─── 1. Public Member Registration ──────────────────────────────────────────
const registerMember = async (req, res) => {
  try {
    const {
      fullName,
      fatherName,
      dob,
      gender,
      mobile,
      whatsapp,
      emergencyNumber,
      emergencyRelation,
      email,
      bloodGroup,
      state,
      district,
      assembly,
      zone,
      taluk,
      address,
      pincode,
      profession,
      wing,
    } = req.body;

    // Run Server-side Data Validation
    const validation = validateRegistrationData(req.body, req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.firstError,
        errors: validation.errors,
      });
    }

    // Check for existing active registration with the same mobile
    const cleanMobile = mobile.trim();
    const existingMember = await Member.findOne({
      mobile: cleanMobile,
      status: { $in: ["PENDING", "APPROVED"] },
    });
    if (existingMember) {
      return res.status(409).json({
        error: "This mobile number is already registered.",
        existingRegistrationId: existingMember.registrationId,
        status: existingMember.status,
      });
    }

    const registrationId = await generateRegId();
    const safeRegId = registrationId.replace(/[^a-zA-Z0-9_-]/g, "_");

    // Sanitize names and administrative text to official Title Case
    const sanitizedFullName = toTitleCase(fullName);
    const sanitizedFatherName = toTitleCase(fatherName);
    const sanitizedDistrict = toTitleCase(district);
    const sanitizedAssembly = assembly ? toTitleCase(String(assembly).trim()) : "";
    const sanitizedZone = zone ? toTitleCase(String(zone).trim()) : "";
    const sanitizedTaluk = taluk ? toTitleCase(taluk) : "";
    const sanitizedProfession = profession ? toTitleCase(profession) : "";
    const sanitizedAddress = toTitleCase(address);
    const finalAge = calculateAgeFromDob(dob);

    const baseUrl = process.env.STORAGE_BASE_URL || "https://mahasevadal.com";
    let photoUrl = `${baseUrl}/uploads/photos/${safeRegId}_photo.jpg`;
    let photoPublicId = `do_${safeRegId}`;
    let cardUrl = `${baseUrl}/uploads/cards/${safeRegId}_card.png`;

    // Direct local / droplet disk storage
    const photosDir = path.resolve(__dirname, "../uploads/photos");
    const cardsDir = path.resolve(__dirname, "../uploads/cards");
    if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
    if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });

    if (req.file) {
      // Store the photo IN MongoDB as a base64 data URI so the dashboard shows it
      // everywhere — independent of any file server / STORAGE_BASE_URL.
      try {
        const sharp = require("sharp");
        const processed = await sharp(req.file.buffer)
          .resize(400, 500, { fit: "cover", position: "center" })
          .jpeg({ quality: 82 })
          .toBuffer();
        photoUrl = `data:image/jpeg;base64,${processed.toString("base64")}`;
      } catch (imgErr) {
        photoUrl = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
      }
      // Also cache to disk for the local card generator's disk fallback.
      try {
        fs.writeFileSync(path.join(photosDir, `${safeRegId}_photo.jpg`), req.file.buffer);
      } catch (saveErr) {
        console.warn("Failed saving candidate photo locally:", saveErr.message);
      }
    }

    // Generate combined 2-sided ID Card
    try {
      const cardMemberData = {
        registrationId,
        fullName: sanitizedFullName,
        fatherName: sanitizedFatherName,
        dob,
        gender,
        mobile,
        whatsapp: whatsapp || mobile,
        bloodGroup: bloodGroup || "O+",
        wing,
        state,
        district: sanitizedDistrict,
        address: sanitizedAddress,
        pincode,
        emergencyNumber: emergencyNumber || "",
      };
      const { combinedPngBuffer } = await generateCadreIdCards(cardMemberData, req.file ? req.file.buffer : null);
      if (combinedPngBuffer) {
        fs.writeFileSync(path.join(cardsDir, `${safeRegId}_card.png`), combinedPngBuffer);
      }
    } catch (cardErr) {
      console.warn("Card generation warning during registration:", cardErr.message);
    }

    const newMember = new Member({
      registrationId,
      fullName: sanitizedFullName,
      fatherName: sanitizedFatherName,
      dob,
      age: finalAge,
      gender,
      mobile,
      whatsapp: whatsapp || "",
      emergencyNumber: emergencyNumber || "",
      emergencyRelation: emergencyRelation || "",
      email: email || "",
      bloodGroup: bloodGroup || "",
      photoUrl,
      photoPublicId,
      cardUrl,
      cardIssuedAt: new Date(),
      state,
      district: sanitizedDistrict,
      assembly: sanitizedAssembly,
      zone: sanitizedZone,
      taluk: sanitizedTaluk,
      address: sanitizedAddress,
      pincode,
      profession: sanitizedProfession,
      wing,
      pledgeAccepted: true,
      status: "PENDING",
      leadStatus: "RECOVERED",
      lastStepCompleted: "Step 4: Oath Pledged",
      channelSource: "web",
    });

    const saved = await newMember.save();

    // Mark incomplete lead as recovered in CRM
    try {
      const cleanPhone = String(saved.mobile || "").replace(/\D/g, "").slice(-10);
      // Registration complete -> remove from Incomplete Leads recovery CRM
      // entirely. The candidate now lives in the Cadre Directory (Member list),
      // so they must no longer appear as a drop-off lead.
      await IncompleteLead.deleteMany({ mobile: cleanPhone });
      const WhatsAppConversation = require("../models/WhatsAppConversation");
      // Reflect the member's ACTUAL status (web registrations are PENDING and
      // await admin approval). Do NOT overwrite the conversation channel here —
      // a WhatsApp-origin conversation must keep its channel for "both" detection.
      await WhatsAppConversation.findOneAndUpdate(
        { mobile: cleanPhone },
        {
          $set: {
            registrationStatus: saved.status,
            customerName: saved.fullName,
          },
        }
      ).catch(() => {});
    } catch (recErr) {}

    // Sync to file
    await syncToLocalBackupFile();

    res.status(201).json({
      success: true,
      message: "Registration successful! Awaiting verification.",
      member: saved,
    });
  } catch (error) {
    console.error("Member Registration Error:", error);
    res.status(500).json({ error: error.message || "Failed to register member." });
  }
};

// ─── 1b. Check Mobile Number Availability (Real-Time Duplicate Check) ────────
const checkMobileExists = async (req, res) => {
  try {
    const rawMobile = req.query.mobile || "";
    let cleanMobile = String(rawMobile).replace(/[\s\-()]/g, "");
    if (cleanMobile.startsWith("+91")) cleanMobile = cleanMobile.slice(3);
    if (cleanMobile.startsWith("91") && cleanMobile.length === 12) cleanMobile = cleanMobile.slice(2);
    if (cleanMobile.startsWith("0") && cleanMobile.length === 11) cleanMobile = cleanMobile.slice(1);

    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit Indian mobile number." });
    }

    const existingMember = await Member.findOne({
      mobile: cleanMobile,
      status: { $in: ["PENDING", "APPROVED"] },
    }).lean();

    if (existingMember) {
      return res.json({
        registered: true,
        message: "This mobile number is already registered.",
        registrationId: existingMember.registrationId,
        status: existingMember.status,
      });
    }

    return res.json({
      registered: false,
      message: "Mobile number is available",
    });
  } catch (error) {
    console.error("Check Mobile Exists Error:", error);
    res.status(500).json({ error: "Failed to verify mobile number." });
  }
};

// ─── 2. Get All Members (Admin with Filters & Search) ─────────────────────────
const getAllMembers = async (req, res) => {
  try {
    const { search, state, district, wing, status, page, limit, startDate, endDate, sortField, sortOrder } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const query = {};

    if (status && status !== "ALL") {
      query.status = status;
    }
    if (state && state !== "ALL") {
      query.state = state;
    }
    if (district && district !== "ALL") {
      query.district = district;
    }
    if (wing && wing !== "ALL") {
      query.wing = wing;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (search && typeof search === "string" && search.trim() !== "") {
      const cleanSearch = search.trim().slice(0, 100);
      const escaped = escapeRegex(cleanSearch);
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { fullName: regex },
        { fatherName: regex },
        { mobile: regex },
        { emergencyNumber: regex },
        { registrationId: regex },
        { district: regex },
        { email: regex },
      ];
    }

    const totalCount = await Member.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

    let members;
    if (sortField) {
      const order = sortOrder === "desc" || sortOrder === "-1" ? -1 : 1;
      let sortObj = {};
      if (sortField === "fullName") {
        sortObj = { fullName: order };
      } else if (sortField === "createdAt") {
        sortObj = { createdAt: order };
      } else if (sortField === "status") {
        sortObj = { status: order, createdAt: -1 };
      } else {
        sortObj = { [sortField]: order };
      }
      members = await Member.find(query)
        .collation({ locale: "en", strength: 2 })
        .sort(sortObj)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit);
    } else {
      // Default sort: Pending first, newest first (so newly registered members immediately appear at the top)
      members = await Member.aggregate([
        { $match: query },
        {
          $addFields: {
            statusSortWeight: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "PENDING"] }, then: 0 },
                  { case: { $eq: ["$status", "APPROVED"] }, then: 1 },
                  { case: { $eq: ["$status", "REJECTED"] }, then: 2 },
                ],
                default: 3,
              },
            },
          },
        },
        { $sort: { statusSortWeight: 1, createdAt: -1 } },
        { $skip: (parsedPage - 1) * parsedLimit },
        { $limit: parsedLimit },
      ]);
    }

    // Overall Statistics for KPI cards & Analytics
    const totalAll = await Member.countDocuments();
    const totalPending = await Member.countDocuments({ status: "PENDING" });
    const totalApproved = await Member.countDocuments({ status: "APPROVED" });
    const totalRejected = await Member.countDocuments({ status: "REJECTED" });

    // Wing Breakdown for Intelligence Charts
    const wingBreakdown = await Member.aggregate([
      { $group: { _id: "$wing", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // State Breakdown (Top 10)
    const stateBreakdown = await Member.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Gender Breakdown
    const genderBreakdown = await Member.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: members,
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
      stats: {
        total: totalAll,
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
        wingBreakdown,
        stateBreakdown,
        genderBreakdown,
      },
    });
  } catch (error) {
    console.error("Get All Members Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch members." });
  }
};

// ─── 3. Update Member Status (Approve / Reject / Pending / Admin Notes) ──────
const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (status === undefined && adminNotes === undefined) {
      return res.status(400).json({ error: "Please provide status or adminNotes to update." });
    }

    const member = mongoose.isValidObjectId(id)
      ? await Member.findById(id)
      : await Member.findOne({ registrationId: id });

    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    const prevStatus = member.status;
    const adminUser = req.admin?.username || "MSD_Admin";

    if (status !== undefined) {
      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value. Must be PENDING, APPROVED, or REJECTED." });
      }
      if (status === "REJECTED") {
        const finalNotes = adminNotes !== undefined ? String(adminNotes).trim() : (member.adminNotes || "").trim();
        if (!finalNotes) {
          return res.status(400).json({ error: "Rejection remarks are compulsory when rejecting an application." });
        }
      }
      member.status = status;
      if (status === "APPROVED") {
        member.approvedAt = new Date();
      } else {
        member.approvedAt = null;
      }
    }

    if (adminNotes !== undefined) {
      member.adminNotes = String(adminNotes).trim();
    } else if (status === "PENDING") {
      member.adminNotes = "";
    }

    const updated = await member.save();

    // Sync Member Approval / Rejection into WhatsApp CRM Inbox & Auto-Attach Approval Template + Digital ID Card
    try {
      const cleanPhone = String(updated.mobile || "").replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        const isApproved = updated.status === "APPROVED";
        const cardData = isApproved
          ? {
              registrationId: updated.registrationId,
              fullName: updated.fullName,
              fatherName: updated.fatherName || "—",
              dob: updated.dob || "1996-05-14",
              gender: updated.gender || "Male",
              mobile: cleanPhone,
              whatsapp: cleanPhone,
              bloodGroup: updated.bloodGroup || "O+",
              wing: updated.wing || "General Seva Cadre",
              state: updated.state || "Tamil Nadu",
              district: updated.district || "Chennai",
              address: updated.address || `${updated.district || ""}, ${updated.state || ""}`,
              pincode: updated.pincode || "600001",
              photoUrl: updated.photoUrl || "/founder-saragabani-gopu-portrait.jpg",
              status: "APPROVED",
              action: "GENERATED",
            }
          : null;

        const approvalMsgContent = isApproved
          ? `Jai Hind ${updated.fullName}! 🇮🇳\n\nYour Maha Seva Dal registration (${updated.registrationId}) for ${updated.wing} in ${updated.district}, ${updated.state} is APPROVED.\n\nYour Official Digital Cadre ID Card is attached above.`
          : updated.status === "REJECTED"
          ? `Namaste ${updated.fullName}, your application (${updated.registrationId}) requires correction: ${updated.adminNotes || "Please upload a clear passport photo."}`
          : `Application (${updated.registrationId}) marked as PENDING review.`;

        await WhatsAppConversation.findOneAndUpdate(
          { mobile: cleanPhone },
          {
            $set: {
              customerName: updated.fullName,
              registrationStatus: updated.status,
              registrationId: updated.registrationId,
              wing: updated.wing,
              state: updated.state,
              district: updated.district,
              cardViewed: isApproved,
              lastCompletedStep: isApproved
                ? "Approved by Admin — Approval Template & ID Card Sent"
                : updated.status === "REJECTED"
                ? "Application Rejected — Follow-Up Sent"
                : "Pending Verification",
              lastMessageAt: new Date(),
              lastMessagePreview: approvalMsgContent,
            },
            $push: {
              messages: {
                messageId: `msg_out_status_${Date.now()}`,
                direction: "OUTBOUND",
                type: "template",
                templateName: isApproved
                  ? "msd_registration_confirmation_id_v1"
                  : "msd_cadre_verification_followup_v1",
                content: approvalMsgContent,
                stepName: isApproved
                  ? "Auto Approval Template & Digital ID Card Sent"
                  : "Status Update Template Sent",
                channelSource: "whatsapp",
                cardData,
                status: "DELIVERED",
                senderName: "MSD WhatsApp Bot",
                timestamp: new Date(),
              },
              stepHistory: {
                stepLabel: isApproved
                  ? `Admin Approved (${updated.registrationId}) ➔ Approval Template & ID Card Dispatched`
                  : `Admin Updated Status to ${updated.status}`,
                buttonClicked: isApproved ? "Approve & Send ID Card" : updated.status,
                channelSource: "whatsapp",
                timestamp: new Date(),
              },
            },
          },
          { upsert: true }
        );

        // When Approved by Admin on Web -> Automatically dispatch Front & Back Digital ID Cards to candidate's WhatsApp
        if (isApproved) {
          try {
            const toWaPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
            console.log(`[Admin Approval] Dispatching Official Both-Sided Cadre ID Card to +${toWaPhone}...`);
            const { combinedPngBuffer } = await generateCadreIdCards(updated);

            if (combinedPngBuffer) {
              const cardUp = await uploadMetaMedia(combinedPngBuffer, `${updated.registrationId}_card.png`, "image/png");
              if (cardUp.success && cardUp.mediaId) {
                await sendMetaImageMessage(
                  toWaPhone,
                  cardUp.mediaId,
                  `🪪 *Official Cadre ID Card (National Cadre)*\n` +
                  `*Name:* ${updated.fullName}\n` +
                  `*ID:* \`${updated.registrationId}\`\n` +
                  `*Wing:* ${updated.wing}\n` +
                  `*Unit:* ${updated.state} / ${updated.district}\n\n` +
                  `_Official dual-sided card. Download and save to your device._`
                );
              }
            }
          } catch (waErr) {
            console.warn("[Admin Approval -> WhatsApp Dispatch Error]:", waErr.message);
          }
        } else if (updated.status === "REJECTED") {
          try {
            const toWaPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
            const rejectNotice =
              `❌ *Maha Seva Dal - Application Update*\n\n` +
              `*Name:* ${updated.fullName}\n` +
              `*Application ID:* \`${updated.registrationId}\`\n` +
              `*Status:* 🔴 *REJECTED / ACTION REQUIRED*\n` +
              `*Reason:* ${updated.adminNotes || "Details or photo did not meet requirements."}\n\n` +
              `Please contact the Central Secretariat Helpline (+91 9994625690) or resubmit via mahasevadal.com.`;
            await sendMetaWhatsAppMessage(toWaPhone, rejectNotice);
          } catch (waErr) {
            console.warn("[Admin Reject -> WhatsApp Error]:", waErr.message);
          }
        }
      }
    } catch (crmSyncErr) {
      console.warn("[Member Status -> WhatsApp Inbox Sync Warning]:", crmSyncErr.message);
    }

    // Update local backup file
    await syncToLocalBackupFile();

    res.json({
      success: true,
      message: `Member status updated to ${member.status}.`,
      member: updated,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: error.message || "Failed to update member." });
  }
};

// ─── 3b. Bulk Update Member Status (Batch Operations) ────────────────────────
const bulkUpdateMemberStatus = async (req, res) => {
  try {
    const { memberIds, status, adminNotes } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: "Please provide an array of memberIds." });
    }

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value. Must be PENDING, APPROVED, or REJECTED." });
    }

    if (status === "REJECTED") {
      const finalNotes = adminNotes !== undefined ? String(adminNotes).trim() : "";
      if (!finalNotes) {
        return res.status(400).json({ error: "Rejection remarks are compulsory when rejecting applications." });
      }
    }

    const adminUser = req.admin?.username || "MSD_Admin";
    const updateDoc = {
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
    };
    if (adminNotes !== undefined) {
      updateDoc.adminNotes = String(adminNotes).trim();
    } else if (status === "PENDING") {
      updateDoc.adminNotes = "";
    }

    const validIds = memberIds.filter((id) => mongoose.isValidObjectId(id));
    const result = await Member.updateMany(
      { _id: { $in: validIds } },
      {
        $set: updateDoc,
      }
    );

    await syncToLocalBackupFile();

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} member(s) to ${status}.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk Update Status Error:", error);
    res.status(500).json({ error: error.message || "Failed to bulk update members." });
  }
};

// ─── 4. Delete Member ────────────────────────────────────────────────────────
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = mongoose.isValidObjectId(id)
      ? await Member.findById(id)
      : await Member.findOne({ registrationId: id });
    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    // Delete photo and card from disk if stored
    const safeRegId = member.registrationId ? member.registrationId.replace(/[^a-zA-Z0-9_-]/g, "_") : "";
    if (safeRegId) {
      try {
        const photoPath = path.resolve(__dirname, `../uploads/photos/${safeRegId}_photo.jpg`);
        const cardPath = path.resolve(__dirname, `../uploads/cards/${safeRegId}_card.png`);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
        if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
      } catch (err) {
        console.warn("Local disk file delete warning:", err.message);
      }
    }

    await Member.findByIdAndDelete(member._id);
    await Member.deleteMany({
      $or: [
        { _id: member._id },
        { registrationId: member.registrationId },
        { mobile: member.mobile },
      ],
    }).catch(() => {});

    // Ensure physical deletion from legacy members collection as well
    if (mongoose.connection?.db) {
      await mongoose.connection.db.collection("members").deleteMany({
        $or: [
          { _id: member._id },
          { registrationId: member.registrationId },
          { mobile: member.mobile },
        ],
      }).catch(() => {});
    }

    // Sync to file
    await syncToLocalBackupFile();

    res.json({ success: true, message: "Member record deleted successfully." });
  } catch (error) {
    console.error("Delete Member Error:", error);
    res.status(500).json({ error: error.message || "Failed to delete member." });
  }
};

// ─── 4b. Bulk Delete Members ──────────────────────────────────────────────────
const bulkDeleteMembers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No member IDs provided for bulk deletion." });
    }

    const objectIds = ids.filter((id) => mongoose.isValidObjectId(id));

    // Find all matching members so we can cleanup their stored photo & card files
    const membersToDelete = await Member.find({
      $or: [
        { _id: { $in: objectIds } },
        { registrationId: { $in: ids } },
        { mobile: { $in: ids } },
      ],
    }).lean();

    for (const m of membersToDelete) {
      const safeRegId = m.registrationId ? m.registrationId.replace(/[^a-zA-Z0-9_-]/g, "_") : "";
      if (safeRegId) {
        try {
          const photoPath = path.resolve(__dirname, `../uploads/photos/${safeRegId}_photo.jpg`);
          const cardPath = path.resolve(__dirname, `../uploads/cards/${safeRegId}_card.png`);
          if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
          if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
        } catch (err) {
          console.warn("Bulk delete local file cleanup warning:", err.message);
        }
      }
    }

    const deleteResult = await Member.deleteMany({
      $or: [
        { _id: { $in: objectIds } },
        { registrationId: { $in: ids } },
        { mobile: { $in: ids } },
      ],
    });

    // Also delete matching records from legacy members collection if present
    if (mongoose.connection?.db) {
      await mongoose.connection.db.collection("members").deleteMany({
        $or: [
          { _id: { $in: objectIds } },
          { registrationId: { $in: ids } },
          { mobile: { $in: ids } },
        ],
      }).catch(() => {});
    }

    await syncToLocalBackupFile();

    res.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      message: `Successfully deleted ${deleteResult.deletedCount} member record(s).`,
    });
  } catch (error) {
    console.error("Bulk Delete Members Error:", error);
    res.status(500).json({ error: error.message || "Failed to bulk delete members." });
  }
};

// ─── 5. Download MongoDB Data File ───────────────────────────────────────────
const exportMembersJson = async (req, res) => {
  try {
    const allMembers = await Member.find({}).sort({ createdAt: -1 });
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="msd_members_mongodb_backup_${Date.now()}.json"`
    );
    res.send(JSON.stringify(allMembers, null, 2));
  } catch (error) {
    console.error("Export JSON Error:", error);
    res.status(500).json({ error: "Failed to export data." });
  }
};

// ─── 6. Admin Authentication (Login & Check) ─────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminUser || !adminPass || !jwtSecret) {
      console.error("Admin credentials or JWT_SECRET are not configured in environment variables.");
      return res.status(500).json({ error: "Server authentication is not properly configured." });
    }

    const usernameMatch = safeCompare(username, adminUser);
    const passwordMatch = safeCompare(password, adminPass);

    if (usernameMatch && passwordMatch) {
      const token = jwt.sign(
        { username: adminUser, role: "admin" },
        jwtSecret,
        { expiresIn: "24h" }
      );
      return res.json({
        success: true,
        token,
        admin: { username: adminUser },
      });
    }

    return res.status(401).json({ error: "Invalid username or password." });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ error: "Authentication failed." });
  }
};

const verifyAdminToken = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// Helper to format member particulars for Digital PVC Card & Acknowledgment Receipt
const formatMemberCardData = (member) => {
  const isRejected = member.status === "REJECTED";
  return {
    registrationId: member.registrationId,
    fullName: member.fullName,
    fatherName: member.fatherName || "",
    dob: member.dob || "",
    age: member.age || null,
    gender: member.gender || "Male",
    mobile: member.mobile || "",
    whatsapp: member.whatsapp || "",
    emergencyNumber: member.emergencyNumber || "",
    emergencyRelation: member.emergencyRelation || "",
    email: member.email || "",
    bloodGroup: member.bloodGroup || "",
    photoUrl: member.photoUrl || "",
    cardUrl: member.cardUrl || "",
    state: member.state || "",
    district: member.district || "",
    assembly: member.assembly || "",
    zone: member.zone || "",
    taluk: member.taluk || "",
    address: member.address || "",
    pincode: member.pincode || "",
    wing: member.wing || "",
    profession: member.profession || "",
    status: member.status,
    rejectReason: isRejected ? (member.adminNotes || "") : undefined,
    approvedAt: member.approvedAt || null,
    createdAt: member.createdAt || null,
  };
};

// ─── 7. Public Status Verification (By Registration ID or Mobile) ─────────────
const checkMemberStatus = async (req, res) => {
  try {
    const rawQuery = (req.query.query || req.query.registrationId || req.query.mobile || "").trim();
    const dualRegId = (req.query.registrationId || "").trim();
    const dualMobile = (req.query.mobile || req.query.phone || "").trim();

    // Check if explicitly called with dual keys (both registrationId and mobile)
    if (dualRegId && dualMobile && !req.query.query) {
      let cleanDualPhone = dualMobile.replace(/[\s\-()]/g, "");
      if (cleanDualPhone.startsWith("+91")) cleanDualPhone = cleanDualPhone.slice(3);
      if (cleanDualPhone.startsWith("91") && cleanDualPhone.length === 12) cleanDualPhone = cleanDualPhone.slice(2);
      if (cleanDualPhone.startsWith("0") && cleanDualPhone.length === 11) cleanDualPhone = cleanDualPhone.slice(1);

      if (!/^[6-9]\d{9}$/.test(cleanDualPhone)) {
        return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
      }

      const escapedRegId = escapeRegex(dualRegId);
      const member = await Member.findOne({
        registrationId: { $regex: new RegExp(`^${escapedRegId}$`, "i") },
        mobile: cleanDualPhone,
      }).lean();

      if (!member) {
        return res.status(404).json({
          error: "No member application found matching the provided Registration ID and Mobile Number.",
        });
      }

      return res.json({
        success: true,
        member: formatMemberCardData(member),
      });
    }

    // Single query mode (Mobile or Registration ID)
    if (!rawQuery) {
      return res.status(400).json({
        error: "Please enter your Registration ID or 10-digit Mobile Number.",
      });
    }

    // Clean phone input if formatted with +91, leading 0, spaces, or hyphens
    let cleanPhone = rawQuery.replace(/[\s\-()]/g, "");
    if (cleanPhone.startsWith("+91")) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) cleanPhone = cleanPhone.slice(1);

    const isDigitsOnly = /^\d+$/.test(cleanPhone);
    if (isDigitsOnly) {
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          error: `Mobile number must be exactly 10 digits. Received ${cleanPhone.length} digits.`,
        });
      }
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          error: "Must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.",
        });
      }
    } else {
      if (rawQuery.length < 3 || rawQuery.length > 50) {
        return res.status(400).json({
          error: "Please enter a valid Registration ID.",
        });
      }
    }

    const safeRegexQuery = escapeRegex(rawQuery);
    let member = null;

    if (isDigitsOnly) {
      member = await Member.findOne({ mobile: cleanPhone }).lean();
    } else {
      member = await Member.findOne({
        registrationId: { $regex: new RegExp(`^${safeRegexQuery}$`, "i") },
      }).lean();
    }

    if (!member) {
      return res.status(404).json({
        error: "No member application found matching this ID or Mobile Number. Please verify your details.",
      });
    }

    // Return card and verification particulars (omits government ID proof & admin notes)
    return res.json({
      success: true,
      member: formatMemberCardData(member),
    });
  } catch (error) {
    console.error("Status Check Error:", error);
    res.status(500).json({ error: "Failed to query member status." });
  }
};

// ─── 8. Safe Image Proxy for PVC Card Generation (Zero CORS issues, SSRF Protected) ───
const https = require("https");

const ALLOWED_PHOTO_HOSTS = new Set([
  "mahasevadal.com",
  "143.244.129.138",
  "localhost",
  "res.cloudinary.com",
  ...(process.env.ALLOWED_PHOTO_HOSTS
    ? process.env.ALLOWED_PHOTO_HOSTS.split(",").map((h) => h.trim().toLowerCase())
    : []),
]);

function validatePhotoUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") {
    return { valid: false, reason: "No image URL provided" };
  }

  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { valid: false, reason: "Invalid URL" };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, reason: "Only HTTPS URLs are allowed" };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, reason: "URLs with credentials are not allowed" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Reject localhost, private ranges, link-local metadata (169.254.169.254), and raw IPs
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    /^(?:127\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname) ||
    /^::1$|^fe80:/i.test(hostname) ||
    /^[0-9.]+$/.test(hostname)
  ) {
    return { valid: false, reason: "Host not allowed" };
  }

  if (!ALLOWED_PHOTO_HOSTS.has(hostname)) {
    return { valid: false, reason: `Host ${hostname} is not permitted` };
  }

  return { valid: true, parsed };
}

const proxyPhoto = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const imageUrl = req.query.url;
  const validation = validatePhotoUrl(imageUrl);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.reason });
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  let downloadedBytes = 0;

  const request = https.get(
    validation.parsed,
    { timeout: 5000 },
    (upstreamRes) => {
      // Disallow redirects to prevent open-redirect SSRF
      if (upstreamRes.statusCode >= 300 && upstreamRes.statusCode < 400) {
        upstreamRes.resume();
        return res.status(400).json({ error: "Redirects are not permitted for image proxy" });
      }

      if (upstreamRes.statusCode !== 200) {
        upstreamRes.resume();
        const photoBasename = path.basename(validation.parsed.pathname || "");
        const localCandidate = path.resolve(__dirname, `../uploads/photos/${photoBasename}`);
        const publicCandidate = path.resolve(__dirname, `../../public/uploads/photos/${photoBasename}`);
        if (photoBasename && fs.existsSync(localCandidate)) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Content-Type", "image/jpeg");
          return fs.createReadStream(localCandidate).pipe(res);
        } else if (photoBasename && fs.existsSync(publicCandidate)) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Content-Type", "image/jpeg");
          return fs.createReadStream(publicCandidate).pipe(res);
        }
        return res.status(upstreamRes.statusCode).json({ error: "Failed to load upstream photo" });
      }

      const contentType = (upstreamRes.headers["content-type"] || "").toLowerCase();
      if (!contentType.startsWith("image/")) {
        upstreamRes.resume();
        return res.status(400).json({ error: "Upstream content is not an image" });
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("X-Content-Type-Options", "nosniff");

      upstreamRes.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        if (downloadedBytes > MAX_SIZE) {
          request.destroy();
          upstreamRes.destroy();
          if (!res.headersSent) {
            return res.status(413).json({ error: "Image exceeds 10MB limit" });
          }
          res.end();
        } else {
          res.write(chunk);
        }
      });

      upstreamRes.on("end", () => {
        res.end();
      });

      upstreamRes.on("error", (err) => {
        console.error("Upstream stream error:", err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: "Stream error" });
        }
        res.end();
      });
    }
  );

  request.on("timeout", () => {
    request.destroy();
    if (!res.headersSent) {
      return res.status(504).json({ error: "Upstream photo request timed out" });
    }
  });

  request.on("error", (err) => {
    console.error("Proxy Photo Request Error:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Proxy connection error: " + err.message });
    }
  });
};

// ─── 9. Card Seal & Signature Settings ─────────────────────────────────────
const DEFAULT_CARD_SETTINGS = {
  customSealUrl: "",
  customSignatureUrl: "/signature.png",
  signatoryName: "Authorized Signatory",
  signatoryTitle: "Central Executive Committee",
};

const getCardSettings = async (req, res) => {
  try {
    const settingsDoc = await CardSetting.findOne({ key: "default" }).lean();
    if (!settingsDoc) {
      return res.json({
        success: true,
        settings: {
          ...DEFAULT_CARD_SETTINGS,
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return res.json({
      success: true,
      settings: {
        customSealUrl: settingsDoc.customSealUrl || "",
        customSignatureUrl: settingsDoc.customSignatureUrl || "",
        signatoryName: settingsDoc.signatoryName || DEFAULT_CARD_SETTINGS.signatoryName,
        signatoryTitle: settingsDoc.signatoryTitle || DEFAULT_CARD_SETTINGS.signatoryTitle,
        updatedAt: settingsDoc.updatedAt || new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Get Card Settings Error:", err);
    res.status(500).json({ error: "Failed to load card settings." });
  }
};
 
const updateCardSettings = async (req, res) => {
  try {
    const { customSealUrl, customSignatureUrl, signatoryName, signatoryTitle } = req.body;
    if (signatoryName !== undefined && typeof signatoryName !== "string") {
      return res.status(400).json({ error: "Invalid signatoryName: must be a string." });
    }
    if (signatoryTitle !== undefined && typeof signatoryTitle !== "string") {
      return res.status(400).json({ error: "Invalid signatoryTitle: must be a string." });
    }

    const updateFields = {
      updatedAt: new Date().toISOString(),
    };
    if (customSealUrl !== undefined) updateFields.customSealUrl = String(customSealUrl);
    if (customSignatureUrl !== undefined) updateFields.customSignatureUrl = String(customSignatureUrl);
    if (signatoryName !== undefined) updateFields.signatoryName = String(signatoryName).trim();
    if (signatoryTitle !== undefined) updateFields.signatoryTitle = String(signatoryTitle).trim();

    const updated = await CardSetting.findOneAndUpdate(
      { key: "default" },
      { $set: updateFields, $setOnInsert: { key: "default" } },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({
      success: true,
      settings: {
        customSealUrl: updated.customSealUrl || "",
        customSignatureUrl: updated.customSignatureUrl || "",
        signatoryName: updated.signatoryName || DEFAULT_CARD_SETTINGS.signatoryName,
        signatoryTitle: updated.signatoryTitle || DEFAULT_CARD_SETTINGS.signatoryTitle,
        updatedAt: updated.updatedAt,
      },
      message: "Card seal and signature settings updated successfully.",
    });
  } catch (err) {
    console.error("Update Card Settings Error:", err);
    res.status(500).json({ error: "Failed to save card settings." });
  }
};

// ─── 7b. Re-submit Photo for Rejected Applicants ─────────────────────────────
const resubmitMemberPhoto = async (req, res) => {
  try {
    const { registrationId, mobile } = req.body;
    const file = req.file;

    if (!registrationId || !mobile) {
      return res.status(400).json({ error: "Registration ID and Mobile number are required." });
    }

    if (!file) {
      return res.status(400).json({ error: "Please upload a new passport-size photograph." });
    }

    const cleanPhone = String(mobile).replace(/\D/g, "");
    const member = await Member.findOne({
      registrationId: { $regex: new RegExp(`^${escapeRegex(registrationId.trim())}$`, "i") },
      mobile: { $regex: new RegExp(`${cleanPhone.slice(-10)}$`) },
    });

    if (!member) {
      return res.status(404).json({ error: "No matching member record found with provided Registration ID and Mobile." });
    }

    if (member.status !== "REJECTED") {
      return res.status(400).json({ error: "Photo re-submission is only permitted for applications with REJECTED status." });
    }

    const safeRegId = member.registrationId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const baseUrl = process.env.STORAGE_BASE_URL || "https://mahasevadal.com";
    const photosDir = path.resolve(__dirname, "../uploads/photos");
    const cardsDir = path.resolve(__dirname, "../uploads/cards");
    if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
    if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });

    // Store the re-submitted photo IN MongoDB as a base64 data URI (dashboard-visible
    // everywhere); also cache to disk for the local card generator's disk fallback.
    try {
      const sharp = require("sharp");
      const processed = await sharp(file.buffer)
        .resize(400, 500, { fit: "cover", position: "center" })
        .jpeg({ quality: 82 })
        .toBuffer();
      member.photoUrl = `data:image/jpeg;base64,${processed.toString("base64")}`;
    } catch (imgErr) {
      member.photoUrl = `data:image/jpeg;base64,${file.buffer.toString("base64")}`;
    }
    try {
      fs.writeFileSync(path.join(photosDir, `${safeRegId}_photo.jpg`), file.buffer);
    } catch (diskErr) {}
    member.photoPublicId = `do_${safeRegId}`;

    // Regenerate combined both-sides ID card
    try {
      const { combinedPngBuffer } = await generateCadreIdCards(member, file.buffer);
      if (combinedPngBuffer) {
        fs.writeFileSync(path.join(cardsDir, `${safeRegId}_card.png`), combinedPngBuffer);
        member.cardUrl = `${baseUrl}/uploads/cards/${safeRegId}_card.png`;
        member.cardIssuedAt = new Date();
      }
    } catch (cardErr) {
      console.warn("Card regeneration warning during photo re-submission:", cardErr.message);
    }

    member.status = "PENDING";
    member.adminNotes = "Applicant re-submitted updated passport photograph. Awaiting committee verification.";

    await member.save();
    await syncToLocalBackupFile();

    res.json({
      success: true,
      message: "New photograph uploaded successfully. Your application has been moved back to Pending Review.",
      member: formatMemberCardData(member),
    });
  } catch (error) {
    console.error("Resubmit Photo Error:", error);
    res.status(500).json({ error: error.message || "Failed to re-submit photo." });
  }
};

module.exports = {
  registerMember,
  checkMobileExists,
  getAllMembers,
  updateMemberStatus,
  bulkUpdateMemberStatus,
  resubmitMemberPhoto,
  deleteMember,
  bulkDeleteMembers,
  exportMembersJson,
  adminLogin,
  verifyAdminToken,
  checkMemberStatus,
  proxyPhoto,
  getCardSettings,
  updateCardSettings,
  getStateCode,
  validatePhotoUrl,
  safeCompare,
  escapeRegex,
};



