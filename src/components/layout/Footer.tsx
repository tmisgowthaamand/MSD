import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Utensils, Flame } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-surface-soft text-body pt-16 pb-12 border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-hairline">
          
          {/* Col 1: Brand & Emblem — Cloudinary CDN Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                <img src="/logo.png" alt="Maha Seva Dal Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-serif text-xl text-ink font-semibold tracking-tight">
                Maha Seva Dal
              </span>
            </div>

            <p className="text-xs leading-relaxed text-body">
              Maha Seva Dal (MSD) is a social and cultural organisation founded in 1947, dedicated to social unity, cultural preservation, and youth empowerment.
            </p>

            <div className="text-xs text-muted-editorial pt-2">
              <span className="font-semibold text-coral uppercase tracking-widest text-[10px]">Establishment</span> · 1947
            </div>
          </div>

          {/* Col 2: History & Principles */}
          <div>
            <h3 className="font-serif text-lg text-ink mb-4 tracking-tight font-semibold">
              Historical Foundations
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/origins" className="hover:text-coral transition-colors">
                  Origins (1947 & Saragabani Gopu)
                </Link>
              </li>
              <li>
                <Link to="/ideology" className="hover:text-coral transition-colors">
                  Ideology & Principles
                </Link>
              </li>
              <li>
                <Link to="/partition" className="hover:text-coral transition-colors">
                  Partition Relief Efforts
                </Link>
              </li>
              <li>
                <Link to="/legacy" className="hover:text-coral transition-colors">
                  Post-Independence Growth & Legacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Events & Outreach */}
          <div>
            <h3 className="font-serif text-lg text-ink mb-4 tracking-tight font-semibold">
              Events & Outreach
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events/guru-poornima" className="hover:text-coral transition-colors inline-flex items-center gap-1.5">
                  <Utensils size={12} className="text-coral" />
                  <span>Guru Poornima Celebration</span>
                </Link>
              </li>
              <li>
                <Link to="/events/mahashivratri" className="hover:text-coral transition-colors inline-flex items-center gap-1.5">
                  <Flame size={12} className="text-coral" />
                  <span>Mahashivratri Jagaran</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-coral transition-colors">
                  All Events & Activity Directory
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-coral transition-colors">
                  Join Cadre / Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h3 className="font-serif text-lg text-ink mb-4 tracking-tight font-semibold">
              Official Secretariat
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-coral flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Maha Seva Dal Secretariat, Head Office, India
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-coral flex-shrink-0" />
                <a href="mailto:mahasevadalorganization@gmail.com" className="hover:text-coral transition-colors">
                  mahasevadalorganization@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-coral flex-shrink-0" />
                <a href="tel:+919994625690" className="hover:text-coral transition-colors font-mono">
                  +91 9994625690
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-editorial">
          <div>
            © {new Date().getFullYear()} Maha Seva Dal (MSD). All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1 text-[11px]">
            <span>Established 1947 by Saragabani Gopu</span>
            <span>·</span>
            <span>Non-Profit Cultural & Social Organization</span>
            <span>·</span>
            <Link
              to="/privacy"
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              className="hover:text-coral transition-colors underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            <span>·</span>
            <Link
              to="/terms"
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              className="hover:text-coral transition-colors underline-offset-2 hover:underline"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
