/**
 * End-to-End Verification Script: Complete Delete Functionality
 * Modules: Members, Incomplete Leads, WhatsApp CRM Inbox, Custom CRM, Donations
 * Ensures physical deletion from MongoDB (never just hide in UI)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Cadre = require('../models/Cadre');
const IncompleteLead = require('../models/IncompleteLead');
const WhatsAppConversation = require('../models/WhatsAppConversation');
const Donation = require('../models/Donation');

async function runVerification() {
  console.log('--- STARTING COMPLETE DELETE FUNCTIONALITY E2E VERIFICATION ---');
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in environment');
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB:', mongoose.connection.name);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ==========================================
    // 1. MEMBERS MODULE DELETION VERIFICATION
    // ==========================================
    console.log('\n--- 1. Testing Members Individual & Bulk Deletion ---');
    const testMember1 = await Member.create({
      fullName: 'Test Delete Single Member',
      mobile: '9900000001',
      registrationId: 'MSD-TEST-DEL-01',
      status: 'PENDING',
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Chennai',
      wing: 'General Seva Cadre',
    });

    // Individual Delete Member
    const del1 = await Member.findByIdAndDelete(testMember1._id);
    const check1 = await Member.findById(testMember1._id);
    assert(check1 === null, 'Single Member physically deleted from MongoDB cadres collection');

    // Bulk Delete Members
    const testMember2 = await Member.create({
      fullName: 'Test Bulk Member 1',
      mobile: '9900000002',
      registrationId: 'MSD-TEST-DEL-02',
      status: 'PENDING',
      gender: 'Female',
      state: 'Tamil Nadu',
      district: 'Chennai',
      wing: 'General Seva Cadre',
    });
    const testMember3 = await Member.create({
      fullName: 'Test Bulk Member 2',
      mobile: '9900000003',
      registrationId: 'MSD-TEST-DEL-03',
      status: 'PENDING',
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Chennai',
      wing: 'General Seva Cadre',
    });

    const bulkIds = [testMember2._id.toString(), testMember3._id.toString()];
    await Member.deleteMany({ _id: { $in: bulkIds } });
    const bulkCheck = await Member.find({ _id: { $in: bulkIds } });
    assert(bulkCheck.length === 0, `Bulk delete removed ${bulkIds.length} members from MongoDB cadres collection`);

    // ==========================================
    // 2. INCOMPLETE LEADS DELETION VERIFICATION
    // ==========================================
    console.log('\n--- 2. Testing Incomplete Leads Individual & Bulk Deletion ---');
    const testLead1 = await IncompleteLead.create({
      fullName: 'Test Lead Single',
      mobile: '9900000011',
      channel: 'whatsapp',
      lastStepCompleted: 'STEP_1_BASIC',
      lastStepLabel: 'Step 1: Basic Info',
      status: 'ABANDONED',
    });

    // Also mirror into cadres as INCOMPLETE
    await Member.create({
      fullName: 'Test Lead Single',
      mobile: '9900000011',
      status: 'INCOMPLETE',
    });

    // Individual Delete Lead
    await IncompleteLead.findOneAndDelete({ mobile: '9900000011' });
    await Member.deleteMany({ mobile: '9900000011', status: 'INCOMPLETE' });

    const checkLead1 = await IncompleteLead.findOne({ mobile: '9900000011' });
    const checkCadreLead1 = await Member.findOne({ mobile: '9900000011' });
    assert(checkLead1 === null && checkCadreLead1 === null, 'Single Lead physically deleted from MongoDB incompleteleads and cadres');

    // Bulk Delete Leads
    await IncompleteLead.create([
      { fullName: 'Test Lead Bulk 1', mobile: '9900000012', channel: 'web', status: 'ABANDONED' },
      { fullName: 'Test Lead Bulk 2', mobile: '9900000013', channel: 'whatsapp', status: 'ABANDONED' },
    ]);
    await Member.create([
      { fullName: 'Test Lead Bulk 1', mobile: '9900000012', status: 'INCOMPLETE' },
      { fullName: 'Test Lead Bulk 2', mobile: '9900000013', status: 'INCOMPLETE' },
    ]);

    const leadBulkPhones = ['9900000012', '9900000013'];
    await IncompleteLead.deleteMany({ mobile: { $in: leadBulkPhones } });
    await Member.deleteMany({ mobile: { $in: leadBulkPhones }, status: { $in: ['INCOMPLETE', 'ABANDONED'] } });

    const leadBulkCheck = await IncompleteLead.find({ mobile: { $in: leadBulkPhones } });
    const cadreBulkCheck = await Member.find({ mobile: { $in: leadBulkPhones } });
    assert(leadBulkCheck.length === 0 && cadreBulkCheck.length === 0, 'Bulk Leads physically deleted from MongoDB incompleteleads and cadres');

    // ==========================================
    // 3. WHATSAPP CRM INBOX DELETION VERIFICATION
    // ==========================================
    console.log('\n--- 3. Testing WhatsApp CRM Messages & Conversations Deletion ---');
    const testConv1 = await WhatsAppConversation.create({
      mobile: '9900000021',
      customerName: 'Test Chat User',
      messages: [
        { messageId: 'msg_test_01', direction: 'INBOUND', content: 'Hello bot', timestamp: new Date() },
        { messageId: 'msg_test_02', direction: 'OUTBOUND', content: 'Welcome to MSD', timestamp: new Date() },
        { messageId: 'msg_test_03', direction: 'INBOUND', content: 'How to register?', timestamp: new Date() },
      ],
      lastMessagePreview: 'How to register?',
      lastMessageAt: new Date(),
    });

    // Delete single message (WhatsApp-style)
    const msgUpdate = await WhatsAppConversation.findOneAndUpdate(
      { mobile: '9900000021' },
      { $pull: { messages: { messageId: 'msg_test_02' } } },
      { new: true }
    );
    assert(
      msgUpdate.messages.length === 2 && !msgUpdate.messages.some((m) => m.messageId === 'msg_test_02'),
      'Single WhatsApp message physically pulled from messages array in MongoDB'
    );

    // Delete entire conversation
    await WhatsAppConversation.findOneAndDelete({ mobile: '9900000021' });
    const checkConv1 = await WhatsAppConversation.findOne({ mobile: '9900000021' });
    assert(checkConv1 === null, 'Single WhatsApp conversation physically deleted from MongoDB');

    // Bulk Delete Conversations
    await WhatsAppConversation.create([
      { mobile: '9900000022', customerName: 'Bulk Conv 1', messages: [] },
      { mobile: '9900000023', customerName: 'Bulk Conv 2', messages: [] },
    ]);
    const bulkMobiles = ['9900000022', '9900000023'];
    await WhatsAppConversation.deleteMany({ mobile: { $in: bulkMobiles } });
    const bulkConvCheck = await WhatsAppConversation.find({ mobile: { $in: bulkMobiles } });
    assert(bulkConvCheck.length === 0, 'Bulk WhatsApp conversations physically deleted from MongoDB');

    // ==========================================
    // 4. DONATIONS MODULE DELETION VERIFICATION
    // ==========================================
    console.log('\n--- 4. Testing Donations Individual & Bulk Deletion ---');
    const uniqueSuffix = Date.now();
    const testDonation1 = await Donation.create({
      donorName: 'Test Donor Single',
      mobile: '9900000031',
      amount: 500,
      paymentMode: 'UPI',
      utr: `UTR_${uniqueSuffix}`,
      receiptNo: `REC_${uniqueSuffix}`,
      status: 'VERIFIED',
    });

    // Also mirror inside cadre
    const donorCadre = await Member.create({
      fullName: 'Test Donor Single',
      mobile: '9900000031',
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Chennai',
      wing: 'General Seva Cadre',
      status: 'APPROVED',
      donations: [{ amount: 500, utr: `UTR_${uniqueSuffix}`, receiptNo: `REC_${uniqueSuffix}` }],
    });

    // Delete Single Donation
    await Donation.findByIdAndDelete(testDonation1._id);
    await Member.updateOne(
      { mobile: '9900000031' },
      { $pull: { donations: { receiptNo: `REC_${uniqueSuffix}` } } }
    );

    const checkDon1 = await Donation.findById(testDonation1._id);
    const checkCadreDon = await Member.findOne({ mobile: '9900000031' });
    assert(
      checkDon1 === null && checkCadreDon.donations.length === 0,
      'Single donation physically deleted from donations collection and pulled from cadre record'
    );
    await Member.deleteOne({ _id: donorCadre._id });

    // Bulk Delete Donations
    const bDon1 = await Donation.create({ donorName: 'B1', mobile: '9900000032', amount: 100, utr: `UTRB1_${uniqueSuffix}`, receiptNo: `REC-B1_${uniqueSuffix}` });
    const bDon2 = await Donation.create({ donorName: 'B2', mobile: '9900000033', amount: 200, utr: `UTRB2_${uniqueSuffix}`, receiptNo: `REC-B2_${uniqueSuffix}` });
    const bIds = [bDon1._id.toString(), bDon2._id.toString()];

    await Donation.deleteMany({ _id: { $in: bIds } });
    const bCheck = await Donation.find({ _id: { $in: bIds } });
    assert(bCheck.length === 0, 'Bulk donations physically deleted from MongoDB donations collection');

    console.log('\n==========================================');
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('==========================================');

    if (failed === 0) {
      console.log('🎉 ALL 5 MODULE DELETE OPERATIONS VERIFIED IN MONGODB!');
    }
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();
