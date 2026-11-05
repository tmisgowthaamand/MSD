import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";

import PageLayout from "@/components/layout/PageLayout";

import PageHeader from "@/components/ui/PageHeader";

import { Link, useLocation, useSearchParams } from "react-router-dom";

import QRCode from "qrcode";

import DigitalIdCard from "@/components/DigitalIdCard";

import { getApiUrl } from "@/config/api";

import { logActivity } from "@/utils/activityLogger";

import {

  User,

  MapPin,

  Briefcase,

  ShieldCheck,

  Upload,

  CheckCircle2,

  ArrowRight,

  ArrowLeft,

  Printer,

  Download,

  Sparkles,

  AlertCircle,

  Clock,

  Heart,

  Phone,

  Mail,

  Scale,

  Stethoscope,

  GraduationCap,

  Trophy,

  UtensilsCrossed,

  Users,

  UserPlus,

  Search,

  Copy,

  Check,

  RefreshCw,

  FileText,

  Crop,

  Trash2,

  Calendar,

  Camera,

  Edit3,

  X,

  Loader2,

  Info,

} from "lucide-react";

import { jsPDF } from "jspdf";

import ImageCropModal from "@/components/ImageCropModal";



import {

  INDIAN_STATES,

  STATE_DISTRICTS,

  DISTRICT_ASSEMBLIES,

  DISTRICT_ZONES,

  STATE_ZONES,

  getAssembliesForDistrict,

  getZonesForDistrict,

  getDefaultZoneForDistrict,

  getDefaultZoneForState,

} from "@/data/indiaLocations";

export {

  INDIAN_STATES,

  STATE_DISTRICTS,

  DISTRICT_ASSEMBLIES,

  DISTRICT_ZONES,

  STATE_ZONES,

  getAssembliesForDistrict,

  getZonesForDistrict,

  getDefaultZoneForDistrict,

  getDefaultZoneForState,

};



export const ASSEMBLY_OPTIONS = [

  "Thiyagarayanagar",

  "Mylapore",

  "Chepauk-Thiruvallikeni",

  "Anna Nagar",

  "Saidapet",

  "Velachery",

  "Royapuram",

  "Harbour",

  "Villivakkam",

  "Kolathur",

  "Virugambakkam",

  "Alandur",

  "Tambaram",

  "Pallavaram",

  "Sholinganallur",

  "Ambattur",

  "Maduravoyal",

  "Avadi",

  "Poonamallee",

  "Tiruvallur",

  "Kanchipuram",

  "Chengalpattu",

  "Coimbatore South",

  "Coimbatore North",

  "Singanallur",

  "Madurai Central",

  "Madurai North",

  "Madurai South",

  "Tiruchirappalli East",

  "Tiruchirappalli West",

  "Salem North",

  "Salem South",

  "Tirunelveli",

  "Erode East",

  "Vellore",

  "Other Assembly",

];



export const ZONE_OPTIONS = [

  "CHENNAI ZONE",

  "NORTH ZONE",

  "SOUTH ZONE",

  "CENTRAL ZONE",

  "WEST ZONE",

  "EAST ZONE",

  "COIMBATORE ZONE",

  "MADURAI ZONE",

  "TIRUCHIRAPPALLI ZONE",

  "SALEM ZONE",

  "TIRUNELVELI ZONE",

  "HEADQUARTERS ZONE",

  "DELHI NCR ZONE",

  "BENGALURU ZONE",

  "HYDERABAD ZONE",

  "OTHER ZONE",

];





