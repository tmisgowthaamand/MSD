import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Heart,
  Mail,
  Phone,
  Utensils,
  Flame,
  FileText,
  Search,
  ShieldCheck,
  MapPin,
  User,
  Users,
  ChevronRight,
  UserPlus,
  Landmark,
  Compass,
  HeartHandshake,
  Award,
} from "lucide-react";
import appointmentsData from "@/data/appointments.json";
import { scrollToPageTop } from "@/components/ScrollToTop";

const navItems = [
  { path: "/", label: "Home" },
];

const aboutItems = [
  { path: "/origins", label: "Origins (1947)", desc: "Founding proclamation & 1947 roots", icon: Landmark },
  { path: "/ideology", label: "Ideology & Principles", desc: "Core philosophy, values & discipline", icon: Compass },
  { path: "/partition", label: "Role During Partition", desc: "1947 relief operations & refugee seva", icon: HeartHandshake },
  { path: "/legacy", label: "Growth & Legacy", desc: "Post-independence evolution & national service", icon: Award },
  { path: "/leadership", label: "Leadership & Lineage", desc: "Founding leaders & presidential lineage", icon: Users },
];

const eventItems = [
  { path: "/events/guru-poornima", label: "Guru Poornima", icon: Utensils, date: "July 2025" },
  { path: "/events/mahashivratri", label: "Mahashivratri", icon: Flame, date: "September 2025" },
];

