const test = require("node:test");
const assert = require("node:assert");
const { formatWhatsAppReceipt } = require("../controllers/donationController");

test("Donation WhatsApp Receipt Formatter", async (t) => {
  await t.test("generates full WhatsApp receipt with donor name, amount, UTR, and receipt number", () => {
    const mockDonation = {
      receiptNo: "MSD-DON-2026-0042",
      donorName: "Suresh Kumar",
      mobile: "9876543210",
      amount: 1100,
      utr: "432109876543",
      cause: "Daily Annadanam & Seva",
      paymentMode: "UPI",
      isMember: false,
      createdAt: new Date("2026-10-31T10:00:00Z"),
    };

    const text = formatWhatsAppReceipt(mockDonation);
    assert.ok(text.includes("Suresh Kumar"), "Should contain donor name");
    assert.ok(text.includes("MSD-DON-2026-0042"), "Should contain receipt number");
    assert.ok(text.includes("1,100"), "Should contain formatted amount");
    assert.ok(text.includes("432109876543"), "Should contain UTR");
    assert.ok(text.includes("mahasevadal@sbi"), "Should mention official UPI beneficiary");
    assert.ok(text.includes("MAHA SEVA DAL FOUNDATION"), "Should contain organization header");
  });

  await t.test("includes Cadre ID when donor is an existing cadre member", () => {
    const mockMemberDonation = {
      receiptNo: "MSD-DON-2026-0043",
      donorName: "Jaysurya S",
      mobile: "9888888888",
      amount: 5000,
      utr: "998877665544",
      cause: "Education & Child Welfare",
      paymentMode: "UPI",
      isMember: true,
      memberRegId: "MSD-IND-2026-0001",
      memberWing: "Education & Child Welfare",
      createdAt: new Date("2026-10-31T10:00:00Z"),
    };

    const text = formatWhatsAppReceipt(mockMemberDonation);
    assert.ok(text.includes("Jaysurya S"), "Should contain member name");
    assert.ok(text.includes("MSD-IND-2026-0001"), "Should mention Cadre ID");
    assert.ok(text.includes("Education & Child Welfare"), "Should mention Cadre Wing");
    assert.ok(text.includes("5,000"), "Should format amount");
  });
});

