import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DigitalIdCard from "./DigitalIdCard";

describe("DigitalIdCard Component", () => {
  const sampleMember = {
    registrationId: "MSD-KA-2026-0001",
    fullName: "Arun Kumar",
    fatherName: "Ramesh Kumar",
    dob: "1990-05-15",
    gender: "Male",
    mobile: "9876543210",
    bloodGroup: "O+",
    state: "Karnataka",
    district: "Bangalore Urban",
    taluk: "Bangalore North",
    wing: "Youth Wing",
    status: "Approved",
    createdAt: "2026-01-10T10:00:00.000Z",
  };

  const sampleQr = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  it("should render member name and registration ID", () => {
    render(<DigitalIdCard member={sampleMember} qrDataUrl={sampleQr} />);

    // Check member name is rendered
    expect(screen.getAllByText(/Arun Kumar/i).length).toBeGreaterThan(0);
    // Check registration ID is displayed
    expect(screen.getAllByText(/MSD-KA-2026-0001/i).length).toBeGreaterThan(0);
  });

  it("should render location and wing details", () => {
    render(<DigitalIdCard member={sampleMember} qrDataUrl={sampleQr} />);

    expect(screen.getAllByText(/Karnataka/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bangalore Urban/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Youth Wing/i).length).toBeGreaterThan(0);
  });

  it("should render QR code element with provided qrDataUrl", () => {
    render(<DigitalIdCard member={sampleMember} qrDataUrl={sampleQr} />);

    const qrImages = screen.getAllByAltText(/Verify QR/i);
    expect(qrImages.length).toBeGreaterThan(0);
    expect(qrImages[0]).toHaveAttribute("src", sampleQr);
  });

  it("should not display provisional pending watermark when member is Approved", () => {
    render(<DigitalIdCard member={sampleMember} qrDataUrl={sampleQr} />);

    expect(screen.queryByText(/PROVISIONAL · PENDING/i)).not.toBeInTheDocument();
  });

  it("should display PROVISIONAL · PENDING watermark when member is Pending", () => {
    const pendingMember = { ...sampleMember, status: "Pending" };
    render(<DigitalIdCard member={pendingMember} qrDataUrl={sampleQr} />);

    expect(screen.getByText(/PROVISIONAL · PENDING/i)).toBeInTheDocument();
  });

  it("should hide action buttons when hideActionButtons is true", () => {
    render(<DigitalIdCard member={sampleMember} qrDataUrl={sampleQr} hideActionButtons={true} />);

    expect(screen.queryByText(/Download PDF/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Both Sides (PNG)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Front Side (PNG)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Back Side (PNG)/i)).not.toBeInTheDocument();
  });

  it("should render download options: PDF, Both Sides, Front Side, and Back Side", () => {
    render(<DigitalIdCard member={sampleMember} qrDataUrl={sampleQr} />);
    expect(screen.getByText("Download PDF")).toBeInTheDocument();
    expect(screen.getByText("Both Sides (PNG)")).toBeInTheDocument();
    expect(screen.getByText("Front Side (PNG)")).toBeInTheDocument();
    expect(screen.getByText("Back Side (PNG)")).toBeInTheDocument();
  });

  it("should export renderCleanCardOffscreen, addPaddingToCardDataUrl and combineCapturedCards", async () => {
    const { renderCleanCardOffscreen, addPaddingToCardDataUrl, combineCapturedCards, generateCombinedIdCardCanvas, setPng300Dpi } = await import("./DigitalIdCard");
    expect(typeof renderCleanCardOffscreen).toBe("function");
    expect(typeof addPaddingToCardDataUrl).toBe("function");
    expect(typeof combineCapturedCards).toBe("function");
    expect(typeof generateCombinedIdCardCanvas).toBe("function");
    expect(typeof setPng300Dpi).toBe("function");

    // Empty input should safely return empty string
    const result = await addPaddingToCardDataUrl("");
    expect(result).toBe("");
  });

  it("should embed 300 DPI pHYs chunk into PNG data URLs", async () => {
    const { setPng300Dpi } = await import("./DigitalIdCard");
    const output = setPng300Dpi(sampleQr, 300);
    expect(output).toContain("data:image/png;base64,");

    // Decode and verify the pHYs chunk presence
    const base64 = output.replace("data:image/png;base64,", "");
    const binary = atob(base64);
    expect(binary.includes("pHYs")).toBe(true);
  });

  it("should render Emergency Contact with relation on card back when provided", () => {
    const memberWithEmergency = {
      ...sampleMember,
      emergencyNumber: "9123456789",
      emergencyRelation: "Mother",
    };
    render(<DigitalIdCard member={memberWithEmergency} qrDataUrl={sampleQr} defaultView="both" />);

    expect(screen.getByText("Emergency Contact")).toBeInTheDocument();
    expect(screen.getByText("9123456789")).toBeInTheDocument();
    expect(screen.getByText("(Mother)")).toBeInTheDocument();
  });

  it("should render Assembly Constituency and Zone / Region on the front of the ID card", () => {
    const memberWithAssemblyZone = {
      ...sampleMember,
      assembly: "Thiyagarayanagar",
      zone: "CHENNAI ZONE",
    };
    render(<DigitalIdCard member={memberWithAssemblyZone} qrDataUrl={sampleQr} defaultView="front" />);

    expect(screen.getByText("Assembly Constituency")).toBeInTheDocument();
    expect(screen.getByText("Thiyagarayanagar")).toBeInTheDocument();
    expect(screen.getByText("Zone / Region")).toBeInTheDocument();
    expect(screen.getByText("CHENNAI ZONE")).toBeInTheDocument();
  });
});
