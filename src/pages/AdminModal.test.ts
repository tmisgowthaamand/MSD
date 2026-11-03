import { describe, it, expect } from "vitest";
import { getPincodeWarning, REJECTION_PRESETS } from "./Admin";

describe("Admin Member Verification Modal - Helpers & Validations", () => {
  it("provides complete list of addable rejection reason presets", () => {
    expect(REJECTION_PRESETS).toHaveLength(6);
    expect(REJECTION_PRESETS).toContain("Passport photograph blurred or invalid");
    expect(REJECTION_PRESETS).toContain("Contact phone number unreachable or invalid");
    expect(REJECTION_PRESETS).toContain("Duplicate registration detected");
  });

  it("supports chaining multiple rejection reasons with commas", () => {
    const reasons = [REJECTION_PRESETS[0], REJECTION_PRESETS[4]];
    const combined = reasons.join(", ");
    expect(combined).toBe(
      "Passport photograph blurred or invalid, Contact phone number unreachable or invalid"
    );
    expect(combined.toLowerCase()).toContain(REJECTION_PRESETS[0].toLowerCase());
    expect(combined.toLowerCase()).toContain(REJECTION_PRESETS[4].toLowerCase());
  });

  it("returns null for valid matching state and district pincodes", () => {
    // Delhi: 110001
    expect(getPincodeWarning("110001", "Delhi", "Central Delhi")).toBeNull();
    // Maharashtra Mumbai: 400001
    expect(getPincodeWarning("400001", "Maharashtra", "Mumbai")).toBeNull();
    // Karnataka Bengaluru: 560001
    expect(getPincodeWarning("560001", "Karnataka", "Bengaluru Urban")).toBeNull();
  });

  it("returns format error for invalid pincode lengths or starting with 0", () => {
    expect(getPincodeWarning("123", "Delhi")).toBe("Invalid 6-digit PIN code format");
    expect(getPincodeWarning("012345", "Delhi")).toBe("Invalid 6-digit PIN code format");
    expect(getPincodeWarning("12345a", "Delhi")).toBe("Invalid 6-digit PIN code format");
  });

  it("returns state mismatch warning when pincode does not match state circle", () => {
    // Delhi pincode given for Jharkhand (expects 81, 82, 83)
    const warning = getPincodeWarning("110001", "Jharkhand");
    expect(warning).toContain("PIN code does not match Jharkhand");
  });

  it("returns district mismatch warning when pincode does not match district prefix", () => {
    // Maharashtra state matches (40-44), but Pune district (expects 411, 412, 410) with Mumbai pin (400001)
    const warning = getPincodeWarning("400001", "Maharashtra", "Pune");
    expect(warning).toContain("PIN code does not match district Pune");
  });

  it("returns null when pincode is not provided", () => {
    expect(getPincodeWarning("", "Delhi")).toBeNull();
    expect(getPincodeWarning(undefined, "Delhi")).toBeNull();
  });
});
