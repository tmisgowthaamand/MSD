import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  return (
    <PageLayout>
      <section className="py-12 lg:py-20 bg-canvas min-h-screen border-b border-hairline">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Standard Editorial Page Header (matching Home & site soul) */}
          <PageHeader
            category="Estd. 1947 · Data Protection & Privacy Framework"
            title="Official Privacy Policy"
            subtitle="Maha Seva Dal is committed to safeguarding the privacy, personal data, and dignity of our volunteers, cadre members, donors, and community beneficiaries under Indian law."
          />

          {/* Policy Meta Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-editorial font-mono mb-12 -mt-4">
            <span className="bg-surface-card px-3 py-1 rounded-full border border-hairline text-ink">
              Effective Date: 1st January 2026
            </span>
            <span className="text-hairline">·</span>
            <span className="bg-surface-card px-3 py-1 rounded-full border border-hairline text-ink">
              Governing Law: DPDP Act, 2023 & IT Act, 2000
            </span>
            <span className="text-hairline">·</span>
            <span className="bg-surface-card px-3 py-1 rounded-full border border-hairline text-ink">
              Domain: mahasevadal.com
            </span>
          </div>

          {/* Main Card Content Container (warm cream card aesthetic) */}
          <div className="card-feature-cream bg-white/95 border border-hairline rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-body text-sm sm:text-base leading-relaxed">

            {/* Quick Summary Notice Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-soft border border-hairline space-y-3">
              <div className="flex items-center gap-2.5 text-ink font-serif font-bold text-base">
                <Lock size={18} className="text-[#FF6200]" />
                <span>Executive Summary & Our Non-Profit Pledge</span>
              </div>
              <p className="text-xs sm:text-sm text-body">
                Maha Seva Dal (MSD) operates strictly as a non-profit, non-governmental voluntary organization.
                <strong> We do not sell, rent, commercialize, or trade personal data with advertisers or corporate brokers. </strong>
                All data submitted during volunteer enrollment is utilized solely for authenticating cadre identity, issuing
                official credentials, and mobilizing relief and civic assemblies.
              </p>
            </div>

            {/* Section 1: Organizational Identity */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  01
                </span>
                <span>Data Fiduciary & Organizational Identity</span>
              </h2>
              <p>
                In accordance with the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em> and the{" "}
                <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>,
                the Data Fiduciary for this platform is:
              </p>
              <div className="p-4 rounded-xl bg-surface-soft border border-hairline font-mono text-xs text-ink space-y-1">
                <div><strong>Organization:</strong> Maha Seva Dal (Estd. 1947 · Unity of People's)</div>
                <div><strong>Head Office:</strong> No.8/7, Thiruvallar 1st Street, Adambakkam, Chennai - 600 088.</div>
                <div><strong>Official Portal:</strong> https://mahasevadal.com</div>
                <div><strong>Contact Email:</strong> mahasevadalorganization@gmail.com</div>
                <div><strong>Central Helpline:</strong> +91 9994625690, +91 9514576540</div>
              </div>
            </article>

            {/* Section 2: Data We Collect */}
            <article className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  02
                </span>
                <span>Categories of Information Collected</span>
              </h2>
              <p>
                When you interact with our portal, register as a cadre volunteer, schedule an appointment, or make a
                charitable contribution, we collect the following information:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-surface-soft/60 border border-hairline space-y-2">
                  <h3 className="font-bold text-ink flex items-center gap-1.5">
                    <UserCheck size={16} className="text-[#FF6200]" />
                    <span>Personal Demographics</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-editorial">
                    <li>Full Name and Father's / Spouse's Name</li>
                    <li>Date of Birth and Gender</li>
                    <li>Blood Group (for emergency Medical & Blood Wing mobilization)</li>
                    <li>Passport-size portrait photo (for ID card issuance)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-surface-soft/60 border border-hairline space-y-2">
                  <h3 className="font-bold text-ink flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#FF6200]" />
                    <span>Contact & Residential Data</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-editorial">
                    <li>Primary Mobile Phone & WhatsApp Number</li>
                    <li>Email Address</li>
                    <li>Full Residential Street Address, Taluk, District, State, and PIN Code</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-surface-soft/60 border border-hairline space-y-2">
                  <h3 className="font-bold text-ink flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-[#FF6200]" />
                    <span>Identity Proof & Verification</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-editorial">
                    <li>Government ID Proof Type (Aadhaar, Voter ID, PAN, Passport, Bar Council ID)</li>
                    <li>Government ID Reference Number (for genuineness check)</li>
                    <li>Self-attested KYC confirmation</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-surface-soft/60 border border-hairline space-y-2">
                  <h3 className="font-bold text-ink flex items-center gap-1.5">
                    <FileText size={16} className="text-[#FF6200]" />
                    <span>Cadre & Engagement Details</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-editorial">
                    <li>Assigned Functional Wing (Medical, Youth, Legal, Women, Seva)</li>
                    <li>Educational Qualification and Current Profession</li>
                    <li>Volunteer time commitment available per month</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Section 3: Purpose of Data Usage */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  03
                </span>
                <span>Purpose & Legal Basis of Processing</span>
              </h2>
              <p>Your information is processed strictly under consent for the following non-commercial purposes:</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Cadre Credentialing:</strong> Generating high-resolution PVC Identity Cards and printable A4
                    PDF certificates equipped with security watermarks, authorized seal, and digital signatures.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Authenticity Verification:</strong> Facilitating instant QR code verification via{" "}
                    <code className="text-[#FF6200] font-mono">https://mahasevadal.com/verify</code> so that community
                    organizers and local chapters can verify genuine active cadre status.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Emergency Relief Mobilization:</strong> Contacting volunteers during natural disasters,
                    Annadanam food drives, or blood donation emergencies according to their regional wing and blood group.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Appointments & Assembly Management:</strong> Scheduling and confirming executive meetings with
                    secretariat leadership and organizing heritage festival gatherings.
                  </span>
                </li>
              </ul>
            </article>

            {/* Section 4: Public vs Private Data Disclosure */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  04
                </span>
                <span>Public Verification vs. Confidential Data Protection</span>
              </h2>
              <p>
                To prevent fraudulent impersonation while upholding maximum member privacy, our platform strictly separates
                publicly verifiable data from confidential personal records:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={14} className="text-emerald-700" />
                    <span>Publicly Verifiable via QR Code</span>
                  </div>
                  <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                    <li>Cadre Full Name</li>
                    <li>Official Registration ID (e.g., MSD-IND-2026-XXXX)</li>
                    <li>Assigned Wing & Designation</li>
                    <li>State & District Unit</li>
                    <li>Approval Status (Approved / Pending)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                  <div className="font-bold text-xs text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={14} className="text-rose-700" />
                    <span>Strictly Confidential & Never Public</span>
                  </div>
                  <ul className="text-xs text-rose-950 space-y-1 list-disc list-inside">
                    <li>Government ID Proof Numbers (Aadhaar / Voter ID / PAN)</li>
                    <li>Complete Detailed Street Address & House Number</li>
                    <li>Private WhatsApp / Phone Numbers (unless authorized for relief)</li>
                    <li>Administrative Committee Review Logs</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Section 5: Security & Infrastructure */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  05
                </span>
                <span>Data Storage & Security Measures</span>
              </h2>
              <p>
                We implement robust administrative, technical, and physical security measures to protect your data against
                unauthorized access, accidental loss, or tampering:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-body">
                <li>
                  <strong>Encrypted Transmission:</strong> All traffic across <code className="font-mono text-[#FF6200]">mahasevadal.com</code> is
                  enforced via modern TLS/HTTPS 256-bit encryption.
                </li>
                <li>
                  <strong>Secure Cloud Storage:</strong> Volunteer photographs are hosted securely on industry-standard
                  Content Delivery Networks (Cloudinary CDN) with strict access policies.
                </li>
                <li>
                  <strong>Database Access Control:</strong> Member database records are hosted on enterprise cloud databases
                  (MongoDB Atlas) with network whitelisting, encrypted storage-at-rest, and role-based administrator tokens.
                </li>
              </ul>
            </article>

            {/* Section 6: Member Rights under DPDP Act 2023 */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  06
                </span>
                <span>Your Statutory Rights (DPDP Act, 2023)</span>
              </h2>
              <p>As a registered volunteer or donor, you possess full legal rights regarding your personal data:</p>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-surface-soft border border-hairline">
                  <strong className="text-ink">1. Right to Access & Summary:</strong> You may request a complete summary of
                  personal data held by the Secretariat under your Registration ID.
                </div>
                <div className="p-3.5 rounded-xl bg-surface-soft border border-hairline">
                  <strong className="text-ink">2. Right to Correction & Update:</strong> If your address, mobile number, or
                  wing changes, you may request updates through your state chapter coordinator or central secretariat.
                </div>
                <div className="p-3.5 rounded-xl bg-surface-soft border border-hairline">
                  <strong className="text-ink">3. Right to Permanent Erasure (Right to be Forgotten):</strong> You may request
                  permanent deletion of your member dossier, uploaded photograph, and identity records at any time. Authorized
                  administrators execute permanent purge requests from our active databases within statutory timelines.
                </div>
                <div className="p-3.5 rounded-xl bg-surface-soft border border-hairline">
                  <strong className="text-ink">4. Right of Grievance Redressal:</strong> You have the right to register complaints
                  regarding data handling directly with our Grievance Officer.
                </div>
              </div>
            </article>

            {/* Section 7: Grievance Officer Contact */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  07
                </span>
                <span>Grievance Officer & Official Secretariat</span>
              </h2>
              <p>
                In compliance with the <em>Information Technology Act, 2000</em> and DPDP rules, any questions, corrections,
                or data erasure requests should be directed to our designated officer:
              </p>

              <div className="p-5 rounded-2xl bg-surface-soft border border-[#FF6200]/20 shadow-xs space-y-2">
                <div className="font-serif font-bold text-base text-ink">
                  Central Secretariat Grievance Cell · Maha Seva Dal
                </div>
                <div className="text-xs text-muted-editorial">
                  Attention: Public Information & Data Grievance Officer
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-body">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-[#FF6200]" />
                    <a href="mailto:mahasevadalorganization@gmail.com" className="hover:underline font-mono text-ink">
                      mahasevadalorganization@gmail.com
                    </a>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-[#FF6200]" />
                    <span className="font-mono text-ink">+91 9994625690, +91 9514576540</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#FF6200]" />
                    <span>Head Office: No.8/7, Thiruvallar 1st Street, Adambakkam, Chennai - 600 088.</span>
                  </span>
                </div>
              </div>
            </article>

            {/* Navigation Buttons (Home page style) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-hairline">
              <Link
                to="/"
                className="btn-secondary-cream text-xs px-4 py-2 flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Return to Home</span>
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  to="/terms"
                  className="btn-primary-coral text-xs px-4 py-2 flex items-center gap-2"
                >
                  <FileText size={14} />
                  <span>Terms & Conditions</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-secondary-cream text-xs px-4 py-2"
                >
                  Join Cadre
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PrivacyPolicy;
