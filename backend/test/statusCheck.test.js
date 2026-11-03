const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const Member = require("../models/Member");
const { app } = require("../server");

test("Public status check PII protection and flexible lookup (F13)", async (t) => {
  let server;
  let baseUrl;
  let originalFindOne;

  t.before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    originalFindOne = Member.findOne;
  });

  t.after(async () => {
    Member.findOne = originalFindOne;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  });

  await t.test("rejects request missing any search query with 400", async () => {
    const res = await fetch(`${baseUrl}/api/members/status`);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Please enter your Registration ID or 10-digit Mobile Number/);
  });

  await t.test("rejects invalid mobile number format with 400", async () => {
    const res = await fetch(`${baseUrl}/api/members/status?query=12345`);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /10 digits/);
  });

  await t.test("returns 404 when no member matches the query", async () => {
    Member.findOne = () => ({
      lean: async () => null,
    });

    const res = await fetch(`${baseUrl}/api/members/status?query=9876543210`);
    assert.strictEqual(res.status, 404);
  });

  await t.test("returns ONLY public non-sensitive fields when member matches by mobile", async () => {
    Member.findOne = () => ({
      lean: async () => ({
        _id: "mongo-id-1234",
        registrationId: "MSD-MH-2026-0001",
        fullName: "Rahul Patil",
        fatherName: "Suresh Patil",
        dob: "1990-05-15",
        age: 34,
        gender: "Male",
        mobile: "9876543210",
        whatsapp: "9876543210",
        email: "rahul@secret.com",
        bloodGroup: "O+",
        photoUrl: "https://res.cloudinary.com/msd/photo.jpg",
        state: "Maharashtra",
        district: "Pune",
        taluk: "Haveli",
        address: "123 Private Street, Flat 402",
        pincode: "411001",
        wing: "Youth Wing",
        profession: "Engineer",
        status: "APPROVED",
        idProofType: "Aadhaar Card",
        idProofNumber: "1234-5678-9012",
        createdAt: "2026-01-01T00:00:00.000Z",
        approvedAt: "2026-01-02T00:00:00.000Z",
      }),
    });

    const res = await fetch(`${baseUrl}/api/members/status?query=9876543210`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.member);

    // Card and receipt fields required for PVC Digital ID card generation
    assert.strictEqual(body.member.registrationId, "MSD-MH-2026-0001");
    assert.strictEqual(body.member.fullName, "Rahul Patil");
    assert.strictEqual(body.member.fatherName, "Suresh Patil");
    assert.strictEqual(body.member.dob, "1990-05-15");
    assert.strictEqual(body.member.age, 34);
    assert.strictEqual(body.member.gender, "Male");
    assert.strictEqual(body.member.mobile, "9876543210");
    assert.strictEqual(body.member.whatsapp, "9876543210");
    assert.strictEqual(body.member.email, "rahul@secret.com");
    assert.strictEqual(body.member.bloodGroup, "O+");
    assert.strictEqual(body.member.address, "123 Private Street, Flat 402");
    assert.strictEqual(body.member.taluk, "Haveli");
    assert.strictEqual(body.member.pincode, "411001");
    assert.strictEqual(body.member.status, "APPROVED");
    assert.strictEqual(body.member.wing, "Youth Wing");
    assert.strictEqual(body.member.state, "Maharashtra");
    assert.strictEqual(body.member.district, "Pune");

    // Strictly stripped confidential fields (government ID proof and internal notes)
    assert.strictEqual(body.member.idProofNumber, undefined, "ID proof number must not be returned");
    assert.strictEqual(body.member.idProofType, undefined, "ID proof type must not be returned");
    assert.strictEqual(body.member.adminNotes, undefined, "Admin notes must not be returned");
    assert.strictEqual(body.member._id, undefined, "Internal Mongo ID must not be returned");
  });

  await t.test("returns public verification fields when looked up by registration ID", async () => {
    Member.findOne = () => ({
      lean: async () => ({
        registrationId: "MSD-MH-2026-0001",
        fullName: "Rahul Patil",
        status: "APPROVED",
        wing: "Youth Wing",
        state: "Maharashtra",
        district: "Pune",
      }),
    });

    const res = await fetch(`${baseUrl}/api/members/status?query=MSD-MH-2026-0001`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.member.registrationId, "MSD-MH-2026-0001");
  });

  await t.test("returns rejectReason when application is REJECTED", async () => {
    Member.findOne = () => ({
      lean: async () => ({
        registrationId: "MSD-MH-2026-0002",
        fullName: "Sanjay Deshmukh",
        status: "REJECTED",
        adminNotes: "Duplicate application • Photo invalid",
        wing: "Youth Wing",
        state: "Maharashtra",
        district: "Pune",
      }),
    });

    const res = await fetch(`${baseUrl}/api/members/status?query=MSD-MH-2026-0002`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.member.status, "REJECTED");
    assert.strictEqual(body.member.rejectReason, "Duplicate application • Photo invalid");
  });

  await t.test("rejects status update to REJECTED if remarks are missing or empty with 400", async () => {
    const { updateMemberStatus } = require("../controllers/memberController");
    const fakeMember = { status: "PENDING", adminNotes: "", save: async () => fakeMember };
    const originalFindById = Member.findById;
    Member.findById = async () => fakeMember;

    let statusCode;
    let jsonResult;
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { status: "REJECTED", adminNotes: "   " },
      admin: { username: "admin" },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await updateMemberStatus(req, res);
    Member.findById = originalFindById;

    assert.strictEqual(statusCode, 400);
    assert.match(jsonResult.error, /compulsory/i);
  });
});