const Header = () => {
  const location = useLocation();
  const [openAbout, setOpenAbout] = useState(false);
  const [openEvents, setOpenEvents] = useState(false);
  const [openAppts, setOpenAppts] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apptSearch, setApptSearch] = useState("");
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);
  const [mobileApptsOpen, setMobileApptsOpen] = useState(false);

  const aboutRef = useRef<HTMLLIElement>(null);
  const eventsRef = useRef<HTMLLIElement>(null);
  const apptsRef = useRef<HTMLLIElement>(null);
  const apptScrollRef = useRef<HTMLDivElement>(null);

  const isAboutActive = aboutItems.some((a) => a.path === location.pathname);
  const isEventActive = eventItems.some((e) => e.path === location.pathname);
  const isApptActive = location.pathname.startsWith("/appointment/");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setOpenAbout(false);
      }
      if (eventsRef.current && !eventsRef.current.contains(e.target as Node)) {
        setOpenEvents(false);
      }
      if (apptsRef.current && !apptsRef.current.contains(e.target as Node)) {
        setOpenAppts(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setOpenAbout(false);
    setOpenEvents(false);
    setOpenAppts(false);
    setIsMobileMenuOpen(false);
    setApptSearch("");
    setMobileAboutOpen(false);
    setMobileEventsOpen(false);
    setMobileApptsOpen(false);
  }, [location.pathname]);

  const handleNavClick = () => {
    scrollToPageTop();
    setOpenAbout(false);
    setOpenEvents(false);
    setOpenAppts(false);
    setIsMobileMenuOpen(false);
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Completely trap wheel + touchmove inside the dropdown to prevent background page scrolling
  useEffect(() => {
    const el = apptScrollRef.current;
    if (!el || !openAppts) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isScrollable = scrollHeight > clientHeight;

      e.stopPropagation();

      if (!isScrollable) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      const isAtTop = scrollTop <= 0 && delta < 0;
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight && delta > 0;

      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const deltaY = touchStartY - e.touches[0].clientY;
      const isAtTop = scrollTop <= 0 && deltaY < 0;
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight && deltaY > 0;
      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [openAppts, apptSearch]);

  const filteredAppts = Array.isArray(appointmentsData)
    ? appointmentsData.filter((a) => {
      if (!apptSearch.trim()) return true;
      const q = apptSearch.toLowerCase();
      return (
        a.region.toLowerCase().includes(q) ||
        (a.name && a.name.toLowerCase().includes(q))
      );
    })
    : [];

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-hairline font-serif">
      {/* Tricolor National Accent Stripe */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#FF6200] via-[#FF9832] to-[#1E890A]" />

      {/* Top Banner Bar */}
      <div className="bg-[#FAF7F2] border-b border-hairline px-4 sm:px-6 py-2 flex justify-between items-center text-xs text-muted-soft font-sans">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/logo.png"
            alt="Maha Seva Dal Emblem"
            className="w-4 h-4 object-contain rounded-full shrink-0"
          />
          <span className="font-bold italic text-ink whitespace-nowrap shrink-0">Maha Seva Dal</span>
          <span className="h-3.5 w-[1.5px] bg-[#a8c6e8] hidden sm:inline-block mx-0.5 shrink-0 self-center rounded-full" />
          <span className="text-muted-soft font-normal text-xs truncate hidden sm:inline">
            Est. 1947 &mdash; Unity, Service &amp; Empowerment
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:mahasevadalorganization@gmail.com"
            className="hidden sm:flex items-center gap-1.5 hover:text-[#FF6200] transition-colors"
          >
            <Mail size={12} className="text-[#FF6200]" />
            <span>mahasevadalorganization@gmail.com</span>
          </a>
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-[#FF6200]" />
            <a href="tel:+919994625690" className="hover:text-[#FF6200] transition-colors">
              +91 9994625690
            </a>
            <span>,</span>
            <a href="tel:+919514576540" className="hover:text-[#FF6200] transition-colors">
              9514576540
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4 font-sans">
        {/* Logo & Identity */}
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo.png"
            alt="Maha Seva Dal Official Emblem"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-bold tracking-tight text-ink font-sans leading-tight group-hover:text-[#FF6200] transition-colors">
              Maha Seva Dal
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[#FF6200] tracking-normal leading-tight">
              மஹா சேவா தளம் · 1947
            </span>
          </div>
        </Link>

        {/* Desktop Menu Navigation */}
        <nav className="hidden lg:flex items-center gap-x-5 xl:gap-x-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`relative py-1.5 transition-colors ${
                  isActive ? "text-[#FF6200] font-semibold" : "text-body-main hover:text-[#FF6200]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF6200] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* About Us Dropdown */}
          <li ref={aboutRef} className="list-none relative">
            <button
              aria-label="Organization History"
              onClick={() => setOpenAbout((v) => !v)}
              className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1.5 ${
                isAboutActive || openAbout ? "text-[#FF6200] font-semibold" : "text-body-main hover:text-[#FF6200]"
              }`}
            >
              <span>About Us</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${openAbout ? "rotate-180" : ""}`} />
            </button>

            {openAbout && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-canvas border border-[#e5d5be] rounded-2xl shadow-xl p-2.5 z-50 animate-fade-in">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF6200] px-3 pt-1 pb-2 border-b border-hairline mb-1.5 flex items-center justify-between">
                  <span>History & Core Philosophy</span>
                  <span className="text-[10px] text-muted-editorial font-normal">5 Chapters</span>
                </div>
                <div className="space-y-1">
                  {aboutItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleNavClick}
                        className={`flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition-all group ${
                          isActive
                            ? "bg-[#fff6ed] text-[#FF6200] border-l-2 border-[#FF6200] pl-2 shadow-2xs"
                            : "hover:bg-[#faf6f0] text-ink"
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg transition-colors shrink-0 ${
                            isActive
                              ? "bg-[#FF6200] text-white"
                              : "bg-[#fff0e0] text-[#FF6200] group-hover:bg-[#FF6200] group-hover:text-white"
                          }`}
                        >
                          <IconComponent size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-xs font-semibold transition-colors ${
                              isActive ? "text-[#FF6200] font-bold" : "group-hover:text-[#FF6200]"
                            }`}
                          >
                            {item.label}
                          </div>
                          {item.desc && (
                            <div className="text-[11px] text-muted-editorial leading-tight mt-0.5">
                              {item.desc}
                            </div>
                          )}
                        </div>
                        <ChevronRight
                          size={13}
                          className={`self-center shrink-0 transition-all ${
                            isActive
                              ? "text-[#FF6200] opacity-100"
                              : "text-stone-300 opacity-0 group-hover:opacity-100 group-hover:text-[#FF6200] group-hover:translate-x-0.5"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </li>

          {/* Events Dropdown */}
          <li ref={eventsRef} className="list-none relative">
            <button
              onClick={() => setOpenEvents((v) => !v)}
              className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1.5 ${
                isEventActive || location.pathname === "/events" || openEvents
                  ? "text-[#FF6200] font-semibold"
                  : "text-body-main hover:text-[#FF6200]"
              }`}
            >
              <span>Events</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${openEvents ? "rotate-180" : ""}`} />
            </button>

            {openEvents && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-canvas border border-hairline rounded-xl shadow-lg p-2.5 z-50 animate-fade-in">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF6200] px-3 pt-1 pb-1.5 border-b border-hairline mb-1">
                  Upcoming & Key Observances
                </div>
                {eventItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors group ${
                      location.pathname === item.path
                        ? "bg-[#fff7ed] text-[#FF6200]"
                        : "hover:bg-surface-soft text-ink"
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded bg-[#fff0e0] text-[#FF6200] group-hover:bg-[#FF6200] group-hover:text-white transition-colors shrink-0">
                      <item.icon size={13} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold group-hover:text-[#FF6200] transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[10.5px] text-muted-editorial leading-tight mt-0.5">
                        {item.date}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="mt-1 pt-1.5 border-t border-hairline">
                  <Link
                    to="/events"
                    onClick={handleNavClick}
                    className="block text-center text-xs font-semibold text-[#FF6200] py-1 hover:underline"
                  >
                    View All Observances &rarr;
                  </Link>
                </div>
              </div>
            )}
          </li>

          {/* State Leadership Dropdown */}
          <li ref={apptsRef} className="list-none relative">
            <button
              onClick={() => setOpenAppts((v) => !v)}
              className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1.5 ${
                isApptActive || openAppts ? "text-[#FF6200] font-semibold" : "text-body-main hover:text-[#FF6200]"
              }`}
            >
              <span>State Leadership</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${openAppts ? "rotate-180" : ""}`} />
            </button>

            {openAppts && (
              <div
                className="absolute top-full left-0 mt-2 w-80 bg-canvas border border-hairline rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden"
                style={{ overscrollBehavior: "contain" }}
              >
                <div className="p-3 border-b border-hairline bg-surface-soft">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF6200] mb-2">
                    Official State Leadership
                  </div>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-editorial" />
                    <input
                      type="text"
                      placeholder="Search state or region..."
                      value={apptSearch}
                      onChange={(e) => setApptSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-canvas border border-hairline rounded-lg focus:outline-none focus:border-[#FF6200] text-ink placeholder:text-muted-editorial/60"
                      autoFocus
                    />
                  </div>
                </div>

                <div
                  ref={apptScrollRef}
                  className="max-h-64 overflow-y-auto overscroll-contain p-1.5 divide-y divide-hairline/50"
                  style={{ overscrollBehavior: "contain" }}
                >
                  {filteredAppts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-editorial">
                      No regions match your search.
                    </div>
                  ) : (
                    filteredAppts.map((appt) => (
                      <Link
                        key={appt.id}
                        to={`/appointment/${appt.id}`}
                        onClick={handleNavClick}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors group ${
                          location.pathname === `/appointment/${appt.id}`
                            ? "bg-[#fff7ed] text-[#FF6200]"
                            : "hover:bg-surface-soft text-ink"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <MapPin size={12} className="text-[#FF6200] flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs group-hover:text-[#FF6200] transition-colors truncate">
                              {appt.region}
                            </div>
                            <div className="text-[10px] text-muted-editorial truncate">
                              {appt.type === "individual" ? appt.name : "State Leadership Team"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span
                            className={`text-[9.5px] font-sans font-medium px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                              appt.type === "team"
                                ? "bg-orange-50/80 text-[#D65000] border-orange-200/60"
                                : "bg-amber-50/80 text-amber-800 border-amber-200/60"
                            }`}
                          >
                            {appt.type === "team" ? <Users size={10} /> : <User size={10} />}
                            <span>{appt.type === "team" ? "Team" : "Individual"}</span>
                          </span>
                          <ChevronRight size={11} className="text-muted-soft group-hover:text-[#FF6200] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </li>
        </nav>

        {/* Right CTA Actions - Polished 3-Tier Hierarchy */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
          {/* 1. Member Utility: Verify & Status */}
          <Link
            to="/verify"
            onClick={handleNavClick}
            className={`whitespace-nowrap h-9 flex items-center gap-1.5 text-xs xl:text-sm font-semibold px-3.5 rounded-full border transition-all shrink-0 ${
              location.pathname === "/status" || location.pathname === "/verify"
                ? "bg-[#FF6200] text-white border-[#FF6200] shadow-sm font-bold"
                : "border-[#e5d5be] bg-[#faf7f2]/60 text-ink hover:border-[#FF6200] hover:text-[#FF6200] hover:bg-[#fff6ed]"
            }`}
            title="Verify PVC ID card authenticity or track registration status"
          >
            <ShieldCheck size={14} className={location.pathname === "/status" || location.pathname === "/verify" ? "text-white" : "text-[#FF6200]"} />
            <span>Verify & Status</span>
          </Link>

          {/* 2. Secondary Action: Support & Donate */}
          <Link
            to="/support"
            onClick={handleNavClick}
            className={`whitespace-nowrap h-9 flex items-center gap-1.5 text-xs xl:text-sm font-semibold px-3.5 xl:px-4 rounded-full border transition-all shrink-0 ${
              location.pathname === "/support"
                ? "bg-[#FF6200] text-white border-[#FF6200] shadow-sm font-bold"
                : "border-[#FF6200] text-[#FF6200] bg-white hover:bg-orange-50/80 shadow-2xs"
            }`}
          >
            <Heart
              size={13}
              className={location.pathname === "/support" ? "text-white fill-white shrink-0" : "text-[#FF6200] stroke-[#FF6200] shrink-0"}
            />
            <span>Support & Donate</span>
          </Link>

          {/* 3. Primary #1 CTA: Join Cadre */}
          <Link
            to="/register"
            onClick={handleNavClick}
            className={`whitespace-nowrap h-9 flex items-center gap-1.5 text-xs xl:text-sm font-bold px-4 xl:px-4.5 rounded-full transition-all shrink-0 ${
              location.pathname === "/register"
                ? "bg-[#d65000] text-white shadow-md ring-2 ring-[#FF6200]/40 ring-offset-1"
                : "bg-[#FF6200] hover:bg-[#e05600] text-white shadow-sm hover:shadow"
            }`}
          >
            <UserPlus size={14} className="text-white shrink-0" />
            <span>Join Cadre</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="p-2 rounded-md text-ink hover:bg-surface-card border border-hairline"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[calc(var(--banner-height,28px)+4rem)] sm:top-[calc(var(--banner-height,28px)+5rem)] bottom-0 bg-canvas/98 backdrop-blur-xl border-b border-hairline overflow-y-auto px-6 py-6 font-sans z-50 animate-fade-in shadow-2xl">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={handleNavClick}
              className={`text-sm py-3 border-b border-hairline font-medium transition-colors ${
                location.pathname === "/" ? "text-[#FF6200]" : "text-ink hover:text-[#FF6200]"
              }`}
            >
              Home
            </Link>

            {/* About Us Accordion */}
            <div className="border-b border-hairline">
              <button
                aria-label="Organization History"
                onClick={() => setMobileAboutOpen((v) => !v)}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-ink hover:text-[#FF6200] transition-colors"
              >
                <span>About Us</span>
                <ChevronDown
                  size={16}
                  className={`text-[#FF6200] transition-transform duration-200 ${
                    mobileAboutOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAboutOpen && (
                <div className="pb-3 pl-2 flex flex-col gap-1.5 animate-fade-in">
                  {aboutItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleNavClick}
                        className={`flex items-start gap-2.5 text-sm py-2 px-2.5 rounded-xl transition-colors group ${
                          isActive
                            ? "text-[#FF6200] font-semibold bg-[#fff7ed] border-l-2 border-[#FF6200]"
                            : "text-ink hover:bg-surface-soft hover:text-[#FF6200]"
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg shrink-0 transition-colors ${
                            isActive
                              ? "bg-[#FF6200] text-white"
                              : "bg-[#fff0e0] text-[#FF6200] group-hover:bg-[#FF6200] group-hover:text-white"
                          }`}
                        >
                          <IconComponent size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs">{item.label}</div>
                          <div className="text-[10.5px] text-muted-editorial leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Events Accordion */}
            <div className="border-b border-hairline">
              <button
                onClick={() => setMobileEventsOpen((v) => !v)}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-ink hover:text-[#FF6200] transition-colors"
              >
                <span>Events</span>
                <ChevronDown
                  size={16}
                  className={`text-[#FF6200] transition-transform duration-200 ${
                    mobileEventsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileEventsOpen && (
                <div className="pb-3 pl-2 flex flex-col gap-1 animate-fade-in">
                  <Link
                    to="/events"
                    onClick={handleNavClick}
                    className="block text-xs font-semibold text-[#FF6200] py-1.5 px-2 rounded-lg hover:bg-surface-soft transition-colors"
                  >
                    All Events Overview &rarr;
                  </Link>
                  {eventItems.map((ev) => {
                    const IconComp = ev.icon;
                    return (
                      <Link
                        key={ev.path}
                        to={ev.path}
                        onClick={handleNavClick}
                        className="flex items-center justify-between text-sm text-ink py-2 px-2 rounded-lg hover:bg-surface-soft transition-colors group"
                      >
                        <span className="flex items-center gap-2">
                          <IconComp size={14} className="text-[#FF6200]" />
                          <span className="group-hover:text-[#FF6200] transition-colors">{ev.label}</span>
                        </span>
                        <span className="text-[11px] text-muted-editorial font-mono">{ev.date}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* State Leadership Accordion */}
            <div className="border-b border-hairline">
              <button
                onClick={() => setMobileApptsOpen((v) => !v)}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-ink hover:text-[#FF6200] transition-colors"
              >
                <span>State Leadership</span>
                <ChevronDown
                  size={16}
                  className={`text-[#FF6200] transition-transform duration-200 ${
                    mobileApptsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileApptsOpen && (
                <div className="pb-3 pl-2 flex flex-col gap-0.5 animate-fade-in">
                  {Array.isArray(appointmentsData) && appointmentsData.map((appt) => (
                    <Link
                      key={appt.id}
                      to={`/appointment/${appt.id}`}
                      onClick={handleNavClick}
                      className="flex items-center gap-2 text-sm text-ink py-2 px-2 rounded-lg hover:bg-surface-soft hover:text-[#FF6200] transition-colors group"
                    >
                      <FileText size={13} className="text-[#FF6200] flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-xs group-hover:text-[#FF6200] transition-colors">{appt.region}</div>
                        <div className="text-[11px] text-muted-editorial truncate">
                          {appt.type === "individual" ? appt.name : "State Leadership Team"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons in Mobile Drawer - Consistent Hierarchy */}
            <div className="pt-4 space-y-2.5">
              <Link
                to="/register"
                onClick={handleNavClick}
                className="w-full text-center flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-full bg-[#FF6200] hover:bg-[#e05600] text-white shadow-sm transition-all"
              >
                <UserPlus size={14} className="text-white" />
                <span>Join Cadre</span>
              </Link>
              <Link
                to="/support"
                onClick={handleNavClick}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-full border border-[#FF6200] text-[#FF6200] hover:bg-orange-50 transition-colors"
              >
                <Heart size={14} className="text-[#FF6200]" />
                <span>Support & Donate</span>
              </Link>
              <Link
                to="/verify"
                onClick={handleNavClick}
                className="w-full text-center flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-4 rounded-full border border-[#e5d5be] bg-[#faf7f2]/60 text-ink hover:text-[#FF6200] hover:border-[#FF6200] transition-colors"
              >
                <ShieldCheck size={13} className="text-[#FF6200]" />
                <span>Verify & Status</span>
              </Link>
            </div>

          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
