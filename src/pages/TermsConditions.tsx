import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Gavel,
  ArrowLeft,
  Mail,
  Phone,
} from "lucide-react";

const TermsConditions: React.FC = () => {
  return (
    <PageLayout>
      <section className="py-12 lg:py-20 bg-canvas min-h-screen border-b border-hairline">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Standard Editorial Page Header (matching Home & site soul) */}
          <PageHeader
            category="Estd. 1947 · Voluntary Cadre Constitution"
            title="Terms & Conditions of Service"
            subtitle="Rules, operational code of conduct, digital credentials usage, and legal provisions governing participation in Maha Seva Dal."
          />

          {/* Meta Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-editorial font-mono mb-12 -mt-4">
            <span className="bg-surface-card px-3 py-1 rounded-full border border-hairline text-ink">
              Last Revised: 1st January 2026
            </span>
            <span className="text-hairline">·</span>
            <span className="bg-surface-card px-3 py-1 rounded-full border border-hairline text-ink">
              Jurisdiction: Republic of India
            </span>
            <span className="text-hairline">·</span>
            <span className="bg-surface-card px-3 py-1 rounded-full border border-hairline text-ink">
              Maha Seva Dal Central Secretariat
            </span>
          </div>

          {/* Main Card Content Container (warm cream card aesthetic) */}
          <div className="card-feature-cream bg-white/95 border border-hairline rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-body text-sm sm:text-base leading-relaxed">

            {/* Crucial Legal Disclaimer Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2.5">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-amber-900">
                <ShieldAlert size={18} className="text-amber-700" />
                <span>Primary Status Declaration & Legal Disclaimer</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-900">
                Maha Seva Dal (MSD) is an independent, non-profit socio-cultural voluntary organization founded in 1947.
                <strong>
                  {" "}Enrollment as a volunteer cadre member does NOT constitute government employment, police empowerment,
                  or statutory law-enforcement authority.{" "}
                </strong>
                The Official Identity Card is issued solely for internal organizational accreditation and authorized civic service.
              </p>
            </div>

            {/* Section 1: Voluntary Nature of Service */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  01
                </span>
                <span>Honorary & Voluntary Nature of Cadre Service</span>
              </h2>
              <p>By registering on this portal or participating in any MSD program, you acknowledge and agree that:</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6200] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Non-Remunerative Service:</strong> All participation is purely honorary, voluntary, and
                    non-salaried. No employer-employee relationship exists between volunteers and Maha Seva Dal.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6200] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Non-Partisan Social Welfare:</strong> Activities are guided by the 1947 foundational creed of
                    communal harmony, disaster relief, Annadanam, and youth empowerment without discrimination based on
                    caste, creed, religion, or linguistic origin.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6200] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Right of Voluntary Withdrawal:</strong> A cadre volunteer may resign from membership at any time
                    by notifying the secretariat or requesting permanent account deletion.
                  </span>
                </li>
              </ul>
            </article>

            {/* Section 2: ID Card Usage & Code of Conduct */}
            <article className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  02
                </span>
                <span>Official Identity Card Usage & Disciplinary Code</span>
              </h2>
              <p>
                Approved cadre members are granted a Digital PVC Identity Card and printable certificate featuring a unique
                Registration ID, official emblem, authorized seal, and QR code verification. Possession of this credential
                is subject to strict rules:
              </p>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 text-rose-950 space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-rose-700" />
                  <span>Strictly Prohibited Acts & Misuse of Identity Credentials</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-rose-900">
                  <li>
                    <strong>No Claim of Police or Government Authority:</strong> You must never present the MSD card as a
                    government officer ID, press pass, or law enforcement badge.
                  </li>
                  <li>
                    <strong>No Commercial Toll or Transport Exemption:</strong> The card provides no exemption from toll fees,
                    vehicle checks, parking charges, or public carrier tariffs.
                  </li>
                  <li>
                    <strong>No Intimidation or Extortion:</strong> Using the card or organization name to threaten, harass,
                    intimidate private citizens, or solicit unauthorized funds is strictly prohibited.
                  </li>
                  <li>
                    <strong>No Unauthorized Representation:</strong> Members may not speak to news media or issue press
                    releases on behalf of the Central Executive Committee without prior written authorization.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-hairline bg-surface-soft text-xs sm:text-sm space-y-2">
                <div className="font-bold text-ink flex items-center gap-1.5">
                  <Gavel size={15} className="text-[#FF6200]" />
                  <span>Revocation & Cancellation Clause</span>
                </div>
                <p className="text-muted-editorial leading-relaxed">
                  The Central Disciplinary Committee reserves the unreserved, unilateral right to suspend, terminate, or
                  permanently cancel membership and void any issued ID card if a volunteer violates the code of conduct,
                  engages in criminal activity, or acts contrary to national unity and peace. Upon termination, public QR
                  verification will immediately return a <em>"REVOKED / INVALID"</em> status.
                </p>
              </div>
            </article>

            {/* Section 3: Truthfulness of Registration */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  03
                </span>
                <span>Accuracy of Information & Document Verification</span>
              </h2>
              <p>
                During registration, applicants must supply truthful and verifiable personal information. Submitting
                forged identification, false addresses, deceptive qualifications, or impersonating another citizen constitutes
                a serious violation of Indian penal laws and will lead to immediate disqualification and reporting to relevant
                authorities.
              </p>
            </article>

            {/* Section 4: Donations & Financial Contributions */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  04
                </span>
                <span>Voluntary Contributions & Donations Policy</span>
              </h2>
              <p>For visitors and supporters contributing through our portal:</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <DollarSign size={16} className="text-[#FF6200] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Purely Charitable Contributions:</strong> All financial contributions made to Maha Seva Dal
                    are voluntary donations utilized entirely toward charitable causes (e.g., Annadanam food distribution,
                    disaster relief packs, cultural conferences, and medical camps).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign size={16} className="text-[#FF6200] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Non-Refundable Clause:</strong> Donations once processed and acknowledged cannot be cancelled,
                    charged back, or refunded, as funds are disbursed directly toward ongoing social welfare operations.
                  </span>
                </li>
              </ul>
            </article>

            {/* Section 5: Appointments & Event Participation */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  05
                </span>
                <span>Appointments & Event Participation</span>
              </h2>
              <p>
                Requests for executive meetings and passes for annual cultural assemblies (Guru Poornima, Mahashivratri Jagaran)
                are subject to venue capacity, security clearances, and executive availability. The Secretariat reserves the
                right to reschedule, modify, or decline entry to maintain public safety and peace.
              </p>
            </article>

            {/* Section 6: Intellectual Property & Emblem Protection */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  06
                </span>
                <span>Emblem, Trademark & Intellectual Property</span>
              </h2>
              <p>
                The organizational emblem, the name <em>"Maha Seva Dal"</em>, our historic 1947 crest, authorized digital seals,
                and ID card layout formats are protected properties of the organization. Unauthorized commercial reproduction,
                counterfeiting, selling replica badges, or printing unofficial identity cards is punishable under Indian intellectual
                property and penal provisions.
              </p>
            </article>

            {/* Section 7: Limitation of Liability */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  07
                </span>
                <span>Limitation of Liability</span>
              </h2>
              <p>
                Maha Seva Dal, its trustees, executive committee, and regional coordinators are not responsible or liable for
                independent acts, private statements, civil offenses, or personal liabilities committed by individual volunteers
                outside authorized organization-directed relief operations.
              </p>
            </article>

            {/* Section 8: Governing Law & Jurisdiction */}
            <article className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 inline-flex items-center justify-center text-xs font-mono font-bold">
                  08
                </span>
                <span>Governing Law & Legal Jurisdiction</span>
              </h2>
              <p>
                These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of India.
                Any disputes arising out of membership, portal usage, or organizational credentials shall be subject to the
                exclusive jurisdiction of competent courts situated where the Central Secretariat is registered in India.
              </p>
            </article>

            {/* Secretariat Contact Box */}
            <div className="p-5 rounded-2xl bg-surface-soft border border-[#FF6200]/20 shadow-xs space-y-2">
              <div className="font-serif font-bold text-base text-ink flex items-center gap-2">
                <Award size={18} className="text-[#FF6200]" />
                <span>Central Executive Committee Contact</span>
              </div>
              <p className="text-xs text-muted-editorial">
                For official inquiries regarding membership rules, wing guidelines, or ethical compliance:
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-body">
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
              </div>
            </div>

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
                  to="/privacy"
                  className="btn-primary-coral text-xs px-4 py-2 flex items-center gap-2"
                >
                  <FileText size={14} />
                  <span>Privacy Policy</span>
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

export default TermsConditions;