export const STATE_PIN_PREFIXES: Record<string, string[]> = {

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



export const DISTRICT_PIN_PREFIXES: Record<string, string[]> = {

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



const WINGS = [

  {

    id: "Legal Wing",

    title: "Legal Wing",

    description: "Pro-bono legal counsel, citizen rights protection, and statutory advocacy.",

    icon: Scale,

  },

  {

    id: "Medical & Health Wing",

    title: "Medical & Health Wing",

    description: "Free medical health check-up camps, blood donation drives, and emergency aid.",

    icon: Stethoscope,

  },

  {

    id: "Education & Child Welfare",

    title: "Education & Child Welfare",

    description: "Academic coaching for underprivileged youth, book distribution, and scholarships.",

    icon: GraduationCap,

  },

  {

    id: "Youth & Sports Wing",

    title: "Youth & Sports Wing",

    description: "Athletics training, regional tournaments, discipline, and youth leadership camps.",

    icon: Trophy,

  },

  {

    id: "Community Seva & Mahaprasadam",

    title: "Community Seva & Mahaprasadam",

    description: "Mass food distribution at annual assemblies (Guru Poornima, Mahashivratri).",

    icon: UtensilsCrossed,

  },

  {

    id: "General Seva Cadre",

    title: "General Seva Cadre",

    description: "Multi-disciplinary volunteers for community development and on-ground activities.",

    icon: Users,

  },

];



const MONTHS = [

  { value: "01", label: "Jan" },

  { value: "02", label: "Feb" },

  { value: "03", label: "Mar" },

  { value: "04", label: "Apr" },

  { value: "05", label: "May" },

  { value: "06", label: "Jun" },

  { value: "07", label: "Jul" },

  { value: "08", label: "Aug" },

  { value: "09", label: "Sep" },

  { value: "10", label: "Oct" },

  { value: "11", label: "Nov" },

  { value: "12", label: "Dec" },

];



const currentYearNum = new Date().getFullYear();

const YEARS = Array.from({ length: 110 }, (_, i) => String(currentYearNum - i));



const getDaysInMonth = (yearStr: string, monthStr: string) => {

  const y = parseInt(yearStr, 10) || 2000;

  const m = parseInt(monthStr, 10) || 1;

  return new Date(y, m, 0).getDate();

};



const calculateAge = (dobString: string): number | null => {

  if (!dobString) return null;

  const parts = dobString.split("-");

  if (parts.length !== 3) return null;

  const y = parseInt(parts[0], 10);

  const m = parseInt(parts[1], 10);

  const d = parseInt(parts[2], 10);

  if (!y || !m || !d) return null;



  const today = new Date();

  let age = today.getFullYear() - y;

  const currentMonth = today.getMonth() + 1;

  const currentDay = today.getDate();

  if (currentMonth < m || (currentMonth === m && currentDay < d)) {

    age--;

  }

  return age >= 0 ? age : null;

};



const formatDobDisplay = (dobString: string): string => {

  if (!dobString) return "";

  const parts = dobString.split("-");

  if (parts.length !== 3) return dobString;

  const [y, m, d] = parts;

  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;

};



// Auto-capitalize first letter of words while typing live without disrupting typing flow

const capitalizeLive = (str: string): string => {

  if (!str) return "";

  return str.replace(/(?:^|\s|[-/.,'#])([a-z\u00C0-\u024F])/g, (char) => char.toUpperCase());

};



// Normalize names & words to clean Title Case on blur or submission

const normalizeTitleCase = (str: string): string => {

  if (!str) return "";

  return str

    .trim()

    .replace(/\s+/g, " ")

    .toLowerCase()

    .replace(/(?:^|\s|[-/.,'#])([a-z\u00C0-\u024F])/g, (char) => char.toUpperCase());

};



interface RegisterProps {

  defaultTab?: "register" | "status";

}



const Register: React.FC<RegisterProps> = ({ defaultTab = "register" }) => {

  const [searchParams] = useSearchParams();

  const location = useLocation();



  const tabParam = searchParams.get("tab");

  const isResume = searchParams.get("resume") === "true";

  const urlQuery = searchParams.get("id") || searchParams.get("query") || (tabParam === "status" ? searchParams.get("mobile") : "") || "";

  const initialTab =

    tabParam === "register" || isResume

      ? "register"

      : defaultTab === "status" ||

        location.pathname === "/status" ||

        location.pathname === "/verify" ||

        tabParam === "status" ||

        !!urlQuery

      ? "status"

      : "register";



  const [activeTab, setActiveTab] = useState<"register" | "status">(initialTab);



  // Sync activeTab dynamically when navigating between /register and /verify or /status

  useEffect(() => {

    if (tabParam === "register" || isResume || location.pathname === "/register") {

      setActiveTab("register");

    } else if (

      defaultTab === "status" ||

      location.pathname === "/status" ||

      location.pathname === "/verify" ||

      tabParam === "status"

    ) {

      setActiveTab("status");

    }

  }, [location.pathname, defaultTab, tabParam, isResume]);



  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [registeredMember, setRegisteredMember] = useState<any>(null);



  // Status Check Portal State

  const [statusQuery, setStatusQuery] = useState(urlQuery);

  const [statusLoading, setStatusLoading] = useState(false);

  const [statusError, setStatusError] = useState("");

  const [statusResult, setStatusResult] = useState<any>(null);

  const [statusQrUrl, setStatusQrUrl] = useState<string>("");

  const [copiedId, setCopiedId] = useState(false);

  const [supportModalOpen, setSupportModalOpen] = useState(false);



  // Prefill params from incomplete leads resumption (both Web & WhatsApp)

  const prefillMobile = searchParams.get("mobile") || "";

  const prefullName = searchParams.get("fullName") || searchParams.get("name") || "";

  const prefillFather = searchParams.get("fatherName") || searchParams.get("father_or_husband_name") || "";

  const prefillAssembly = searchParams.get("assembly") || searchParams.get("assembly_assm") || "";

  const prefillZone = searchParams.get("zone") || searchParams.get("zone_region") || "";

  const prefillWing = searchParams.get("wing") || "Legal Wing";

  const prefillState = searchParams.get("state") || "";

  const prefillDistrict = searchParams.get("district") || "";

  const prefillPincode = searchParams.get("pincode") || "";

  const prefillGender = searchParams.get("gender") || "";

  const prefillDob = searchParams.get("dob") || "";

  const prefillAddress = searchParams.get("address") || "";

  const dobParts = prefillDob.includes("/") ? prefillDob.split("/") : [];



  // Form State

  const [formData, setFormData] = useState({

    fullName: prefullName,

    fatherName: prefillFather,

    dob: prefillDob,

    gender: prefillGender,

    mobile: prefillMobile,

    whatsapp: prefillMobile,

    // Emergency contact fields (Compulsory)

    emergencyNumber: "",

    emergencyRelation: "",

    email: "",

    bloodGroup: "",

    state: prefillState,

    district: prefillDistrict,

    assembly: searchParams.get("assembly") || searchParams.get("assembly_assm") || "",

    zone: searchParams.get("zone") || searchParams.get("zone_region") || "",

    taluk: "",

    address: prefillAddress,

    pincode: prefillPincode,

    profession: "",

    wing: prefillWing,

    pledgeAccepted: false,

    termsAccepted: false,

  });



  const [dobDay, setDobDay] = useState(dobParts[0] || "");

  const [dobMonth, setDobMonth] = useState(dobParts[1] || "");

  const [dobYear, setDobYear] = useState(dobParts[2] || "");

    const [customDistrict, setCustomDistrict] = useState("");



  // Dynamic state & district-wise Assembly and Zone lists

  const currentAssemblies = useMemo(() => {

    return getAssembliesForDistrict(formData.state, formData.district);

  }, [formData.state, formData.district]);



  const currentZones = useMemo(() => {

    return getZonesForDistrict(formData.state, formData.district);

  }, [formData.state, formData.district]);

  const [customAssembly, setCustomAssembly] = useState(

    prefillAssembly && !ASSEMBLY_OPTIONS.includes(prefillAssembly) ? prefillAssembly : ""

  );

  const [customZone, setCustomZone] = useState(

    prefillZone && !ZONE_OPTIONS.includes(prefillZone) ? prefillZone : ""

  );

  const [canSubmit, setCanSubmit] = useState(false);

  const [checkingMobile, setCheckingMobile] = useState(false);

  const [existingMemberFound, setExistingMemberFound] = useState<{

    registrationId: string;

    status: string;

  } | null>(null);

  const [sameAsMobile, setSameAsMobile] = useState(false);

  const nativeDateInputRef = React.useRef<HTMLInputElement | null>(null);

  const formCardRef = React.useRef<HTMLDivElement | null>(null);

  const errorBannerRef = React.useRef<HTMLDivElement | null>(null);



  // Check mobile availability asynchronously with backend

  const checkMobileAvailability = async (mobileNum: string): Promise<boolean> => {

    const clean = mobileNum.replace(/[\s\-()]/g, "");

    if (!/^[6-9]\d{9}$/.test(clean)) {

      setExistingMemberFound(null);

      return false;

    }



    setCheckingMobile(true);

    try {

      const res = await fetch(

        getApiUrl(`/api/members/check-mobile?mobile=${encodeURIComponent(clean)}`)

      );

      const json = await res.json();

      if (res.ok && json.registered) {

        setExistingMemberFound({

          registrationId: json.registrationId,

          status: json.status,

        });

        setFieldErrors((prev) => ({

          ...prev,

          mobile: "This mobile number is already registered.",

        }));

        setTouchedFields((prev) => ({ ...prev, mobile: true }));

        return true;

      } else {

        setExistingMemberFound(null);

        setFieldErrors((prev) => {

          const next = { ...prev };

          if (next.mobile && next.mobile.includes("already registered")) {

            delete next.mobile;

          }

          return next;

        });

        return false;

      }

    } catch (e) {

      console.warn("Could not check mobile availability:", e);

      return false;

    } finally {

      setCheckingMobile(false);

    }

  };



  // Photo state

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);

  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);

  const [rawPhotoName, setRawPhotoName] = useState<string>("cadre_photo.jpg");



  // Field-level validation state for instant visual feedback while filling details

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});



  // Central Field-Level Validator

  const validateField = (

    field: string,

    value: any,

    currentFormData = formData,

    curCustomDist = customDistrict

  ): string => {

    switch (field) {

      case "photo": {

        if (!value && !photoFile && !photoPreview) {

          return "Passport photograph is required.";

        }

        return "";

      }

      case "fullName": {

        const val = String(value || "").trim();

        if (!val) return "Please enter your full legal name.";

        const lettersOnly = val.replace(/[^a-zA-Z]/g, "");

        if (lettersOnly.length < 3) return "Full Name must contain at least 3 letters.";

        if (!/^[a-zA-Z\s]+$/.test(val)) return "Name must contain alphabets and spaces only.";

        return "";

      }

      case "fatherName": {

        const val = String(value || "").trim();

        if (!val) return "Please enter father's or husband's name.";

        const lettersOnly = val.replace(/[^a-zA-Z]/g, "");

        if (lettersOnly.length < 3) return "Name must contain at least 3 letters.";

        if (!/^[a-zA-Z\s]+$/.test(val)) return "Name must contain alphabets and spaces only.";

        return "";

      }

      case "dob": {

        if (!value) return "Please select Day, Month, and Year of birth.";

        const age = calculateAge(value);

        if (age === null || age < 12) return "Member must be at least 12 years of age to register.";

        if (age > 115) return "Please enter a realistic date of birth.";

        return "";

      }

      case "gender": {

        if (!value || !["Male", "Female", "Other"].includes(value)) return "Please select a gender.";

        return "";

      }

      case "mobile": {

        const val = String(value || "").trim();

        if (!val) return "Please enter your primary mobile number.";

        if (val.length < 10) return "Mobile number must be exactly 10 digits.";

        if (!/^[6-9]\d{9}$/.test(val)) return "Must be a valid 10-digit number starting with 6, 7, 8, or 9.";

        if (existingMemberFound) {

          return "This mobile number is already registered.";

        }

        return "";

      }

      case "whatsapp": {

        const val = String(value || "").trim();

        if (val && !/^[6-9]\d{9}$/.test(val)) return "WhatsApp number must be 10 digits starting with 6, 7, 8, or 9.";

        return "";

      }

      case "emergencyNumber": {

        const val = String(value || "").trim();

        if (!val) return "Emergency contact number is required.";

        if (val.length < 10) return "Emergency contact number must be exactly 10 digits.";

        if (!/^[6-9]\d{9}$/.test(val)) return "Emergency contact number must start with 6, 7, 8, or 9.";

        const primaryMobile = currentFormData.mobile ? currentFormData.mobile.trim() : "";

        if (primaryMobile && val === primaryMobile) {

          return "Emergency contact number cannot be the same as primary mobile number.";

        }

        return "";

      }

      case "emergencyRelation": {

        const val = String(value || "").trim();

        if (!val) return "Please select relationship with emergency contact.";

        const validRelations = ["Father", "Mother", "Spouse", "Sibling", "Friend", "Other"];

        if (!validRelations.includes(val)) return "Please select a valid relation option.";

        return "";

      }

      case "email": {

        const val = String(value || "").trim();

        if (val && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {

          return "Please enter a valid email address.";

        }

        return "";

      }

      case "state": {

        if (!value) return "Please select your State / Union Territory.";

        return "";

      }

      case "district": {

        if (!value) return "Please select your District.";

        if (value === "Other District" && !curCustomDist.trim()) {

          return "Please enter your district name.";

        }

        return "";

      }

      case "customDistrict": {

        if (currentFormData.district === "Other District" && !String(value || "").trim()) {

          return "Please enter your district name.";

        }

        return "";

      }

      case "address": {

        const val = String(value || "").trim();

        if (!val) return "Please enter your residential address.";

        if (val.length < 8) return "Please provide complete address (min 8 characters).";

        return "";

      }

      case "pincode": {

        const val = String(value || "").trim();

        if (!val) return "Please enter your 6-digit PIN code.";

        if (!/^\d{6}$/.test(val)) return "PIN code must be exactly 6 digits.";

        if (val.startsWith("0")) return "PIN code cannot start with 0.";



        const state = currentFormData.state;

        if (state && STATE_PIN_PREFIXES[state]) {

          const validStatePrefixes = STATE_PIN_PREFIXES[state];

          const matchesState = validStatePrefixes.some((pref) => val.startsWith(pref));

          if (!matchesState) {

            return `PIN code does not match ${state} (valid prefixes: ${validStatePrefixes.join(", ")}).`;

          }

        }



        const district = currentFormData.district;

        if (district && district !== "Other District" && DISTRICT_PIN_PREFIXES[district]) {

          const validDistPrefixes = DISTRICT_PIN_PREFIXES[district];

          const matchesDist = validDistPrefixes.some((pref) => val.startsWith(pref));

          if (!matchesDist) {

            return `PIN code does not match ${district} (valid prefix: ${validDistPrefixes.join(", ")}).`;

          }

        }

        return "";

      }

      case "wing": {

        if (!value) return "Please choose your primary MSD Wing.";

        return "";

      }

      case "pledgeAccepted": {

        if (!value) return "Please accept the Maha Seva Dal 1947 Seva Pledge.";

        return "";

      }

      case "termsAccepted": {

        if (!value) return "Please agree to the Terms & Conditions and Privacy Policy.";

        return "";

      }

      default:

        return "";

    }

  };



  const isFieldInvalid = (field: string) => Boolean(fieldErrors[field] && touchedFields[field]);



  const getInputClass = (field: string, extraClasses = "") =>

    `w-full text-sm px-3.5 py-2.5 rounded-lg border transition-colors ${

      isFieldInvalid(field)

        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-ink"

        : "border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200]"

    } ${extraClasses}`;



  const renderFieldError = (field: string) => {

    if (!isFieldInvalid(field)) return null;

    return (

      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fade-in">

        <AlertCircle size={12} className="flex-shrink-0" />

        <span>{fieldErrors[field]}</span>

      </p>

    );

  };



  const handleBlur = (field: string) => {

    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    const val = field === "customDistrict" ? customDistrict : formData[field as keyof typeof formData];

    const err = validateField(field, val);

    setFieldErrors((prev) => {

      const next = { ...prev };

      if (err) next[field] = err;

      else delete next[field];

      return next;

    });



    if (field === "mobile") {

      const clean = String(val || "").trim();

      if (clean.length < 10) {

        setExistingMemberFound(null);

      }

      // Re-validate emergencyNumber if already filled

      if (formData.emergencyNumber) {

        const emErr = validateField("emergencyNumber", formData.emergencyNumber, {

          ...formData,

          mobile: clean,

        });

        setFieldErrors((prev) => {

          const next = { ...prev };

          if (emErr) next.emergencyNumber = emErr;

          else if (next.emergencyNumber && next.emergencyNumber.includes("cannot be the same")) {

            delete next.emergencyNumber;

          }

          return next;

        });

      }

    }

  };



  // Only align scroll upon final application submission so acknowledgment receipt is cleanly at the top of the viewport

  useLayoutEffect(() => {

    if (registeredMember) {

      window.scrollTo({

        top: 0,

        behavior: "instant",

      });

    }

  }, [registeredMember]);



  // Prevent accidental instant submit when arriving on slide 4

  useEffect(() => {

    if (step === 4) {

      setCanSubmit(false);

      const timer = setTimeout(() => {

        setCanSubmit(true);

      }, 500);

      return () => clearTimeout(timer);

    } else {

      setCanSubmit(false);

    }

  }, [step]);



  const handleDobSelect = (part: "day" | "month" | "year", value: string) => {

    const newDay = part === "day" ? value : dobDay;

    const newMonth = part === "month" ? value : dobMonth;

    const newYear = part === "year" ? value : dobYear;



    if (part === "day") setDobDay(value);

    if (part === "month") setDobMonth(value);

    if (part === "year") setDobYear(value);



    let combined = "";

    if (newDay && newMonth && newYear) {

      const maxDays = getDaysInMonth(newYear, newMonth);

      const validDay = parseInt(newDay, 10) > maxDays ? String(maxDays).padStart(2, "0") : newDay;

      if (validDay !== newDay) {

        setDobDay(validDay);

      }

      combined = `${newYear}-${newMonth.padStart(2, "0")}-${validDay.padStart(2, "0")}`;

      setFormData((prev) => ({ ...prev, dob: combined }));

    } else {

      setFormData((prev) => ({ ...prev, dob: "" }));

    }



    if (touchedFields.dob || (newDay && newMonth && newYear)) {

      setTouchedFields((prev) => ({ ...prev, dob: true }));

      const dobErr = validateField("dob", combined);

      setFieldErrors((prev) => {

        const next = { ...prev };

        if (dobErr) next.dob = dobErr;

        else delete next.dob;

        return next;

      });

    }

  };



  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const val = e.target.value;

    if (val) {

      const [y, m, d] = val.split("-");

      setDobYear(y || "");

      setDobMonth(m || "");

      setDobDay(d || "");

      setFormData((prev) => ({ ...prev, dob: val }));

    } else {

      setDobYear("");

      setDobMonth("");

      setDobDay("");

      setFormData((prev) => ({ ...prev, dob: "" }));

    }



    if (touchedFields.dob || val) {

      setTouchedFields((prev) => ({ ...prev, dob: true }));

      const dobErr = validateField("dob", val);

      setFieldErrors((prev) => {

        const next = { ...prev };

        if (dobErr) next.dob = dobErr;

        else delete next.dob;

        return next;

      });

    }

  };



  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {

    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {

      e.preventDefault();

      if (step < 4) {

        handleNext();

      }

    }

  };



  useEffect(() => {

    if (urlQuery) {

      setActiveTab("status");

      fetchStatus(urlQuery);

    }

  }, []);



  const handleCopyId = (text: string) => {

    if (navigator.clipboard) {

      navigator.clipboard.writeText(text);

      setCopiedId(true);

      setTimeout(() => setCopiedId(false), 2500);

    }

  };



  const handleDownloadReceiptPdf = async (memberData?: any) => {

    const targetMember =

      memberData && typeof memberData === "object" && typeof memberData.registrationId === "string"

        ? memberData

        : registeredMember;



    if (!targetMember || !targetMember.registrationId) {

      console.warn("No valid member found to download receipt PDF");

      return;

    }



    try {

      const doc = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4",

      });



      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();



      // Outer border

      doc.setDrawColor(234, 88, 12);

      doc.setLineWidth(1.2);

      doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 4, 4, "S");



      // Header Brand

      doc.setFont("helvetica", "bold");

      doc.setFontSize(22);

      doc.setTextColor(234, 88, 12);

      doc.text("MAHA SEVA DAL", 18, 26);



      doc.setFont("helvetica", "normal");

      doc.setFontSize(9.5);

      doc.setTextColor(115, 107, 94);

      doc.text("Estd. 1947 · National Cadre Enrollment Registry", 18, 32);



      doc.setFont("helvetica", "bold");

      doc.setFontSize(10.5);

      doc.setTextColor(40, 36, 32);

      doc.text("Official Application Acknowledgment Receipt", 18, 38.5);



      // Photo (top right)

      let photoData = "";

      const photoSrc = targetMember.photoUrl || photoPreview;

      if (photoSrc) {

        try {

          if (typeof photoSrc === "string" && photoSrc.startsWith("data:")) {

            photoData = photoSrc;

          } else if (typeof photoSrc === "string") {

            const proxyUrl = photoSrc.startsWith("http")

              ? getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(photoSrc)}`)

              : photoSrc;



            const img = new Image();

            img.crossOrigin = "anonymous";

            const loaded = await new Promise<boolean>((resolve) => {

              const timer = setTimeout(() => resolve(false), 2000);

              img.onload = () => {

                clearTimeout(timer);

                resolve(true);

              };

              img.onerror = () => {

                clearTimeout(timer);

                resolve(false);

              };

              img.src = proxyUrl;

            });

            if (loaded && img.width > 0 && img.height > 0) {

              const canvas = document.createElement("canvas");

              canvas.width = img.width;

              canvas.height = img.height;

              const ctx = canvas.getContext("2d");

              if (ctx) {

                ctx.drawImage(img, 0, 0);

                photoData = canvas.toDataURL("image/jpeg", 0.9);

              }

            }

          }

        } catch (e) {

          console.warn("Could not load photo for receipt PDF:", e);

        }

      }



      if (photoData) {

        try {

          doc.addImage(photoData, "JPEG", pageWidth - 46, 18, 28, 34);

          doc.setDrawColor(209, 213, 219);

          doc.setLineWidth(0.3);

          doc.rect(pageWidth - 46, 18, 28, 34, "S");

        } catch (e) {

          photoData = "";

        }

      }



      if (!photoData) {

        doc.setFillColor(250, 250, 249);

        doc.setDrawColor(209, 213, 219);

        doc.setLineWidth(0.3);

        doc.rect(pageWidth - 46, 18, 28, 34, "FD");

        doc.setFont("helvetica", "normal");

        doc.setFontSize(7.5);

        doc.setTextColor(156, 163, 175);

        doc.text("Photo Attached", pageWidth - 32, 35, { align: "center" });

      }



      // Divider line

      doc.setDrawColor(254, 215, 170);

      doc.setLineWidth(0.6);

      doc.line(18, 56, pageWidth - 18, 56);



      // Registration ID strip

      doc.setFillColor(255, 247, 237);

      doc.setDrawColor(255, 237, 213);

      doc.setLineWidth(0.4);

      doc.roundedRect(18, 60, pageWidth - 36, 20, 3, 3, "FD");



      doc.setFont("helvetica", "bold");

      doc.setFontSize(8);

      doc.setTextColor(154, 52, 18);

      doc.text("OFFICIAL REGISTRATION NUMBER", 24, 67);



      doc.setFont("courier", "bold");

      doc.setFontSize(16);

      doc.setTextColor(234, 88, 12);

      doc.text(String(targetMember.registrationId || "—"), 24, 75);



      // Status Tag

      doc.setFillColor(254, 243, 199);

      doc.setDrawColor(253, 230, 138);

      doc.roundedRect(pageWidth - 68, 65, 44, 9, 4, 4, "FD");

      doc.setFont("helvetica", "bold");

      doc.setFontSize(7.5);

      doc.setTextColor(146, 64, 14);

      doc.text("PENDING VERIFICATION", pageWidth - 46, 71, { align: "center" });



      // 10 Details Cards (2 cols x 5 rows)

      const colW = (pageWidth - 44) / 2;

      const startX = 18;

      const startY = 86;

      const cardH = 20;

      const gapY = 5;



      const items = [

        { label: "APPLICANT NAME", val: targetMember.fullName },

        { label: "ASSIGNED CADRE WING", val: targetMember.wing, color: [234, 88, 12] },

        {

          label: "DISTRICT & STATE",

          val: targetMember.district

            ? `${targetMember.district}, ${targetMember.state}`

            : targetMember.state,

        },

        { label: "PRIMARY MOBILE", val: targetMember.mobile },

        {

          label: "ASSEMBLY CONSTITUENCY",

          val: targetMember.assembly || "—",

        },

        {

          label: "ZONE / REGION",

          val: targetMember.zone || "—",

        },

        {

          label: "DATE OF BIRTH",

          val: targetMember.dob ? formatDobDisplay(targetMember.dob) : "—",

        },

        {

          label: "BLOOD GROUP",

          val:

            targetMember.bloodGroup && targetMember.bloodGroup !== "Not Specified"

              ? targetMember.bloodGroup

              : "—",

        },

        { label: "FATHER'S / SPOUSE NAME", val: targetMember.fatherName || "—" },

        {

          label: "SUBMISSION DATE",

          val: new Date(targetMember.createdAt || Date.now()).toLocaleDateString("en-IN", {

            day: "2-digit",

            month: "short",

            year: "numeric",

          }),

        },

      ];



      items.forEach((item, idx) => {

        const col = idx % 2;

        const row = Math.floor(idx / 2);

        const x = startX + col * (colW + 8);

        const y = startY + row * (cardH + gapY);



        doc.setFillColor(250, 250, 249);

        doc.setDrawColor(231, 229, 228);

        doc.setLineWidth(0.3);

        doc.roundedRect(x, y, colW, cardH, 2, 2, "FD");



        doc.setFont("helvetica", "bold");

        doc.setFontSize(7.5);

        doc.setTextColor(120, 113, 108);

        doc.text(item.label, x + 5, y + 6);



        doc.setFont("helvetica", "bold");

        const valStr = String(item.val || "—");

        doc.setFontSize(valStr.length > 28 ? 9 : 10.5);

        if (item.color) {

          doc.setTextColor(item.color[0], item.color[1], item.color[2]);

        } else {

          doc.setTextColor(28, 25, 23);

        }

        const maxW = colW - 10;

        const lineVal = doc.splitTextToSize(valStr, maxW)[0] || valStr;

        doc.text(lineVal, x + 5, y + 15);

      });



      // Cadre Notice Box (Strictly below row 3 - Zero overlap!)

      const totalRows = Math.ceil(items.length / 2);

      const noticeY = startY + totalRows * (cardH + gapY) + 6;

      doc.setFillColor(239, 246, 255);

      doc.setDrawColor(191, 219, 254);

      doc.setLineWidth(0.4);

      doc.roundedRect(18, noticeY, pageWidth - 36, 34, 3, 3, "FD");



      doc.setFont("helvetica", "bold");

      doc.setFontSize(8.5);

      doc.setTextColor(30, 58, 138);

      doc.text("Official Cadre Notice:", 24, noticeY + 8);



      doc.setFont("helvetica", "normal");

      doc.setFontSize(8);

      doc.setTextColor(30, 64, 175);

      const noticeText =

        "This acknowledgment receipt confirms submission of your cadre enrollment application. In accordance with Maha Seva Dal bylaws, official PVC Digital Identity Cards and card download options are unlocked only after administrative committee verification and approval. No ID card is issued at the time of registration.";

      const splitNotice = doc.splitTextToSize(noticeText, pageWidth - 48);

      doc.text(splitNotice, 24, noticeY + 15);



      // Footer Strip

      const footerY = pageHeight - 20;

      doc.setDrawColor(229, 231, 235);

      doc.setLineWidth(0.4);

      doc.line(18, footerY - 5, pageWidth - 18, footerY - 5);



      doc.setFont("helvetica", "normal");

      doc.setFontSize(8);

      doc.setTextColor(120, 113, 108);

      doc.text("Maha Seva Dal · National Cadre Registry", 18, footerY);

      doc.text(

        `Generated on: ${new Date().toLocaleDateString("en-IN", {

          day: "2-digit",

          month: "short",

          year: "numeric",

          hour: "2-digit",

          minute: "2-digit",

        })}`,

        pageWidth - 18,

        footerY,

        { align: "right" }

      );



      doc.save(`MSD-Receipt-${targetMember.registrationId}.pdf`);

    } catch (err: any) {

      console.error("PDF download error:", err);

    }

  };



  const handlePrintReceipt = (memberData?: any) => {

    const targetMember =

      memberData && typeof memberData === "object" && typeof memberData.registrationId === "string"

        ? memberData

        : registeredMember;

    if (!targetMember || !targetMember.registrationId) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");

    if (!printWindow) {

      window.print();

      return;

    }



    const photoHtml = targetMember.photoUrl || photoPreview

      ? `<img src="${targetMember.photoUrl || photoPreview}" alt="${targetMember.fullName}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #d1d5db;" />`

      : `<div style="width: 100px; height: 100px; border-radius: 8px; border: 1px dashed #9ca3af; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #6b7280; text-align: center;">Photo Attached</div>`;



    const appDate = new Date(targetMember.createdAt || Date.now()).toLocaleDateString("en-IN", {

      day: "2-digit",

      month: "short",

      year: "numeric",

    });



    const receiptHtml = `<!DOCTYPE html>

<html lang="en">

  <head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>MSD Application Receipt - ${targetMember.registrationId}</title>

    <style>

      @page {

        size: A4 portrait;

        margin: 10mm;

      }

      * {

        box-sizing: border-box;

        -webkit-print-color-adjust: exact !important;

        print-color-adjust: exact !important;

        -webkit-font-smoothing: subpixel-antialiased !important;

        text-rendering: optimizeLegibility !important;

      }

      body {

        font-family: Calibri, 'Trebuchet MS', 'Segoe UI', Candara, Arial, sans-serif;

        color: #1c1917;

        margin: 0;

        padding: 20px;

        background: #ffffff;

        font-size: 14px;

        line-height: 1.55;

        letter-spacing: normal;

      }

      p, span, div, strong, blockquote {

        -webkit-text-stroke: 0.04px transparent;

      }

      .receipt-box {

        max-width: 680px;

        margin: 0 auto;

        border: 2px solid #ea580c;

        border-radius: 12px;

        padding: 28px;

        background: #ffffff;

      }

      .header {

        display: flex;

        align-items: center;

        justify-content: space-between;

        border-bottom: 2px solid #fed7aa;

        padding-bottom: 18px;

        margin-bottom: 20px;

      }

      .header-text h1 {

        margin: 0;

        font-size: 22px;

        color: #ea580c;

        text-transform: uppercase;

        font-weight: 700;

        letter-spacing: normal;

      }

      .header-text p {

        margin: 4px 0 0;

        font-size: 13px;

        color: #57534e;

        font-weight: 400;

        letter-spacing: normal;

      }

      .tag {

        display: inline-block;

        background: #fef3c7;

        color: #92400e;

        border: 1px solid #fde68a;

        padding: 5px 12px;

        border-radius: 9999px;

        font-size: 11px;

        font-weight: 700;

        text-transform: uppercase;

        letter-spacing: normal;

      }

      .reg-strip {

        background: #fff7ed;

        border: 1px solid #ffedd5;

        border-radius: 8px;

        padding: 12px 16px;

        display: flex;

        justify-content: space-between;

        align-items: center;

        margin-bottom: 20px;

      }

      .reg-label {

        font-size: 11px;

        text-transform: uppercase;

        color: #9a3412;

        font-weight: 700;

        letter-spacing: normal;

      }

      .reg-id {

        font-size: 20px;

        font-family: "Courier New", Courier, monospace;

        font-weight: 700;

        color: #ea580c;

        margin-top: 2px;

      }

      .grid {

        display: grid;

        grid-template-columns: 1fr 1fr;

        gap: 14px;

        margin-bottom: 20px;

      }

      .item {

        background: #fafaf9;

        border: 1px solid #e7e5e4;

        border-radius: 8px;

        padding: 11px 14px;

      }

      .item-label {

        font-size: 11px;

        text-transform: uppercase;

        color: #57534e;

        font-weight: 700;

        margin-bottom: 4px;

        letter-spacing: normal;

      }

      .item-value {

        font-size: 14.5px;

        font-weight: 700;

        color: #1c1917;

        letter-spacing: normal;

      }

      .notice {

        background: #eff6ff;

        border: 1px solid #bfdbfe;

        border-radius: 8px;

        padding: 14px 16px;

        font-size: 13px;

        color: #1e3a8a;

        line-height: 1.6;

        margin-bottom: 20px;

        letter-spacing: normal;

      }

      .footer-strip {

        display: flex;

        justify-content: space-between;

        align-items: center;

        border-top: 1px solid #e5e7eb;

        padding-top: 12px;

        font-size: 11.5px;

        color: #78716c;

        font-weight: 400;

        letter-spacing: normal;

      }

    </style>

  </head>

  <body>

    <div class="receipt-box">

      <div class="header">

        <div class="header-text">

          <h1>Maha Seva Dal</h1>

          <p>Estd. 1947 · National Cadre Enrollment Registry</p>

          <p style="margin-top: 6px; font-size: 13px; color: #44403c; font-weight: 700;">Official Application Acknowledgment Receipt</p>

        </div>

        <div>${photoHtml}</div>

      </div>



      <div class="reg-strip">

        <div>

          <div class="reg-label">Official Registration Number</div>

          <div class="reg-id">${targetMember.registrationId}</div>

        </div>

        <div class="tag">Pending Verification</div>

      </div>



      <div class="grid">

        <div class="item">

          <div class="item-label">Applicant Name</div>

          <div class="item-value">${targetMember.fullName}</div>

        </div>

        <div class="item">

          <div class="item-label">Assigned Cadre Wing</div>

          <div class="item-value" style="color: #ea580c;">${targetMember.wing}</div>

        </div>

        <div class="item">

          <div class="item-label">State & District</div>

          <div class="item-value">${targetMember.district ? `${targetMember.district}, ${targetMember.state}` : targetMember.state}</div>

        </div>

        <div class="item">

          <div class="item-label">Primary Mobile</div>

          <div class="item-value">${targetMember.mobile}</div>

        </div>

        <div class="item">

          <div class="item-label">Assembly Constituency</div>

          <div class="item-value">${targetMember.assembly || "—"}</div>

        </div>

        <div class="item">

          <div class="item-label">Zone / Region</div>

          <div class="item-value">${targetMember.zone || "—"}</div>

        </div>

        <div class="item">

          <div class="item-label">Date of Birth</div>

          <div class="item-value">${targetMember.dob ? formatDobDisplay(targetMember.dob) : "—"}</div>

        </div>

        <div class="item">

          <div class="item-label">Blood Group</div>

          <div class="item-value">${targetMember.bloodGroup && targetMember.bloodGroup !== "Not Specified" ? targetMember.bloodGroup : "—"}</div>

        </div>

        <div class="item">

          <div class="item-label">Father's / Spouse Name</div>

          <div class="item-value">${targetMember.fatherName || "—"}</div>

        </div>

        <div class="item">

          <div class="item-label">Submission Date</div>

          <div class="item-value">${appDate}</div>

        </div>

      </div>



      <div class="notice">

        <strong>Official Cadre Notice:</strong> This acknowledgment receipt confirms submission of your cadre enrollment application. In accordance with Maha Seva Dal bylaws, official PVC Digital Identity Cards and card download options are unlocked <strong>only after administrative committee verification and approval</strong>. No ID card is issued at the time of registration.

      </div>



      <div class="footer-strip">

        <span>Maha Seva Dal · National Cadre Registry</span>

        <span>Generated on: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>

      </div>

    </div>

    <script>

      function doPrint() {

        setTimeout(function() {

          window.focus();

          window.print();

        }, 300);

      }

      if (document.readyState === "complete") {

        doPrint();

      } else {

        window.addEventListener("load", doPrint);

      }

    </script>

  </body>

</html>`;



    printWindow.document.open();

    printWindow.document.write(receiptHtml);

    printWindow.document.close();

  };



  // Helper to normalize phone / registration input and handle paste without truncation

  const cleanStatusInput = (raw: string): string => {

    const text = raw.trim();

    // If it looks like a phone number (contains digits, optional +91, spaces, hyphens)

    if (/^[\d\s+\-()]+$/.test(text)) {

      let digits = text.replace(/[\s\-()]/g, "");

      if (digits.startsWith("+91")) digits = digits.slice(3);

      if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);

      if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);

      // If purely numeric, cap to 10 digits

      if (/^\d+$/.test(digits)) {

        return digits.slice(0, 10);

      }

    }

    // Otherwise keep as Registration ID string (e.g. MSD-MH-2026-0001)

    return text.slice(0, 35);

  };



  const handleStatusInputChange = (val: string) => {

    setStatusError("");

    setStatusQuery(cleanStatusInput(val));

  };



  const handleStatusPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {

    e.preventDefault();

    const pasted = e.clipboardData.getData("text") || "";

    const cleaned = cleanStatusInput(pasted);

    setStatusQuery(cleaned);

    setStatusError("");

  };



  const fetchStatus = async (overrideQuery?: string) => {

    const raw = (overrideQuery !== undefined ? overrideQuery : statusQuery).trim();

    if (!raw) {

      setStatusError("Please enter your Registration ID or 10-digit mobile number.");

      return;

    }



    // Clean phone input if formatted with +91, leading 0, spaces, or hyphens

    let cleanPhone = raw.replace(/[\s\-()]/g, "");

    if (cleanPhone.startsWith("+91")) cleanPhone = cleanPhone.slice(3);

    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2);

    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) cleanPhone = cleanPhone.slice(1);



    const isNumeric = /^\d+$/.test(cleanPhone);

    let queryParam = raw;



    if (isNumeric) {

      if (cleanPhone.length !== 10) {

        setStatusError(`Mobile number must be exactly 10 digits. Received ${cleanPhone.length} digits.`);

        return;

      }

      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {

        setStatusError("Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");

        return;

      }

      queryParam = cleanPhone;

    } else {

      if (raw.length < 4) {

        setStatusError("Please enter a valid Registration ID (e.g. MSD-...).");

        return;

      }

    }



    setStatusLoading(true);

    setStatusError("");

    setStatusResult(null);

    setStatusQrUrl("");



    try {

      const res = await fetch(

        getApiUrl(`/api/members/status?query=${encodeURIComponent(queryParam)}`)

      );

      const json = await res.json();

      if (!res.ok) {

        throw new Error(json.error || "No member application found with the given details.");

      }



      setStatusResult(json.member);



      // If member is APPROVED, generate QR code for the ID card

      if (json.member.status === "APPROVED") {

        const qrText = `https://mahasevadal.com/verify?id=${json.member.registrationId}&name=${encodeURIComponent(

          json.member.fullName

        )}&wing=${encodeURIComponent(json.member.wing)}`;

        const qr = await QRCode.toDataURL(qrText, { width: 180, margin: 1 });

        setStatusQrUrl(qr);

      }

    } catch (err: any) {

      setStatusError(err.message || "Failed to check member status. Please try again.");

    } finally {

      setStatusLoading(false);

    }

  };



  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const newState = e.target.value;

    const defaultZone = getDefaultZoneForState(newState);

    setFormData((prev) => ({

      ...prev,

      state: newState,

      district: "",

    }));

    setCustomDistrict("");

    setCustomAssembly("");

    setCustomZone("");

    setTouchedFields((prev) => ({ ...prev, state: true, district: false }));

    const err = validateField("state", newState);

    setFieldErrors((prev) => {

      const next = { ...prev };

      if (err) next.state = err;

      else delete next.state;

      delete next.district;

      delete next.customDistrict;

      return next;

    });



    if (formData.pincode && touchedFields.pincode) {

      const pinErr = validateField("pincode", formData.pincode, {

        ...formData,

        state: newState,

        district: "",

      });

      setFieldErrors((prev) => {

        const next = { ...prev };

        if (pinErr) next.pincode = pinErr;

        else delete next.pincode;

        return next;

      });

    }

  };



  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const newDistrict = e.target.value;

    const defaultZone = getDefaultZoneForDistrict(formData.state, newDistrict);

    setFormData((prev) => ({

      ...prev,

      district: newDistrict,

    }));

    if (newDistrict !== "Other District") {

      setCustomDistrict("");

    }

    setCustomAssembly("");

    setTouchedFields((prev) => ({ ...prev, district: true }));

    const err = validateField("district", newDistrict);

    setFieldErrors((prev) => {

      const next = { ...prev };

      if (err) next.district = err;

      else delete next.district;

      if (newDistrict !== "Other District") {

        delete next.customDistrict;

      }

      return next;

    });



    if (formData.pincode && touchedFields.pincode) {

      const pinErr = validateField("pincode", formData.pincode, {

        ...formData,

        district: newDistrict,

      });

      setFieldErrors((prev) => {

        const next = { ...prev };

        if (pinErr) next.pincode = pinErr;

        else delete next.pincode;

        return next;

      });

    }

  };



  const handleInputChange = (

    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

  ) => {

    const { name } = e.target;

    let { value } = e.target;



    // Strict numerical & character filtering while typing

    if (name === "mobile" || name === "whatsapp" || name === "emergencyNumber") {

      value = value.replace(/\D/g, "").slice(0, 10);

    } else if (name === "pincode") {

      value = value.replace(/\D/g, "").slice(0, 6);

    } else if (name === "fullName" || name === "fatherName") {

      value = value.replace(/[^a-zA-Z\s]/g, "");

    }



    const shouldCapitalize =

      name === "fullName" ||

      name === "fatherName" ||

      name === "taluk" ||

      name === "profession" ||

      name === "address";



    const formattedValue = shouldCapitalize ? capitalizeLive(value) : value;



    setFormData((prev) => {

      const next = { ...prev, [name]: formattedValue };

      if (name === "mobile" && sameAsMobile) {

        next.whatsapp = formattedValue;

      }

      return next;

    });



    if (name === "mobile") {

      if (existingMemberFound) {

        setExistingMemberFound(null);

      }

      setFieldErrors((prev) => {

        const next = { ...prev };

        if (next.mobile && next.mobile.includes("already registered")) {

          delete next.mobile;

        }

        // Cross-validate emergency number if entered

        if (formData.emergencyNumber && formData.emergencyNumber === formattedValue) {

          next.emergencyNumber = "Emergency contact number cannot be the same as primary mobile number.";

        } else if (next.emergencyNumber && next.emergencyNumber.includes("cannot be the same")) {

          delete next.emergencyNumber;

        }

        return next;

      });

    }



    if (name === "emergencyNumber") {

      if (formData.mobile && formattedValue === formData.mobile) {

        setFieldErrors((prev) => ({

          ...prev,

          emergencyNumber: "Emergency contact number cannot be the same as primary mobile number.",

        }));

      } else if (fieldErrors.emergencyNumber && fieldErrors.emergencyNumber.includes("cannot be the same")) {

        setFieldErrors((prev) => {

          const next = { ...prev };

          delete next.emergencyNumber;

          return next;

        });

      }

    }



    // Real-time error clearance/update as the user fills in details

    if (touchedFields[name]) {

      const updatedData = { ...formData, [name]: formattedValue };

      const err = validateField(name, formattedValue, updatedData);

      setFieldErrors((prev) => {

        const next = { ...prev };

        if (err) next[name] = err;

        else delete next[name];

        return next;

      });

    }

  };



  const handleTitleCaseBlur = (field: keyof typeof formData) => {

    setFormData((prev) => ({

      ...prev,

      [field]: normalizeTitleCase(String(prev[field] || "")),

    }));

    handleBlur(field as string);

  };



  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];

      e.target.value = "";



      // Allowed formats: JPG / JPEG and PNG

      const ext = ("." + (file.name.split(".").pop() || "")).toLowerCase();

      const mime = (file.type || "").toLowerCase();

      const allowedExts = [".jpg", ".jpeg", ".png"];

      const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];



      const isFormatValid = allowedExts.includes(ext) || allowedMimes.includes(mime);

      if (!isFormatValid) {

        setFieldErrors((prev) => ({

          ...prev,

          photo: "Please upload a JPG or PNG photo.",

        }));

        setTouchedFields((prev) => ({ ...prev, photo: true }));

        return;

      }



      // Max file size: 5 MB (5 * 1024 * 1024 bytes)

      if (file.size > 5 * 1024 * 1024) {

        setFieldErrors((prev) => ({

          ...prev,

          photo: "This file is too big. Please choose a photo under 5 MB.",

        }));

        setTouchedFields((prev) => ({ ...prev, photo: true }));

        return;

      }



      setRawPhotoName(file.name);

      setPhotoFile(file);

      setTouchedFields((prev) => ({ ...prev, photo: true }));

      setFieldErrors((prev) => {

        const next = { ...prev };

        delete next.photo;

        return next;

      });

      const reader = new FileReader();

      reader.onload = () => {

        if (typeof reader.result === "string") {

          setPhotoPreview(reader.result);

          setRawPhotoSrc(reader.result);

          setCropModalOpen(true);

        }

      };

      reader.readAsDataURL(file);

    }

  };



  const handleCropComplete = (croppedBlob: Blob, croppedDataUrl: string) => {

    const cleanName = rawPhotoName.replace(/\.[^/.]+$/, "") + "_cropped.jpg";

    const file = new File([croppedBlob], cleanName, { type: "image/jpeg" });

    setPhotoFile(file);

    setPhotoPreview(croppedDataUrl);

    setCropModalOpen(false);

    setTouchedFields((prev) => ({ ...prev, photo: true }));

    setFieldErrors((prev) => {

      const next = { ...prev };

      delete next.photo;

      return next;

    });

  };



  const handleRemovePhoto = () => {

    setPhotoFile(null);

    setPhotoPreview(null);

    setRawPhotoSrc(null);

    setTouchedFields((prev) => ({ ...prev, photo: true }));

    setFieldErrors((prev) => ({

      ...prev,

      photo: "Passport photograph is required.",

    }));

  };



  const validateStep = (currentStep: number) => {

    setErrorMsg("");

    const newErrors: Record<string, string> = {};

    const newTouched: Record<string, boolean> = { ...touchedFields };



    if (currentStep === 1) {

      const step1Fields = [

        "photo",

        "fullName",

        "fatherName",

        "dob",

        "gender",

        "mobile",

        "whatsapp",

        "emergencyNumber",

        "emergencyRelation",

        "email",

      ];

      step1Fields.forEach((field) => {

        newTouched[field] = true;

        let val = formData[field as keyof typeof formData];

        if (field === "photo") val = (photoFile || photoPreview) as any;

        const err = validateField(field, val);

        if (err) newErrors[field] = err;

      });

    }



    if (currentStep === 2) {

      const step2Fields = ["state", "district", "address", "pincode"];

      step2Fields.forEach((field) => {

        newTouched[field] = true;

        const err = validateField(field, formData[field as keyof typeof formData]);

        if (err) newErrors[field] = err;

      });

      if (formData.district === "Other District") {

        newTouched["customDistrict"] = true;

        const customErr = validateField("customDistrict", customDistrict);

        if (customErr) newErrors["customDistrict"] = customErr;

      }

    }



    if (currentStep === 3) {

      newTouched["wing"] = true;

      const wingErr = validateField("wing", formData.wing);

      if (wingErr) newErrors["wing"] = wingErr;

    }



    if (currentStep === 4) {

      newTouched["pledgeAccepted"] = true;

      newTouched["termsAccepted"] = true;

      const pledgeErr = validateField("pledgeAccepted", formData.pledgeAccepted);

      if (pledgeErr) newErrors["pledgeAccepted"] = pledgeErr;

      const termsErr = validateField("termsAccepted", formData.termsAccepted);

      if (termsErr) newErrors["termsAccepted"] = termsErr;

    }



    setTouchedFields(newTouched);

    setFieldErrors((prev) => ({ ...prev, ...newErrors }));



    const firstError = Object.values(newErrors)[0];

    return firstError || null;

  };



  const validateAllSteps = () => {

    for (let s = 1; s <= 4; s++) {

      const err = validateStep(s);

      if (err) {

        setStep(s);

        return err;

      }

    }

    return null;

  };



  const scrollToCardTop = () => {

    setTimeout(() => {

      if (formCardRef.current) {

        if ((window as any).lenis && typeof (window as any).lenis.scrollTo === "function") {

          (window as any).lenis.scrollTo(formCardRef.current, { offset: -85, duration: 0.6 });

        } else {

          const cardTop = formCardRef.current.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({

            top: Math.max(0, cardTop - 85),

            behavior: "smooth",

          });

        }

      }

    }, 30);

  };



  const scrollToNotification = () => {

    setTimeout(() => {

      const banner = errorBannerRef.current || document.getElementById("registration-error-banner");

      if (banner) {

        if ((window as any).lenis && typeof (window as any).lenis.scrollTo === "function") {

          (window as any).lenis.scrollTo(banner, { offset: -110, duration: 0.7 });

        } else {

          const bannerRect = banner.getBoundingClientRect();

          const targetY = bannerRect.top + window.scrollY - 110;

          window.scrollTo({

            top: Math.max(0, targetY),

            behavior: "smooth",

          });

        }

        try {

          banner.focus({ preventScroll: true });

        } catch (_) {}

      } else if (formCardRef.current) {

        scrollToCardTop();

      }

    }, 60);

  };



  // Automatically smooth-scroll to error notification banner whenever an error message is populated

  useEffect(() => {

    if (errorMsg) {

      scrollToNotification();

    }

  }, [errorMsg]);



  const handleNext = async () => {

    const error = validateStep(step);

    if (error) {

      setErrorMsg(error);

      scrollToNotification();

      return;

    }



    // On Step 1, verify mobile format and check duplicate registration before proceeding

    if (step === 1) {

      if (formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile)) {

        setErrorMsg("Please enter a valid 10-digit Indian mobile number.");

        scrollToNotification();

        return;

      }

      if (existingMemberFound) {

        setErrorMsg("This mobile number is already registered.");

        scrollToNotification();

        return;

      }

      if (formData.mobile && /^[6-9]\d{9}$/.test(formData.mobile)) {

        const isDuplicate = await checkMobileAvailability(formData.mobile);

        if (isDuplicate) {

          setErrorMsg("This mobile number is already registered.");

          scrollToNotification();

          return;

        }

      }

    }



    setErrorMsg("");

    const currentStep = step;

    setStep((s) => Math.min(s + 1, 4));

    // Track lead drop-off progress asynchronously for Incomplete Leads recovery CRM

    const cleanPhone = (formData.mobile || "").replace(/\D/g, "");

    if (cleanPhone.length >= 10) {

      const stepMap: Record<number, { code: string; label: string }> = {

        1: { code: "WEB_STEP_1_PROFILE", label: "Web Step 1: Personal Profile" },

        2: { code: "WEB_STEP_2_ADDRESS", label: "Web Step 2: Emergency Contact & Address" },

        3: { code: "WEB_STEP_3_WING", label: "Web Step 3: Seva Wing & Photo Upload" },

      };

      const info = stepMap[currentStep] || { code: `WEB_STEP_${currentStep}`, label: `Web Step ${currentStep}` };

      fetch(getApiUrl("/api/leads/track"), {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          mobile: cleanPhone.slice(-10),

          fullName: formData.fullName || "Volunteer Cadre",

          channel: "web",

          lastStepCompleted: info.code,

          lastStepLabel: info.label,

          partialData: {

            state: formData.state,

            district: formData.district,

            wing: formData.wing,

            dob: formData.dob,

            gender: formData.gender,

          },

        }),

      }).catch(() => {});

    }

    scrollToCardTop();

  };



  const handleBack = () => {

    setErrorMsg("");

    setStep((s) => Math.max(s - 1, 1));

    scrollToCardTop();

  };



  const resetForm = () => {

    setFormData({

      fullName: "",

      fatherName: "",

      dob: "",

      gender: "",

      mobile: "",

      whatsapp: "",

      emergencyNumber: "",

      emergencyRelation: "",

      email: "",

      bloodGroup: "",

      state: "",

      district: "",

      assembly: "",

      zone: "",

      taluk: "",

      address: "",

      pincode: "",

      profession: "",

      wing: "Legal Wing",

      pledgeAccepted: false,

      termsAccepted: false,

    });

    setDobDay("");

    setDobMonth("");

    setDobYear("");

    setCustomDistrict("");

    setSameAsMobile(false);

    setPhotoFile(null);

    setPhotoPreview(null);

    setRawPhotoSrc(null);

    setFieldErrors({});

    setTouchedFields({});

    setExistingMemberFound(null);

    setCheckingMobile(false);

    setErrorMsg("");

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();



    // Guard against premature submits on earlier slides (e.g. Enter press)

    if (step < 4) {

      handleNext();

      return;

    }



    // Guard against accidental double clicks during slide 3 -> 4 transition

    if (!canSubmit) {

      return;

    }



    const error = validateAllSteps();

    if (error) {

      setErrorMsg(error);

      scrollToNotification();

      return;

    }



    setLoading(true);

    setErrorMsg("");



    try {

      const finalDistrict =

        formData.district === "Other District" && customDistrict.trim()

          ? customDistrict.trim()

          : formData.district;



      const data = new FormData();

      Object.entries(formData).forEach(([key, val]) => {

        // Exclude client-only agreement flags from backend payload

        if (key === "termsAccepted") {

          return;

        }

        if (key === "district") {

          data.append(key, normalizeTitleCase(finalDistrict));

        } else if (key === "assembly") {

          data.append(key, normalizeTitleCase(String(val || "")));

        } else if (key === "zone") {

          data.append(key, String(val || "").toUpperCase().trim());

        } else if (

          key === "fullName" ||

          key === "fatherName" ||

          key === "taluk" ||

          key === "profession" ||

          key === "address"

        ) {

          data.append(key, normalizeTitleCase(String(val)));

        } else {

          data.append(key, String(val));

        }

      });

      if (photoFile) {

        data.append("photo", photoFile);

      }



      const res = await fetch(getApiUrl("/api/members/register"), {

        method: "POST",

        body: data,

      });



      const json = await res.json();

      if (!res.ok) {

        // If server sent detailed field validation errors, reflect them on inputs

        if (json.errors) {

          setFieldErrors((prev) => ({ ...prev, ...json.errors }));

          const marked: Record<string, boolean> = { ...touchedFields };

          Object.keys(json.errors).forEach((k) => (marked[k] = true));

          setTouchedFields(marked);

        }

        if (res.status === 409 || (json.error && json.error.toLowerCase().includes("already registered"))) {

          setExistingMemberFound({

            registrationId: json.existingRegistrationId || "",

            status: json.status || "PENDING",

          });

          const duplicateMsg = "This mobile number is already registered.";

          setFieldErrors((prev) => ({

            ...prev,

            mobile: duplicateMsg,

          }));

          setTouchedFields((prev) => ({ ...prev, mobile: true }));

          throw new Error(duplicateMsg);

        }

        throw new Error(json.error || "Failed to submit registration");

      }



      // Record submitted member for official acknowledgment slip

      // CRITICAL: No ID card or download options are shown at registration time!

      setRegisteredMember(json.member);



      // Mark candidate as RECOVERED in Incomplete Leads recovery CRM

      const cleanSubPhone = (formData.mobile || "").replace(/\D/g, "");

      if (cleanSubPhone.length >= 10) {

        fetch(getApiUrl("/api/leads/track"), {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({

            mobile: cleanSubPhone.slice(-10),

            fullName: formData.fullName,

            channel: "web",

            lastStepCompleted: "WEB_COMPLETED",

            lastStepLabel: "Completed & Registered (Recovered)",

            status: "RECOVERED",

          }),

        }).catch(() => {});

      }

      logActivity({

        channel: "WEB",

        component: "Register",

        action: `Cadre Registration Successful: ${json.member?.registrationId || ""}`,

        status: "PASS",

        details: { fullName: formData.fullName, mobile: formData.mobile, wing: formData.wing },

      });

      window.scrollTo({

        top: 0,

        behavior: "instant",

      });

    } catch (err: any) {

      const msg = err.message || "Network error. Please make sure backend is running.";

      setErrorMsg(msg);

      logActivity({

        channel: "WEB",

        component: "Register",

        action: `Registration Submission Failed: ${msg}`,

        status: "FAIL",

        details: { mobile: formData.mobile, wing: formData.wing },

      });

      scrollToNotification();

    } finally {

      setLoading(false);

    }

  };



  return (

    <PageLayout>

      <section className={`${registeredMember ? "py-4 sm:py-6" : "py-8 lg:py-14"} bg-canvas min-h-screen`}>

        <div className={`${activeTab === "status" ? "max-w-5xl" : "max-w-4xl"} mx-auto px-3 sm:px-6 lg:px-8 transition-all duration-300`}>

          {!registeredMember && (

            <>

              {activeTab === "register" ? (

                <PageHeader

                  category="Estd. 1947 · National Cadre Registry"

                  title="Cadre Membership Registration"

                  subtitle="Enroll as an official Maha Seva Dal member to receive your authorized national digital & PVC identity card."

                />

              ) : (

                <PageHeader

                  category="Estd. 1947 · Official Verification Portal"

                  title="National Cadre Verification"

                  subtitle="Check Membership Status & Download ID Card"

                />

              )}

            </>

          )}



          {activeTab === "register" ? (

            /* If successfully registered, show official acknowledgment slip (NO CARD, NO DOWNLOAD OPTIONS) */

            registeredMember ? (

              <div

                ref={formCardRef}

                className="bg-white border border-hairline shadow-xl rounded-2xl p-5 sm:p-7 animate-fade-in max-w-3xl mx-auto space-y-4"

              >

                {/* 1. Sleek Success Header */}

                <div className="flex items-center gap-3.5 pb-3.5 border-b border-hairline">

                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 shadow-xs">

                    <CheckCircle2 size={24} />

                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 flex-wrap">

                      <h3 className="font-serif font-bold text-base sm:text-lg text-ink leading-tight">

                        Enrollment Application Submitted!

                      </h3>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">

                        <Clock size={11} className="text-amber-600" /> Pending Committee Verification

                      </span>

                    </div>

                    <p className="text-xs text-muted-editorial mt-0.5">

                      Your cadre membership application has been received and saved in the National Cadre registry.

                    </p>

                  </div>

                </div>



                {/* 2. Official Registration Number Ribbon */}

                <div className="bg-[#fff9f4] border border-[#ffeedd] rounded-xl px-4 py-2.5 sm:py-3 flex items-center justify-between flex-wrap gap-2 shadow-2xs">

                  <div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-editorial block">

                      Official Registration Number

                    </span>

                    <span className="text-xl sm:text-2xl font-mono font-black text-[#FF6200] tracking-tight">

                      {registeredMember.registrationId}

                    </span>

                  </div>

                  <button

                    type="button"

                    onClick={() => handleCopyId(registeredMember.registrationId)}

                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-hairline text-xs font-semibold text-ink hover:text-[#FF6200] hover:border-[#FF6200]/40 transition-all cursor-pointer shadow-2xs"

                    title="Copy Registration ID"

                  >

                    {copiedId ? (

                      <>

                        <Check size={13} className="text-emerald-600" />

                        <span className="text-emerald-600">Copied!</span>

                      </>

                    ) : (

                      <>

                        <Copy size={13} className="text-muted-editorial" />

                        <span>Copy ID</span>

                      </>

                    )}

                  </button>

                </div>



                {/* 3. Important Details Summary Card */}

                <div className="bg-surface-soft/40 border border-hairline rounded-xl p-3.5 sm:p-4">

                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 pb-3 border-b border-hairline/80 mb-2.5">

                    {(registeredMember.photoUrl || photoPreview) ? (

                      <img

                        src={registeredMember.photoUrl || photoPreview}

                        alt={registeredMember.fullName}

                        className="w-12 h-14 sm:w-14 sm:h-16 rounded-lg object-cover border border-hairline shadow-xs flex-shrink-0 bg-white"

                      />

                    ) : (

                      <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-lg bg-surface-card border border-hairline flex flex-col items-center justify-center text-muted-editorial flex-shrink-0">

                        <User size={20} className="text-[#FF6200]" />

                        <span className="text-[8px] font-mono mt-0.5">Photo</span>

                      </div>

                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-2 text-xs flex-1 w-full">

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          Applicant Name

                        </span>

                        <span className="font-bold text-ink text-xs sm:text-sm block leading-snug">

                          {registeredMember.fullName}

                        </span>

                      </div>

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          Assigned Wing

                        </span>

                        <span className="font-serif font-bold text-[#FF6200] text-xs sm:text-sm block leading-snug">

                          {registeredMember.wing}

                        </span>

                      </div>

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          District & State

                        </span>

                        <span className="font-semibold text-ink text-xs sm:text-sm block leading-snug">

                          {registeredMember.district ? `${registeredMember.district}, ${registeredMember.state}` : registeredMember.state}

                        </span>

                      </div>

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          Registered Mobile

                        </span>

                        <span className="font-mono font-medium text-ink text-xs sm:text-sm block leading-snug">

                          +91 {registeredMember.mobile}

                        </span>

                      </div>

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          Assembly Constituency

                        </span>

                        <span className="font-semibold text-ink text-xs sm:text-sm block leading-snug">

                          {registeredMember.assembly || "—"}

                        </span>

                      </div>

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          Zone / Region

                        </span>

                        <span className="font-semibold text-ink text-xs sm:text-sm block leading-snug">

                          {registeredMember.zone || "—"}

                        </span>

                      </div>

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          Date of Birth

                        </span>

                        <span className="font-semibold text-ink text-xs sm:text-sm block leading-snug">

                          {registeredMember.dob ? formatDobDisplay(registeredMember.dob) : "—"}

                        </span>

                      </div>

                      <div>

                        <span className="text-muted-editorial block text-[9.5px] uppercase font-bold tracking-wider">

                          Application Date

                        </span>

                        <span className="font-medium text-ink text-xs sm:text-sm block leading-snug">

                          {new Date(registeredMember.createdAt || Date.now()).toLocaleDateString("en-IN", {

                            day: "2-digit",

                            month: "short",

                            year: "numeric",

                          })}

                        </span>

                      </div>

                    </div>

                  </div>



                  {/* Compact Notice */}

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-editorial pt-0.5">

                    <AlertCircle size={12} className="text-amber-600 flex-shrink-0" />

                    <span>PVC Identity Cards are unlocked after administrative committee verification & approval.</span>

                  </div>

                </div>



                {/* 4. Action Buttons (All in one slide!) */}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">

                    <button

                      type="button"

                      onClick={() => {

                        setStatusQuery(registeredMember.registrationId);

                        setActiveTab("status");

                        fetchStatus(registeredMember.registrationId);

                        setRegisteredMember(null);

                      }}

                      className="btn-primary-coral flex-1 sm:flex-initial flex items-center justify-center gap-2 text-xs sm:text-sm px-5 py-2.5 font-bold shadow-md hover:shadow-lg cursor-pointer"

                    >

                      <Search size={14} />

                      <span>Track Approval Status</span>

                    </button>

                    <button

                      type="button"

                      onClick={() => handleDownloadReceiptPdf()}

                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-2.5 font-semibold rounded-xl border border-[#FF6200]/30 bg-[#FF6200]/10 hover:bg-[#FF6200]/20 text-[#FF6200] shadow-xs transition-colors cursor-pointer"

                      title="Download official acknowledgment PDF"

                    >

                      <Download size={14} />

                      <span>Download Acknowledgment</span>

                    </button>

                  </div>



                  <button

                    type="button"

                    onClick={() => {

                      setRegisteredMember(null);

                      resetForm();

                      setStep(1);

                    }}

                    className="text-xs text-muted-editorial hover:text-[#FF6200] font-semibold underline cursor-pointer transition-colors"

                  >

                    + Register Another Member

                  </button>

                </div>

              </div>

            ) : (

            /* Multi-Step Enrollment Form */

            <div

              ref={formCardRef}

              className="card-feature-cream bg-white border border-hairline shadow-md rounded-2xl p-6 sm:p-10 scroll-mt-24"

            >

              {/* Stepper Header */}

              <div className="mb-8">

                <div className="flex items-center justify-between mb-4">

                  {[

                    { num: 1, label: "Personal Profile", icon: User },

                    { num: 2, label: "Address & Location", icon: MapPin },

                    { num: 3, label: "Profession & Wing", icon: Briefcase },

                    { num: 4, label: "Review & Oath", icon: ShieldCheck },

                  ].map((s) => {

                    const IconComp = s.icon;

                    const isActive = step === s.num;

                    const isCompleted = step > s.num;

                    return (

                      <div

                        key={s.num}

                        onClick={() => {

                          if (s.num < step) {

                            setErrorMsg("");

                            setStep(s.num);

                            scrollToCardTop();

                          }

                        }}

                        className={`flex-1 flex flex-col items-center text-center ${

                          s.num < step ? "cursor-pointer group" : ""

                        }`}

                        title={s.num < step ? `Return to Step ${s.num}: ${s.label}` : undefined}

                      >

                        <div

                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${

                            isCompleted

                              ? "bg-emerald-600 text-white shadow-sm group-hover:scale-105"

                              : isActive

                              ? "bg-[#FF6200] text-white ring-4 ring-[#FF6200]/20 shadow-md"

                              : "bg-surface-soft text-muted-editorial border border-hairline"

                          }`}

                        >

                          {isCompleted ? <CheckCircle2 size={16} /> : <IconComp size={16} />}

                        </div>

                        <span

                          className={`text-[10px] sm:text-xs font-medium mt-1.5 hidden sm:block transition-colors ${

                            isActive

                              ? "text-[#FF6200] font-semibold"

                              : isCompleted

                              ? "text-emerald-700 group-hover:underline"

                              : "text-muted-editorial"

                          }`}

                        >

                          {s.label}

                        </span>

                      </div>

                    );

                  })}

                </div>

                {/* Progress bar line */}

                <div className="w-full bg-surface-soft h-1.5 rounded-full overflow-hidden">

                  <div

                    className="bg-gradient-to-r from-[#FF6200] to-[#FF6200] h-full transition-all duration-300"

                    style={{ width: `${((step - 1) / 3) * 100}%` }}

                  />

                </div>

              </div>



              {/* Error banner with auto-scroll ref */}

              {errorMsg && (

                <div

                  ref={errorBannerRef}

                  id="registration-error-banner"

                  role="alert"

                  aria-live="assertive"

                  tabIndex={-1}

                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 mb-6 text-xs text-rose-900 bg-rose-50 border-2 border-rose-300 rounded-xl shadow-md animate-fade-in ring-4 ring-rose-400/20 scroll-mt-28 outline-none"

                >

                  <div className="flex items-center gap-2.5">

                    <AlertCircle size={18} className="flex-shrink-0 text-rose-600 animate-pulse" />

                    <span className="font-semibold leading-relaxed">{errorMsg}</span>

                  </div>

                </div>

              )}



              <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>

                <div className="min-h-[460px] sm:min-h-[500px] flex flex-col justify-between">

                  <div>

                    {/* STEP 1: Personal Details */}

                {step === 1 && (

                  <div className="space-y-6 animate-fade-in">

                    <div className="border-b border-hairline pb-3">

                      <h3 className="font-serif text-lg font-bold text-ink">Personal & Contact Profile</h3>

                      <p className="text-xs text-muted-editorial">

                        Provide official legal name and contact details as registered in identification documents.

                      </p>

                    </div>



                    {/* Photo Upload Section with Integrated Cropper */}

                    <div

                      className={`flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border transition-colors ${

                        isFieldInvalid("photo")

                          ? "border-rose-400 bg-rose-50/20 shadow-xs"

                          : "bg-surface-soft/60 border-hairline"

                      }`}

                    >

                      <div className="relative flex-shrink-0">

                        {photoPreview ? (

                          <div className="relative group">

                            <img

                              src={photoPreview}

                              alt="Passport Photo Preview"

                              className="w-24 h-28 rounded-xl object-cover border-2 border-[#FF6200] shadow-md bg-white"

                            />

                            <div

                              className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white p-0.5 rounded-full shadow-xs"

                              title="Passport Photo Cropped & Ready"

                            >

                              <CheckCircle2 size={15} />

                            </div>

                          </div>

                        ) : (

                          <div

                            className={`w-24 h-28 rounded-xl flex flex-col items-center justify-center transition-colors ${

                              isFieldInvalid("photo")

                                ? "bg-rose-50 border-2 border-dashed border-rose-400 text-rose-600"

                                : "bg-surface-card border-2 border-dashed border-hairline text-muted-editorial"

                            }`}

                          >

                            <User size={32} className={isFieldInvalid("photo") ? "text-rose-500" : "text-muted-editorial/70"} />

                            <span className="text-[9px] mt-1.5 font-medium">Passport Photo *</span>

                          </div>

                        )}

                      </div>



                      <div className="flex-1 text-center sm:text-left space-y-2">

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">

                          <label

                            className={`inline-flex items-center gap-2 cursor-pointer text-xs px-3.5 py-2 rounded-lg font-semibold transition-colors shadow-2xs ${

                              isFieldInvalid("photo")

                                ? "bg-rose-600 text-white hover:bg-rose-700"

                                : "btn-secondary hover:bg-white"

                            }`}

                          >

                            <Upload size={14} />

                            <span>{photoPreview ? "Change Photo" : "Upload Passport Photograph * (Mandatory)"}</span>

                            <input

                              type="file"

                              accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"

                              className="hidden"

                              onChange={handlePhotoSelect}

                            />

                          </label>



                          {photoPreview && rawPhotoSrc && (

                            <button

                              type="button"

                              onClick={() => setCropModalOpen(true)}

                              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[#e8d2be] bg-[#faf3ee] text-[#FF6200] hover:bg-[#faede3] font-semibold cursor-pointer transition-colors shadow-2xs"

                              title="Re-open Cropping Tool"

                            >

                              <Crop size={14} />

                              <span>Adjust Crop</span>

                            </button>

                          )}



                          {photoPreview && (

                            <button

                              type="button"

                              onClick={handleRemovePhoto}

                              className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"

                              title="Remove Photo"

                            >

                              <Trash2 size={14} />

                            </button>

                          )}

                        </div>



                        {renderFieldError("photo")}



                        <p className="text-[11px] text-muted-editorial">

                          {photoPreview ? (

                            <span className="text-emerald-700 font-medium flex items-center gap-1 justify-center sm:justify-start">

                              <Check size={12} /> Passport photo cropped & optimized for official Cadre ID card.

                            </span>

                          ) : (

                            <span>

                              Passport photograph is <strong className="text-ink">mandatory</strong> (JPG or PNG, max 5 MB). Select photo from device — an interactive cropping modal will open to position and frame your face.

                            </span>

                          )}

                        </p>

                      </div>

                    </div>



                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div>

                        <label className="block text-xs font-medium text-ink mb-1">

                          Full Name <span className="text-rose-500">*</span>

                        </label>

                        <input

                          type="text"

                          name="fullName"

                          value={formData.fullName}

                          onChange={handleInputChange}

                          onBlur={() => handleTitleCaseBlur("fullName")}

                          placeholder="Enter Full Legal Name (as per ID)"

                          className={getInputClass("fullName", "capitalize")}

                        />

                        {renderFieldError("fullName")}

                      </div>



                      <div>

                        <label className="block text-xs font-medium text-ink mb-1">

                          Father's / Husband's Name <span className="text-rose-500">*</span>

                        </label>

                        <input

                          type="text"

                          name="fatherName"

                          value={formData.fatherName}

                          onChange={handleInputChange}

                          onBlur={() => handleTitleCaseBlur("fatherName")}

                          placeholder="Father's or Husband's Full Name"

                          className={getInputClass("fatherName", "capitalize")}

                        />

                        {renderFieldError("fatherName")}

                      </div>



                      {/* Small & Simple Date of Birth Input (Single Column) */}

                      <div>

                        <label className="block text-xs font-medium text-ink mb-1">

                          Date of Birth <span className="text-rose-500">*</span>

                        </label>

                        <div className="grid grid-cols-3 gap-1.5">

                          <select

                            value={dobDay}

                            onChange={(e) => handleDobSelect("day", e.target.value)}

                            onBlur={() => handleBlur("dob")}

                            className={`w-full text-xs sm:text-sm px-2 py-2.5 rounded-lg border transition-colors ${

                              isFieldInvalid("dob")

                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-ink"

                                : "border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200]"

                            }`}

                          >

                            <option value="">DD</option>

                            {Array.from(

                              { length: getDaysInMonth(dobYear, dobMonth) },

                              (_, i) => {

                                const d = String(i + 1).padStart(2, "0");

                                return (

                                  <option key={d} value={d}>

                                    {d}

                                  </option>

                                );

                              }

                            )}

                          </select>



                          <select

                            value={dobMonth}

                            onChange={(e) => handleDobSelect("month", e.target.value)}

                            onBlur={() => handleBlur("dob")}

                            className={`w-full text-xs sm:text-sm px-1.5 py-2.5 rounded-lg border transition-colors ${

                              isFieldInvalid("dob")

                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-ink"

                                : "border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200]"

                            }`}

                          >

                            <option value="">MM</option>

                            {MONTHS.map((m) => (

                              <option key={m.value} value={m.value}>

                                {m.label}

                              </option>

                            ))}

                          </select>



                          <select

                            value={dobYear}

                            onChange={(e) => handleDobSelect("year", e.target.value)}

                            onBlur={() => handleBlur("dob")}

                            className={`w-full text-xs sm:text-sm px-1.5 py-2.5 rounded-lg border transition-colors ${

                              isFieldInvalid("dob")

                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-ink"

                                : "border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200]"

                            }`}

                          >

                            <option value="">YYYY</option>

                            {YEARS.map((y) => (

                              <option key={y} value={y}>

                                {y}

                              </option>

                            ))}

                          </select>

                        </div>

                        {renderFieldError("dob")}

                      </div>



                      <div>

                        <label className="block text-xs font-medium text-ink mb-1">

                          Gender <span className="text-rose-500">*</span>

                        </label>

                        <select

                          name="gender"

                          value={formData.gender}

                          onChange={handleInputChange}

                          onBlur={() => handleBlur("gender")}

                          className={getInputClass("gender")}

                        >

                          <option value="">Select Gender</option>

                          <option value="Male">Male</option>

                          <option value="Female">Female</option>

                          <option value="Other">Other</option>

                        </select>

                        {renderFieldError("gender")}

                      </div>



                      <div>

                        <label htmlFor="mobile" className="block text-xs font-medium text-ink mb-1">

                          Primary Mobile Number <span className="text-rose-500">*</span>

                        </label>

                        <div className="relative">

                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-editorial select-none pointer-events-none">

                            +91

                          </span>

                          <input

                            type="tel"

                            id="mobile"

                            name="mobile"

                            maxLength={10}

                            inputMode="numeric"

                            pattern="[0-9]*"

                            value={formData.mobile}

                            onChange={handleInputChange}

                            onBlur={() => handleBlur("mobile")}

                            placeholder="10-digit number"

                            className={getInputClass("mobile", "pl-10")}

                          />

                        </div>

                        {renderFieldError("mobile")}

                      </div>



                      <div>

                        <div className="flex items-center justify-between mb-1">

                          <label htmlFor="whatsapp" className="block text-xs font-medium text-ink">

                            WhatsApp Number <span className="text-muted-editorial font-normal">(Optional)</span>

                          </label>

                          <label

                            htmlFor="sameAsMobileCheckbox"

                            className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-[#FF6200] font-medium hover:underline select-none"

                          >

                            <input

                              type="checkbox"

                              id="sameAsMobileCheckbox"

                              checked={sameAsMobile}

                              onChange={(e) => {

                                const checked = e.target.checked;

                                setSameAsMobile(checked);

                                if (checked) {

                                  setFormData((prev) => ({ ...prev, whatsapp: prev.mobile }));

                                  if (touchedFields.whatsapp) {

                                    const err = validateField("whatsapp", formData.mobile);

                                    setFieldErrors((f) => {

                                      const next = { ...f };

                                      if (err) next.whatsapp = err;

                                      else delete next.whatsapp;

                                      return next;

                                    });

                                  }

                                } else {

                                  // When user removes tick, remove the same number from the WhatsApp field

                                  setFormData((prev) => ({

                                    ...prev,

                                    whatsapp: prev.whatsapp.trim() === prev.mobile.trim() ? "" : prev.whatsapp,

                                  }));

                                  setTouchedFields((prev) => ({ ...prev, whatsapp: false }));

                                  setFieldErrors((f) => {

                                    const next = { ...f };

                                    delete next.whatsapp;

                                    return next;

                                  });

                                }

                              }}

                              className="rounded border-hairline text-[#FF6200] focus:ring-[#FF6200] w-3.5 h-3.5 cursor-pointer accent-[#FF6200]"

                            />

                            <span>Same as Mobile</span>

                          </label>

                        </div>

                        <div className="relative">

                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-editorial select-none pointer-events-none">

                            +91

                          </span>

                          <input

                            type="tel"

                            id="whatsapp"

                            name="whatsapp"

                            maxLength={10}

                            inputMode="numeric"

                            pattern="[0-9]*"

                            disabled={sameAsMobile}

                            value={formData.whatsapp}

                            onChange={(e) => {

                              if (sameAsMobile && e.target.value !== formData.mobile) {

                                setSameAsMobile(false);

                              }

                              handleInputChange(e);

                            }}

                            onBlur={() => handleBlur("whatsapp")}

                            placeholder="10-digit number"

                            className={getInputClass(

                              "whatsapp",

                              `pl-10 ${sameAsMobile ? "bg-surface-soft/80 text-muted-editorial cursor-not-allowed opacity-80" : ""}`

                            )}

                          />

                        </div>

                        {renderFieldError("whatsapp")}

                      </div>



                      <div>

                        <label className="block text-xs font-medium text-ink mb-1">

                          Email Address <span className="text-muted-editorial font-normal">(Optional)</span>

                        </label>

                        <div className="relative">

                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-editorial" />

                          <input

                            type="email"

                            name="email"

                            value={formData.email}

                            onChange={handleInputChange}

                            onBlur={() => handleBlur("email")}

                            placeholder="Enter Email Address (Optional)"

                            className={getInputClass("email", "pl-9")}

                          />

                        </div>

                        {renderFieldError("email")}

                      </div>



                      <div>

                        <label htmlFor="bloodGroup" className="block text-xs font-medium text-ink mb-1">

                          Blood Group <span className="text-muted-editorial font-normal">(Optional)</span>

                        </label>

                        <select

                          id="bloodGroup"

                          name="bloodGroup"

                          value={formData.bloodGroup}

                          onChange={handleInputChange}

                          className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200] transition-colors"

                        >

                          <option value="">Select blood group</option>

                          <option value="A+">A+</option>

                          <option value="A-">A-</option>

                          <option value="B+">B+</option>

                          <option value="B-">B-</option>

                          <option value="AB+">AB+</option>

                          <option value="AB-">AB-</option>

                          <option value="O+">O+</option>

                          <option value="O-">O-</option>

                          <option value="Don't know">Don't know</option>

                        </select>

                        <p className="mt-1.5 text-[13px] text-muted-editorial flex items-center gap-1.5 font-normal">

                          <Info size={14} className="text-muted-editorial shrink-0" />

                          <span>Recommended for emergency use</span>

                        </p>

                      </div>

                    </div>



                    {/* ========================================================================= */}

                    {/* 2. SEPARATE EMERGENCY CONTACT SECTION (Compulsory, printed on ID card)    */}

                    {/* ========================================================================= */}

                    <div className="bg-[#fffdf9] border border-[#f3e3ce] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">

                      <div className="border-b border-[#f3e3ce]/80 pb-3">

                        <div>

                          <div className="flex items-center gap-2">

                            <Phone className="text-[#FF6200]" size={16} />

                            <h4 className="font-serif text-sm sm:text-base font-bold text-ink">

                              Emergency Contact Details <span className="text-rose-500">*</span>

                            </h4>

                          </div>

                          <p className="text-xs text-muted-editorial mt-0.5">

                            This number will be printed on your ID card.

                          </p>

                        </div>
                      </div>



                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Emergency Number Input */}

                        <div>

                          <label htmlFor="emergencyNumber" className="block text-xs font-medium text-ink mb-1">

                            Emergency Number <span className="text-rose-500">*</span>

                          </label>

                          <div className="relative">

                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-editorial select-none pointer-events-none">

                              +91

                            </span>

                            <input

                              type="tel"

                              id="emergencyNumber"

                              name="emergencyNumber"

                              maxLength={10}

                              inputMode="numeric"

                              pattern="[0-9]*"

                              value={formData.emergencyNumber}

                              onChange={handleInputChange}

                              onBlur={() => handleBlur("emergencyNumber")}

                              placeholder="10-digit emergency number"

                              className={getInputClass("emergencyNumber", "pl-10")}

                            />

                          </div>

                          {renderFieldError("emergencyNumber")}

                        </div>



                        {/* Relation to Member Dropdown */}

                        <div>

                          <label htmlFor="emergencyRelation" className="block text-xs font-medium text-ink mb-1">

                            Relationship with Member <span className="text-rose-500">*</span>

                          </label>

                          <select

                            id="emergencyRelation"

                            name="emergencyRelation"

                            value={formData.emergencyRelation}

                            onChange={handleInputChange}

                            onBlur={() => handleBlur("emergencyRelation")}

                            className={getInputClass("emergencyRelation")}

                          >

                            <option value="">Select Relation</option>

                            <option value="Father">Father</option>

                            <option value="Mother">Mother</option>

                            <option value="Spouse">Spouse</option>

                            <option value="Sibling">Sibling</option>

                            <option value="Friend">Friend</option>

                            <option value="Other">Other</option>

                          </select>

                          {renderFieldError("emergencyRelation")}

                        </div>

                      </div>

                    </div>

                  </div>

                )}



                {/* STEP 2: Address & Location */}

                {step === 2 && (

                  <div className="space-y-5 animate-fade-in">

                    <div className="border-b border-hairline pb-3">

                      <h3 className="font-serif text-lg font-bold text-ink">Location & Residential Address</h3>

                      <p className="text-xs text-muted-editorial">

                        Your State and District determine your local cadre committee and service coordination.

                      </p>

                    </div>



                    <div className="space-y-4">

                      {/* Row 1: State & District */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>

                          <label className="block text-xs font-medium text-ink mb-1">

                            State / Union Territory <span className="text-rose-500">*</span>

                          </label>

                          <select

                            name="state"

                            value={formData.state}

                            onChange={handleStateChange}

                            onBlur={() => handleBlur("state")}

                            className={getInputClass("state")}

                          >

                            <option value="">Select State / Union Territory</option>

                            {INDIAN_STATES.map((st) => (

                              <option key={st} value={st}>

                                {st}

                              </option>

                            ))}

                          </select>

                          {renderFieldError("state")}

                        </div>



                        <div>

                          <label className="block text-xs font-medium text-ink mb-1">

                            District Unit <span className="text-rose-500">*</span>

                          </label>

                          <select

                            name="district"

                            value={formData.district}

                            onChange={handleDistrictChange}

                            onBlur={() => handleBlur("district")}

                            disabled={!formData.state}

                            className={getInputClass("district", "disabled:opacity-60 disabled:cursor-not-allowed")}

                          >

                            <option value="">

                              {formData.state ? "Select District" : "Select State First"}

                            </option>

                            {formData.state &&

                              (STATE_DISTRICTS[formData.state] || ["Other District"]).map((dist) => (

                                <option key={dist} value={dist}>

                                  {dist}

                                </option>

                              ))}

                          </select>

                          {renderFieldError("district")}



                          {formData.district === "Other District" && (

                            <div className="mt-2">

                              <input

                                type="text"

                                value={customDistrict}

                                onChange={(e) => {

                                  const val = capitalizeLive(e.target.value);

                                  setCustomDistrict(val);

                                  if (touchedFields.customDistrict) {

                                    const err = validateField("customDistrict", val);

                                    setFieldErrors((prev) => {

                                      const next = { ...prev };

                                      if (err) next.customDistrict = err;

                                      else delete next.customDistrict;

                                      return next;

                                    });

                                  }

                                }}

                                onBlur={() => {

                                  setCustomDistrict((prev) => normalizeTitleCase(prev));

                                  handleBlur("customDistrict");

                                }}

                                placeholder="Enter District Name"

                                className={getInputClass("customDistrict", "text-xs sm:text-sm capitalize")}

                              />

                              {renderFieldError("customDistrict")}

                            </div>

                          )}

                        </div>

                      </div>



                      {/* Row 1.5: Assembly Constituency & Zone / Region Text Inputs */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>

                          <label htmlFor="assembly" className="block text-xs font-medium text-ink mb-1">

                            Assembly Constituency

                          </label>

                          <input

                            type="text"

                            id="assembly"

                            name="assembly"

                            value={formData.assembly}

                            onChange={handleInputChange}

                            onBlur={() => handleTitleCaseBlur("assembly")}

                            placeholder="e.g. Thiyagarayanagar"

                            className={getInputClass("assembly", "capitalize placeholder:normal-case")}

                          />

                        </div>



                        <div>

                          <label htmlFor="zone" className="block text-xs font-medium text-ink mb-1">

                            Zone / Region

                          </label>

                          <input

                            type="text"

                            id="zone"

                            name="zone"

                            value={formData.zone}

                            onChange={handleInputChange}

                            onBlur={() => handleTitleCaseBlur("zone")}

                            placeholder="e.g. Teynampet Zone"

                            className={getInputClass("zone", "capitalize placeholder:normal-case")}

                          />

                        </div>

                      </div>



                      {/* Row 2: Sub-district/Taluk & PIN Code */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>

                          <label className="block text-xs font-medium text-ink mb-1">

                            Taluk / Sub-District / Area <span className="text-muted-editorial font-normal">(Optional)</span>

                          </label>

                          <input

                            type="text"

                            name="taluk"

                            value={formData.taluk}

                            onChange={handleInputChange}

                            onBlur={() => handleTitleCaseBlur("taluk")}

                            placeholder="Taluk, Tehsil or Locality (Optional)"

                            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200] transition-colors capitalize"

                          />

                        </div>



                        <div>

                          <label className="block text-xs font-medium text-ink mb-1">

                            Postal PIN Code <span className="text-rose-500">*</span>

                          </label>

                          <input

                            type="text"

                            name="pincode"

                            maxLength={6}

                            value={formData.pincode}

                            onChange={handleInputChange}

                            onBlur={() => handleBlur("pincode")}

                            placeholder="Enter 6-digit PIN Code"

                            className={getInputClass("pincode", "font-mono")}

                          />

                          {renderFieldError("pincode")}

                        </div>

                      </div>



                      {/* Row 3: Full Residential Address */}

                      <div>

                        <label className="block text-xs font-medium text-ink mb-1">

                          Full Residential Address <span className="text-rose-500">*</span>

                        </label>

                        <textarea

                          name="address"

                          rows={2}

                          value={formData.address}

                          onChange={handleInputChange}

                          onBlur={() => handleTitleCaseBlur("address")}

                          placeholder="Door / Flat No, Building Name, Street, Landmark, Area"

                          className={getInputClass("address", "resize-none capitalize")}

                        />

                        {renderFieldError("address")}

                      </div>

                    </div>

                  </div>

                )}



                {/* STEP 3: Professional & Wing Allocation */}

                {step === 3 && (

                  <div className="space-y-6 animate-fade-in">

                    <div className="border-b border-hairline pb-3">

                      <h3 className="font-serif text-lg font-bold text-ink">Profession & Wing Choice</h3>

                      <p className="text-xs text-muted-editorial">

                        Select your primary Seva Dal wing and optionally share your profession for skill-mapping and cadre coordination.

                      </p>

                    </div>



                    <div>

                      <label className="block text-xs font-medium text-ink mb-1">

                        Current Profession / Occupation <span className="text-muted-editorial font-normal">(Optional)</span>

                      </label>

                      <input

                        type="text"

                        name="profession"

                        value={formData.profession}

                        onChange={handleInputChange}

                        onBlur={() => handleTitleCaseBlur("profession")}

                        placeholder="Advocate, Teacher, Doctor, Business, Student, Social Worker..."

                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200] transition-colors capitalize"

                      />

                      <p className="text-[11px] text-muted-editorial mt-1">

                        Optional: Used for official cadre skill-mapping and voluntary community seva coordination.

                      </p>

                    </div>



                    {/* Wing Selection Grid */}

                    <div>

                      <label className="block text-xs font-medium text-ink mb-3">

                        Choose Primary MSD Wing <span className="text-rose-500">*</span>

                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {WINGS.map((w) => {

                          const IconComp = w.icon;

                          const isSelected = formData.wing === w.id;

                          return (

                            <div

                              key={w.id}

                              onClick={() => {

                                setFormData((prev) => ({ ...prev, wing: w.id }));

                                setTouchedFields((prev) => ({ ...prev, wing: true }));

                                setFieldErrors((prev) => {

                                  const next = { ...prev };

                                  delete next.wing;

                                  return next;

                                });

                              }}

                              className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${

                                isSelected

                                  ? "border-[#FF6200] bg-gradient-to-br from-[#FF6200]/10 via-[#FF6200]/5 to-transparent ring-2 ring-[#FF6200]/30 shadow-sm"

                                  : isFieldInvalid("wing")

                                  ? "border-rose-300 bg-rose-50/20 hover:border-rose-400"

                                  : "border-hairline bg-surface-soft/60 hover:bg-white hover:border-[#FF6200]/40 hover:shadow-xs hover:-translate-y-0.5"

                              }`}

                            >

                              {/* Selection Checkmark Badge */}

                              {isSelected && (

                                <div className="absolute top-3.5 right-3.5 bg-[#FF6200] text-white rounded-full p-0.5 shadow-2xs">

                                  <Check size={12} strokeWidth={3} />

                                </div>

                              )}



                              <div className="flex items-center gap-3 mb-1.5 pr-6">

                                <div

                                  className={`p-2 rounded-lg transition-colors ${

                                    isSelected

                                      ? "bg-[#FF6200] text-white shadow-2xs"

                                      : "bg-surface-card text-muted-editorial border border-hairline"

                                  }`}

                                >

                                  <IconComp size={16} />

                                </div>

                                <span className="font-serif font-bold text-sm text-ink">{w.title}</span>

                              </div>

                              <p className="text-[11px] text-muted-editorial leading-relaxed pl-1">

                                {w.description}

                              </p>

                            </div>

                          );

                        })}

                      </div>

                      {renderFieldError("wing")}

                    </div>

                  </div>

                )}



                {/* STEP 4: Review & The 1947 Seva Pledge */}

                {step === 4 && (

                  <div className="space-y-6 animate-fade-in">

                    <div className="border-b border-hairline pb-3">

                      <h3 className="font-serif text-lg font-bold text-ink">Review & Oath of Service</h3>

                      <p className="text-xs text-muted-editorial">

                        Review your application details and take the founding pledge of Maha Seva Dal.

                      </p>

                    </div>



                    {/* Application Review Summary Section */}

                    <div className="space-y-4">

                      {/* Header */}

                      <div className="flex items-center justify-between pb-1">

                        <div className="flex items-center gap-2.5">

                          <div className="w-8 h-8 rounded-lg bg-[#FF6200]/10 flex items-center justify-center text-[#FF6200]">

                            <FileText size={18} />

                          </div>

                          <div>

                            <span className="font-serif font-bold text-base text-ink block leading-tight">

                              Enrollment Summary Review

                            </span>

                            <span className="text-xs text-muted-editorial">

                              Verify all your submitted details before official enrollment

                            </span>

                          </div>

                        </div>

                      </div>



                      {/* SECTION 1: Personal & Contact Information (with Passport Photo) */}

                      <div className="bg-white rounded-xl p-4 sm:p-5 border border-hairline shadow-2xs">

                        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-hairline/60">

                          <div className="flex items-center gap-2">

                            <User size={15} className="text-[#FF6200]" />

                            <span className="text-xs font-bold uppercase tracking-wider text-ink font-serif">

                              1. Personal & Contact Profile

                            </span>

                          </div>

                          <button

                            type="button"

                            onClick={() => {

                              setStep(1);

                              scrollToCardTop();

                            }}

                            className="text-[11px] font-semibold text-[#FF6200] hover:text-[#d95300] hover:underline flex items-center gap-1 cursor-pointer transition-colors"

                          >

                            <Edit3 size={11} />

                            <span>Edit Step 1</span>

                          </button>

                        </div>



                        <div className="flex flex-col md:flex-row gap-5 items-start">

                          {/* Cadre Passport Photo Preview */}

                          <div className="flex-shrink-0 self-center md:self-start flex flex-col items-center">

                            {photoPreview ? (

                              <div className="relative group">

                                <img

                                  src={photoPreview}

                                  alt="Cadre Photo"

                                  className="w-24 h-28 rounded-xl object-cover border-2 border-[#FF6200] shadow-sm bg-white"

                                />

                                <div

                                  className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white p-0.5 rounded-full shadow-xs"

                                  title="Passport Photo Attached"

                                >

                                  <Check size={11} strokeWidth={3} />

                                </div>

                              </div>

                            ) : (

                              <div className="w-24 h-28 rounded-xl bg-surface-card border-2 border-dashed border-hairline flex flex-col items-center justify-center text-muted-editorial text-center p-1.5">

                                <User size={28} className="text-muted-editorial/60" />

                                <span className="text-[9px] mt-1 font-medium text-rose-500">No Photo</span>

                              </div>

                            )}

                            <span className="text-[9.5px] font-semibold text-muted-editorial mt-1.5 uppercase tracking-wider">

                              Cadre Photo

                            </span>

                          </div>



                          {/* Personal Details Grid: 3 columns on desktop, 1 on mobile */}

                          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">

                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Full Legal Name

                              </span>

                              <span className="text-lg sm:text-xl font-bold text-ink leading-tight block">

                                {formData.fullName || "—"}

                              </span>

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Father / Husband Name

                              </span>

                              <span className="text-base font-medium text-ink block leading-snug">

                                {formData.fatherName || "—"}

                              </span>

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Date of Birth

                              </span>

                              <span className="text-base font-medium text-ink block leading-snug">

                                {formData.dob ? formatDobDisplay(formData.dob) : "—"}

                              </span>

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Gender

                              </span>

                              <span className="text-base font-medium text-ink block leading-snug">

                                {formData.gender || "—"}

                              </span>

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Blood Group (Optional)

                              </span>

                              {formData.bloodGroup && formData.bloodGroup.trim() ? (

                                <span className="text-base font-medium text-ink block leading-snug">

                                  {formData.bloodGroup.trim()}

                                </span>

                              ) : (

                                <span className="text-[#9CA3AF] italic text-base font-normal block leading-snug">

                                  Not provided

                                </span>

                              )}

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Primary Mobile

                              </span>

                              <span className="text-base font-medium text-ink block leading-snug">

                                {formData.mobile ? `+91 ${formData.mobile}` : "—"}

                              </span>

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                WhatsApp Number (Optional)

                              </span>

                              {sameAsMobile || (formData.whatsapp && formData.whatsapp.trim() === formData.mobile) ? (

                                <span className="text-base font-medium text-ink block leading-snug">Same as Mobile</span>

                              ) : formData.whatsapp && formData.whatsapp.trim() ? (

                                <span className="text-base font-medium text-ink block leading-snug">

                                  +91 {formData.whatsapp.trim()}

                                </span>

                              ) : (

                                <span className="text-[#9CA3AF] italic text-base font-normal block leading-snug">

                                  Not provided

                                </span>

                              )}

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Emergency Contact

                              </span>

                              <span className="text-base font-medium text-ink block leading-snug">

                                {formData.emergencyNumber ? (

                                  <>

                                    +91 {formData.emergencyNumber}

                                    {formData.emergencyRelation && (

                                      <span className="text-muted-editorial text-xs font-normal ml-1">

                                        ({formData.emergencyRelation})

                                      </span>

                                    )}

                                  </>

                                ) : (

                                  "—"

                                )}

                              </span>

                            </div>



                            <div>

                              <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                                Email Address (Optional)

                              </span>

                              {formData.email && formData.email.trim() ? (

                                <span className="text-base font-medium text-ink truncate block leading-snug">

                                  {formData.email.trim()}

                                </span>

                              ) : (

                                <span className="text-[#9CA3AF] italic text-base font-normal block leading-snug">

                                  Not provided

                                </span>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>



                      {/* SECTION 2: Address & Location */}

                      <div className="bg-white rounded-xl p-4 sm:p-5 border border-hairline shadow-2xs">

                        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-hairline/60">

                          <div className="flex items-center gap-2">

                            <MapPin size={15} className="text-[#FF6200]" />

                            <span className="text-xs font-bold uppercase tracking-wider text-ink font-serif">

                              2. Address & Location

                            </span>

                          </div>

                          <button

                            type="button"

                            onClick={() => {

                              setStep(2);

                              scrollToCardTop();

                            }}

                            className="text-[11px] font-semibold text-[#FF6200] hover:text-[#d95300] hover:underline flex items-center gap-1 cursor-pointer transition-colors"

                          >

                            <Edit3 size={11} />

                            <span>Edit Step 2</span>

                          </button>

                        </div>



                        {/* Address Grid: 3 columns on desktop, 1 on mobile */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">

                          <div>

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              State Unit

                            </span>

                            <span className="text-base font-medium text-ink block leading-snug">

                              {formData.state || "—"}

                            </span>

                          </div>



                          <div>

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              District Unit

                            </span>

                            <span className="text-base font-medium text-ink block leading-snug">

                              {formData.district === "Other District" && customDistrict.trim()

                                ? customDistrict.trim()

                                : formData.district || "—"}

                            </span>

                          </div>



                          <div>

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              Assembly Constituency

                            </span>

                            <span className="text-base font-medium text-ink block leading-snug">

                              {formData.assembly?.trim() || "—"}

                            </span>

                          </div>



                          <div>

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              Zone / Region

                            </span>

                            <span className="text-base font-medium text-ink block leading-snug">

                              {formData.zone?.trim() || "—"}

                            </span>

                          </div>



                          <div>

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              Taluk / Area (Optional)

                            </span>

                            {formData.taluk && formData.taluk.trim() ? (

                              <span className="text-base font-medium text-ink block leading-snug">

                                {formData.taluk.trim()}

                              </span>

                            ) : (

                              <span className="text-[#9CA3AF] italic text-base font-normal block leading-snug">

                                Not provided

                              </span>

                            )}

                          </div>



                          <div>

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              Postal PIN Code

                            </span>

                            <span className="text-base font-medium text-ink block leading-snug">

                              {formData.pincode || "—"}

                            </span>

                          </div>



                          <div className="col-span-1 md:col-span-2">

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              Full Residential Address

                            </span>

                            <span className="text-base font-medium text-ink block leading-relaxed">

                              {formData.address?.trim() || "—"}

                            </span>

                          </div>

                        </div>

                      </div>



                      {/* SECTION 3: Cadre Wing & Professional Details */}

                      <div className="bg-white rounded-xl p-4 sm:p-5 border border-hairline shadow-2xs">

                        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-hairline/60">

                          <div className="flex items-center gap-2">

                            <Briefcase size={15} className="text-[#FF6200]" />

                            <span className="text-xs font-bold uppercase tracking-wider text-ink font-serif">

                              3. Cadre Wing & Professional Details

                            </span>

                          </div>

                          <button

                            type="button"

                            onClick={() => {

                              setStep(3);

                              scrollToCardTop();

                            }}

                            className="text-[11px] font-semibold text-[#FF6200] hover:text-[#d95300] hover:underline flex items-center gap-1 cursor-pointer transition-colors"

                          >

                            <Edit3 size={11} />

                            <span>Edit Step 3</span>

                          </button>

                        </div>



                        {/* Wing & Profession Grid: 3 columns on desktop, 1 on mobile */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">

                          <div>

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              Assigned MSD Wing

                            </span>

                            <span className="text-base font-medium text-ink block leading-snug">

                              {formData.wing}

                            </span>

                          </div>



                          <div className="col-span-1 md:col-span-2">

                            <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">

                              Profession / Occupation (Optional)

                            </span>

                            {formData.profession && formData.profession.trim() ? (

                              <span className="text-base font-medium text-ink block leading-snug">

                                {formData.profession.trim()}

                              </span>

                            ) : (

                              <span className="text-[#9CA3AF] italic text-base font-normal block leading-snug">

                                Not provided

                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                    </div>



                    {/* Official 1947 Seva Pledge Box */}

                    <div className="bg-gradient-to-r from-[#faf7ee] to-[#f4ece0] border-2 border-[#e6dbc8] rounded-xl p-5 sm:p-6 shadow-sm">

                      <div className="flex items-center gap-2 mb-2 text-[#FF6200]">

                        <ShieldCheck size={18} />

                        <span className="font-serif font-bold text-sm uppercase tracking-wider text-ink">

                          The 1947 Maha Seva Dal Pledge

                        </span>

                      </div>

                      <blockquote className="font-serif text-xs sm:text-sm text-ink/80 italic leading-relaxed border-l-2 border-[#FF6200] pl-4 my-3">

                        “I solemnly pledge to dedicate my service toward the foundational motto of Maha Seva Dal: Unity of People, selfless social welfare, youth empowerment, and communal harmony without bias of caste, creed, or regional differences.”

                      </blockquote>

                      <div className="mt-4 pt-3 border-t border-[#e2d6c1] space-y-3">

                        <div>

                          <label className="flex items-start gap-3 cursor-pointer">

                            <input

                              type="checkbox"

                              checked={formData.pledgeAccepted}

                              onChange={(e) => {

                                const checked = e.target.checked;

                                setFormData((prev) => ({ ...prev, pledgeAccepted: checked }));

                                setTouchedFields((prev) => ({ ...prev, pledgeAccepted: true }));

                                setFieldErrors((prev) => {

                                  const next = { ...prev };

                                  if (checked) {

                                    delete next.pledgeAccepted;

                                  } else {

                                    next.pledgeAccepted = "Please accept the Maha Seva Dal 1947 Seva Pledge.";

                                  }

                                  return next;

                                });

                                if (checked) {

                                  setErrorMsg((prev) => (prev.toLowerCase().includes("pledge") ? "" : prev));

                                }

                              }}

                              className="mt-1 w-4 h-4 rounded text-[#FF6200] border-hairline focus:ring-[#FF6200]"

                            />

                            <span className="text-xs text-ink font-medium">

                              I accept the Maha Seva Dal Oath of Service and certify that all details provided are true and accurate.

                            </span>

                          </label>

                          {renderFieldError("pledgeAccepted")}

                        </div>



                        <div className="pt-2.5 border-t border-[#e2d6c1]/70">

                          <label className="flex items-start gap-3 cursor-pointer">

                            <input

                              type="checkbox"

                              checked={formData.termsAccepted}

                              onChange={(e) => {

                                const checked = e.target.checked;

                                setFormData((prev) => ({ ...prev, termsAccepted: checked }));

                                setTouchedFields((prev) => ({ ...prev, termsAccepted: true }));

                                setFieldErrors((prev) => {

                                  const next = { ...prev };

                                  if (checked) {

                                    delete next.termsAccepted;

                                  } else {

                                    next.termsAccepted = "Please agree to the Terms & Conditions and Privacy Policy.";

                                  }

                                  return next;

                                });

                                if (checked) {

                                  setErrorMsg((prev) => (prev.toLowerCase().includes("terms") ? "" : prev));

                                }

                              }}

                              className="mt-1 w-4 h-4 rounded text-[#FF6200] border-hairline focus:ring-[#FF6200]"

                            />

                            <span className="text-xs text-ink leading-relaxed">

                              I have read and agree to the{" "}

                              <Link

                                to="/terms"

                                target="_blank"

                                className="text-[#FF6200] font-semibold underline hover:text-[#D65000]"

                              >

                                Terms & Conditions

                              </Link>{" "}

                              and{" "}

                              <Link

                                to="/privacy"

                                target="_blank"

                                className="text-[#FF6200] font-semibold underline hover:text-[#D65000]"

                              >

                                Privacy Policy

                              </Link>

                              , and consent to voluntary identity verification under the DPDP Act, 2023.

                            </span>

                          </label>

                          {renderFieldError("termsAccepted")}

                        </div>

                      </div>

                    </div>

                  </div>

                )}

                </div>



                {/* Form Navigation Controls */}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-hairline mt-5">

                  {step > 1 ? (

                    <button

                      type="button"

                      onClick={handleBack}

                      className="btn-secondary flex items-center gap-2 text-xs px-4 py-2.5 w-full sm:w-auto justify-center"

                    >

                      <ArrowLeft size={14} />

                      <span>Previous Step</span>

                    </button>

                  ) : (

                    <div />

                  )}



                  {step < 4 ? (

                    <button

                      type="button"

                      onClick={handleNext}

                      disabled={checkingMobile}

                      className="btn-primary-coral flex items-center gap-2 text-xs px-5 py-2.5 w-full sm:w-auto justify-center disabled:opacity-60"

                    >

                      {checkingMobile ? (

                        <>

                          <RefreshCw size={14} className="animate-spin" />

                          <span>Checking Mobile...</span>

                        </>

                      ) : (

                        <>

                          <span>Continue</span>

                          <ArrowRight size={14} />

                        </>

                      )}

                    </button>

                  ) : (

                    <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">

                      <button

                        type="submit"

                        disabled={loading || !canSubmit || !formData.pledgeAccepted || !formData.termsAccepted}

                        className="btn-primary-coral flex items-center gap-2 text-xs px-6 py-2.5 font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center transition-all"

                      >

                        {loading ? (

                          <>

                            <RefreshCw size={15} className="animate-spin mr-1" />

                            <span>Enrolling Member...</span>

                          </>

                        ) : (

                          <>

                            <CheckCircle2 size={16} />

                            <span>Submit Official Enrollment</span>

                          </>

                        )}

                      </button>

                      {(!formData.pledgeAccepted || !formData.termsAccepted) && (

                        <span className="text-[10px] text-muted-editorial mt-1.5 text-center sm:text-right">

                          Please accept the pledge and terms above to enable submission

                        </span>

                      )}

                    </div>

                  )}

                </div>

                </div>

              </form>

            </div>

          )

        ) : (

            /* Check Status & Download ID Card Portal */

            <div className="card-feature-cream bg-white border border-hairline shadow-lg rounded-2xl p-3.5 sm:p-6 lg:p-10 animate-fade-in overflow-hidden">

              {/* Portal Header */}

              <div className="text-center max-w-xl mx-auto mb-8">

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6200]/10 text-[#FF6200] mb-3">

                  <ShieldCheck size={14} />

                  <span>National Cadre Verification</span>

                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink">

                  Check Membership Status & Download ID Card

                </h2>

                <p className="text-xs sm:text-sm text-muted-editorial mt-2">

                  Enter your Registration ID or 10-digit registered mobile number to check committee approval status. Once approved, your official Digital PVC Identity Card and download options will be unlocked.

                </p>

              </div>



              {/* Search Box */}

              <form

                onSubmit={(e) => {

                  e.preventDefault();

                  fetchStatus();

                }}

                className="max-w-xl mx-auto mb-8"

              >

                <div className="flex flex-col sm:flex-row gap-2">

                  <div className="relative flex-1">

                    <input

                      type="text"

                      value={statusQuery}

                      onChange={(e) => handleStatusInputChange(e.target.value)}

                      onPaste={handleStatusPaste}

                      placeholder="Enter Registration ID or 10-digit Mobile Number"

                      className="w-full px-4 py-3 text-sm bg-surface-soft/60 border border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6200]/30 font-medium text-ink placeholder:text-muted-editorial/60"

                    />

                  </div>

                  <button

                    type="submit"

                    disabled={statusLoading}

                    className="btn-primary-coral flex items-center justify-center gap-2 text-xs font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 whitespace-nowrap"

                  >

                    {statusLoading ? (

                      <>

                        <RefreshCw size={14} className="animate-spin" />

                        <span>Verifying...</span>

                      </>

                    ) : (

                      <>

                        <Search size={14} />

                        <span>Check Status</span>

                      </>

                    )}

                  </button>

                </div>

              </form>



              {/* Error Alert */}

              {statusError && (

                <div className="max-w-xl mx-auto flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 mb-8 text-xs animate-fade-in">

                  <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />

                  <div>

                    <p className="font-semibold">

                      {statusError.includes("10 digits") || statusError.includes("starting with") || statusError.includes("Please enter")

                        ? "Verification Notice"

                        : "Application Not Found"}

                    </p>

                    <p className="text-rose-700 mt-0.5">{statusError}</p>

                  </div>

                </div>

              )}



              {/* Status Results Display */}

              {statusResult && (

                <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

                  {/* CASE 1: PENDING - NO CARD, NO DOWNLOAD OPTIONS */}

                  {statusResult.status === "PENDING" && (

                    <div className="border border-amber-200 bg-amber-50/70 rounded-2xl p-6 text-center">

                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-300">

                        <Clock size={24} />

                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 mb-2">

                        Status: Under Review (Pending)

                      </span>

                      <h3 className="text-lg font-bold text-amber-950">

                        Application Awaiting Committee Verification

                      </h3>

                      <p className="text-xs text-amber-800 mt-2 max-w-lg mx-auto">

                        Your application has been received and is currently under statutory review by the Maha Seva Dal Executive Committee. 

                        <strong> Official Digital Identity Cards and card download options are unlocked only after committee approval.</strong>

                      </p>



                      {/* Member Details */}

                      <div className="bg-white/80 border border-amber-200 rounded-xl p-4 mt-6 text-left grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">

                        <div>

                          <span className="text-muted-editorial block">Registration ID</span>

                          <span className="font-mono font-bold text-ink">{statusResult.registrationId}</span>

                        </div>

                        <div>

                          <span className="text-muted-editorial block">Full Name</span>

                          <span className="font-semibold text-ink">{statusResult.fullName}</span>

                        </div>

                        <div>

                          <span className="text-muted-editorial block">Wing</span>

                          <span className="font-medium text-ink">{statusResult.wing}</span>

                        </div>

                        <div>

                          <span className="text-muted-editorial block">District & State</span>

                          <span className="font-medium text-ink">{statusResult.district}, {statusResult.state}</span>

                        </div>

                        <div>

                          <span className="text-muted-editorial block">Assembly Constituency</span>

                          <span className="font-medium text-ink">{statusResult.assembly || "—"}</span>

                        </div>

                        <div>

                          <span className="text-muted-editorial block">Zone / Region</span>

                          <span className="font-medium text-ink">{statusResult.zone || "—"}</span>

                        </div>

                      </div>



                      <div className="mt-5 text-[11px] text-amber-700 bg-amber-100/60 rounded-lg p-3">

                        💡 Please check back after 24-48 hours. Once the Admin approves your membership in the secretariat portal, your ID card download options will appear right here.

                      </div>



                      <div className="mt-4 flex justify-center">

                        <button

                          type="button"

                          onClick={() => handleDownloadReceiptPdf(statusResult)}

                          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/80 text-amber-900 transition-colors shadow-xs cursor-pointer"

                          title="Download official acknowledgment PDF"

                        >

                          <Download size={14} className="text-[#FF6200]" />

                          <span>Download Acknowledgment</span>

                        </button>

                      </div>

                    </div>

                  )}



                  {/* CASE 2: REJECTED - NO CARD, NO DOWNLOAD OPTIONS */}

                  {statusResult.status === "REJECTED" && (

                    <div className="border border-rose-200 bg-rose-50/70 rounded-2xl p-6 text-center">

                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3 border border-rose-300">

                        <AlertCircle size={24} />

                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-200 text-rose-900 mb-2">

                        Status: Application Not Approved (Rejected)

                      </span>

                      <h3 className="text-lg font-bold text-rose-950">

                        Membership Application Not Accepted

                      </h3>

                      <p className="text-xs text-rose-800 mt-2 max-w-lg mx-auto">

                        Your application could not be verified by the committee at this time. For clarification or to re-apply with corrected credentials, please reach out to the Maha Seva Dal Secretariat.

                      </p>



                      {/* Rejection Reason / Secretariat Remark Callout */}

                      {(statusResult.rejectReason || statusResult.adminNotes) && (

                        <div className="bg-white border-2 border-rose-300 rounded-xl p-4 mt-4 text-left shadow-2xs">

                          <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1.5">

                            <AlertCircle size={15} className="text-rose-600 shrink-0" />

                            <span>Reason for Rejection / Secretariat Remark:</span>

                          </div>

                          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-lg text-rose-950 font-semibold text-xs leading-relaxed whitespace-pre-wrap">

                            {statusResult.rejectReason || statusResult.adminNotes}

                          </div>

                          <p className="text-[11px] text-muted-editorial mt-2">

                            Please rectify the issue mentioned above before submitting a fresh application.

                          </p>

                        </div>

                      )}



                      <div className="bg-white/80 border border-rose-200 rounded-xl p-4 mt-4 text-left grid grid-cols-2 gap-3 text-xs">

                        <div>

                          <span className="text-muted-editorial block">Registration ID</span>

                          <span className="font-mono font-bold text-ink">{statusResult.registrationId}</span>

                        </div>

                        <div>

                          <span className="text-muted-editorial block">Full Name</span>

                          <span className="font-semibold text-ink">{statusResult.fullName}</span>

                        </div>

                        {statusResult.wing && (

                          <div>

                            <span className="text-muted-editorial block">Wing Applied</span>

                            <span className="font-medium text-ink">{statusResult.wing}</span>

                          </div>

                        )}

                        {statusResult.state && (

                          <div>

                            <span className="text-muted-editorial block">Region</span>

                            <span className="font-medium text-ink">{statusResult.district ? `${statusResult.district}, ` : ""}{statusResult.state}</span>

                          </div>

                        )}

                      </div>



                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

                        <button

                          type="button"

                          onClick={() => {

                            setActiveTab("register");

                            setStep(1);

                            setRegisteredMember(null);

                          }}

                          className="btn-primary-coral text-xs px-4 py-2 font-semibold"

                        >

                          Submit New Application

                        </button>

                        <button

                          type="button"

                          onClick={() => setSupportModalOpen(true)}

                          className="btn-secondary text-xs px-4 py-2 font-medium cursor-pointer"

                        >

                          Contact Secretariat Support

                        </button>

                      </div>

                    </div>

                  )}



                  {/* CASE 3: APPROVED - SHOW THE CARD AND DOWNLOAD OPTIONS */}

                  {statusResult.status === "APPROVED" && (

                    <div className="space-y-6">

                      {/* Approval Banner */}

                      <div className="flex items-start gap-3 sm:gap-4 text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 sm:p-5">

                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-300">

                          <ShieldCheck size={22} />

                        </div>

                        <div>

                          <div className="flex items-center gap-2 flex-wrap">

                            <h3 className="font-bold text-sm sm:text-base text-emerald-950">

                              Membership Approved · Official Cadre Member

                            </h3>

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">

                              <CheckCircle2 size={12} /> Verified

                            </span>

                          </div>

                          <p className="text-xs text-emerald-700 mt-1">

                            Congratulations! Your membership has been approved by the Maha Seva Dal Secretariat. Your official Digital PVC Identity Card is ready below with download and print options.

                          </p>

                        </div>

                      </div>



                      {/* Official PVC Digital Identity Card with Download & Print Options */}

                      <div className="flex justify-center pt-2 w-full max-w-full overflow-hidden">

                        <DigitalIdCard

                          member={statusResult}

                          qrDataUrl={statusQrUrl}

                          defaultView="both"

                        />

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

          )}

        </div>

      </section>



      {/* ─── PASSPORT PHOTO CROP MODAL ─────────────────────────────────────── */}

      <ImageCropModal

        isOpen={cropModalOpen}

        imageSrc={rawPhotoSrc}

        onClose={() => setCropModalOpen(false)}

        onCropComplete={handleCropComplete}

        onUseOriginal={() => setCropModalOpen(false)}

        title="Official ID Photo Framing"

      />



      {/* ─── OFFICIAL SECRETARIAT DETAILS POPUP MODAL (SIMPLE ONLY) ────────── */}

      {supportModalOpen && (

        <div

          className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"

          onClick={(e) => {

            if (e.target === e.currentTarget) setSupportModalOpen(false);

          }}

        >

          <div

            className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-sm w-full p-6 relative animate-scale-up"

            onClick={(e) => e.stopPropagation()}

          >

            {/* Close Button */}

            <button

              type="button"

              onClick={() => setSupportModalOpen(false)}

              className="absolute top-4 right-4 p-1 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"

              title="Close"

            >

              <X size={16} />

            </button>



            {/* Title */}

            <h3 className="font-serif text-lg font-bold text-ink mb-5 tracking-tight">

              Official Head Office

            </h3>



            {/* Simple Details List */}

            <ul className="space-y-4 text-xs text-body">

              <li className="flex items-start gap-3">

                <MapPin size={16} className="text-[#FF6200] flex-shrink-0 mt-0.5" />

                <span className="leading-relaxed text-ink">

                  No.8/7, Thiruvallar 1st Street, Adambakkam, Chennai - 600 088.

                </span>

              </li>

              <li className="flex items-center gap-3">

                <Mail size={16} className="text-[#FF6200] flex-shrink-0" />

                <a

                  href="mailto:mahasevadalorganization@gmail.com"

                  className="hover:text-[#FF6200] transition-colors break-all font-medium text-ink"

                >

                  mahasevadalorganization@gmail.com

                </a>

              </li>

              <li className="flex items-center gap-3">

                <Phone size={16} className="text-[#FF6200] flex-shrink-0" />

                <div className="font-mono font-medium text-ink flex items-center gap-1.5 flex-wrap">
                  <a href="tel:+919994625690" className="hover:text-[#FF6200] transition-colors">
                    +91 9994625690
                  </a>
                  <span>,</span>
                  <a href="tel:+919514576540" className="hover:text-[#FF6200] transition-colors">
                    +91 9514576540
                  </a>
                </div>

              </li>

            </ul>



            {/* Simple Close Button */}

            <div className="mt-6 pt-4 border-t border-hairline flex justify-end">

              <button

                type="button"

                onClick={() => setSupportModalOpen(false)}

                className="btn-primary-coral text-xs px-4 py-1.5 font-semibold cursor-pointer"

              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </PageLayout>

  );

};



export default Register;

