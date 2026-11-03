import PageLayout from "@/components/layout/PageLayout";

import { Link } from "react-router-dom";

import { Heart, Calendar, ArrowRight, ShieldCheck, Users, Flame, Landmark, X } from "lucide-react";

import { useState, useEffect, useRef } from "react";

import QRCode from "qrcode";

import { PRESIDENTS, PresidentData } from "@/pages/Leadership";



const UPI_LINK = "upi://pay?pa=MAB.037349044880004@AXISBANK&pn=Maha+Seva+Dal+Foundation&cu=INR";



const Home = () => {

  const qrRef = useRef<HTMLCanvasElement>(null);

  const [aboutPresident, setAboutPresident] = useState<PresidentData | null>(null);



  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {

      if (e.key === "Escape") {

        setAboutPresident(null);

      }

    };

    if (aboutPresident) {

      window.addEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "hidden";

    }

    return () => {

      window.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "auto";

    };

  }, [aboutPresident]);



  useEffect(() => {

    if (qrRef.current) {

      QRCode.toCanvas(qrRef.current, UPI_LINK, {

        width: 180,

        margin: 2,

        color: { dark: "#1a0a00", light: "#ffffff" },

        errorCorrectionLevel: "H",

      });

    }

  }, []);



  return (

    <PageLayout>



      {/* ══════════════════════════════════════════

          HERO BAND — Tinted Cream Canvas (#faf9f5)

      ══════════════════════════════════════════ */}

      <section className="py-16 lg:py-24 bg-canvas border-b border-hairline relative">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            

            {/* Left Column: Editorial Headline & Actions (5 columns) */}

            <div className="lg:col-span-5 space-y-6 order-last lg:order-first">

              

              {/* Eyebrow badge */}

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-hairline text-xs font-medium text-ink">

                <span className="w-2 h-2 rounded-full bg-[#FF6200] inline-block" />

                <span>Est. 1947 · Historical & Social Organization</span>

              </div>



              {/* Display Headline */}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-ink tracking-tight font-normal leading-[1.1]">

                Unity of People, Development of Society & Power of Youth

              </h1>

 

              {/* Sub-headline / Lead text */}

              <p className="text-base text-body leading-relaxed max-w-xl font-sans">

                Founded in 1947 by Saragabani Gopu during India's independence, Maha Seva Dal (MSD) has stood as a dedicated pillar for social harmony, cultural preservation, and nation-building across India.

              </p>



              {/* Primary Action Row */}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">

                <Link to="/events" className="btn-primary-coral justify-center">

                  <span>Explore Events & Activities</span>

                  <ArrowRight size={16} />

                </Link>

                <Link to="/origins" className="btn-secondary-cream justify-center">

                  <span>Read 1947 Origins</span> 

                </Link>

              </div>



              {/* Quick Stat Bar */}

              <div className="pt-6 border-t border-hairline grid grid-cols-3 gap-2 sm:gap-4 items-start">

                <div>

                  <div className="font-serif text-lg sm:text-xl text-ink">1947</div>

                  <div className="text-[11px] sm:text-xs text-muted-editorial">Year Established</div>

                </div>

                <div>

                  <div className="font-serif text-lg sm:text-xl text-ink leading-tight">

                    Saragabani Gopu

                  </div>

                  <div className="text-[11px] sm:text-xs text-muted-editorial">Founder</div>

                </div>

                <div>

                  <div className="font-serif text-lg sm:text-xl text-ink">Nationwide</div>

                  <div className="text-[11px] sm:text-xs text-muted-editorial">Service Reach</div>

                </div>

              </div>



            </div>



            {/* Right Column: Hero Banner Image — shown FIRST on mobile */}

            <div className="lg:col-span-7 order-first lg:order-last">

              <div className="rounded-2xl overflow-hidden border border-hairline shadow-md bg-canvas group hover:shadow-lg transition-all duration-300 flex items-center justify-center">

                <picture className="w-full">

                  {/* Desktop / Tablet: constrained height, object-contain */}

                  <source

                    media="(min-width: 768px)"

                    srcSet="/banner-desktop.png?v=5"

                  />

                  {/* Mobile: full-width natural height */}

                  <img

                    src="/banner-mobile.png?v=5"

                    alt="Maha Seva Dal Banner"

                    className="w-full md:max-h-[380px] md:object-contain h-auto block group-hover:scale-[1.01] transition-transform duration-500"

                    onError={(e) => {

                      e.currentTarget.src = "https://res.cloudinary.com/wq9znxvs/image/upload/v1785994768/msd/brand/banner-mobile.png";

                    }}

                  />

                </picture>

              </div>

            </div>



          </div>

        </div>

      </section>



      {/* ══════════════════════════════════════════

          FOUNDING LEADERSHIP & ABOUT SECTION

      ══════════════════════════════════════════ */}

      <section className="py-20 lg:py-24 bg-surface-soft border-b border-hairline">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          

          {/* Section Header */}

          <div className="max-w-3xl mb-12">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6200]/10 border border-[#FF6200]/25 text-xs font-semibold text-[#FF6200] mb-3">

              <Landmark size={14} />

              <span>FOUNDING LEADERSHIP & 1947 HERITAGE</span>

            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-ink tracking-tight">

              A Heritage of Selfless Service and Cultural Preservation

            </h2>

            <p className="mt-4 text-base text-body leading-relaxed">

              Maha Seva Dal (MSD) emerged in 1947 during the historic moment of India's independence. Founded by <strong className="text-ink font-semibold">Saragabani Gopu</strong>, the organization directed its energy toward organizing society, cultivating disciplined youth leadership, and providing selfless humanitarian aid.

            </p>

          </div>



          {/* Featured Founder Spotlight Card */}

          <div className="bg-canvas border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 mb-16">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              

              {/* Founder Image Column */}

              <div className="lg:col-span-5 flex flex-col items-center">

                <div

                  onClick={() => {

                    const founder = PRESIDENTS.find((p) => p.id === "gopu-1947") || PRESIDENTS[0];

                    setAboutPresident(founder);

                  }}

                  className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-[#FF6200]/30 shadow-lg bg-surface-card cursor-pointer group"

                  title="Click to view Founder details & biography"

                >

                  <img

                    src="/founder-saragabani-gopu-1947.jpg"

                    alt="Founder Saragabani Gopu - Maha Seva Dal 1947"

                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"

                  />

                </div>

              </div>



              {/* Founder Editorial Content Column */}

              <div className="lg:col-span-7 space-y-6">

                

                <div>

                  <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6200]">

                    Founding Father & Visionary

                  </span>

                  <h3

                    onClick={() => {

                      const founder = PRESIDENTS.find((p) => p.id === "gopu-1947") || PRESIDENTS[0];

                      setAboutPresident(founder);

                    }}

                    className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink mt-1 hover:text-[#FF6200] cursor-pointer transition-colors"

                    title="Click to view Founder details"

                  >

                    Saragabani Gopu

                  </h3>

                  <p className="text-xs text-muted-editorial mt-1">

                    First National President · Architect of the 1947 Maha Seva Dal Movement

                  </p>

                </div>



                {/* Founder Official Quote */}

                <blockquote className="border-l-4 border-[#FF6200] pl-5 py-3 bg-surface-soft/80 rounded-r-xl italic font-serif text-base sm:text-lg text-ink leading-relaxed">

                  "Long-term national stability depends upon a disciplined, compassionate, and culturally rooted social framework."

                  <div className="mt-2 text-xs font-sans not-italic text-muted-editorial font-medium">

                    — Saragabani Gopu, Founding Address (1947)

                  </div>

                </blockquote>



                <div className="space-y-3 text-body text-sm leading-relaxed">

                  <p>

                    Rather than engaging in political maneuvers during the dawn of freedom, Founder Saragabani Gopu chose the path of constructive social discipline. He envisioned an organized cadre of youth dedicated to selfless community service, physical fitness, humanitarian relief, and cultural cohesion.

                  </p>

                  <p>

                    His vision continues to guide Maha Seva Dal's humanitarian wings across India—from daily Annadanam food drives to free health camps, legal aid clinics, and educational support for underprivileged children.

                  </p>

                </div>



                {/* Key Pillars */}

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-hairline">

                  <div className="p-3 bg-surface-soft rounded-lg text-center">

                    <div className="text-xs uppercase tracking-wider text-[#FF6200] font-semibold">Service</div>

                    <div className="text-[11px] text-muted-editorial mt-0.5">Selfless Seva</div>

                  </div>

                  <div className="p-3 bg-surface-soft rounded-lg text-center">

                    <div className="text-xs uppercase tracking-wider text-[#FF6200] font-semibold">Discipline</div>

                    <div className="text-[11px] text-muted-editorial mt-0.5">Youth Cadre</div>

                  </div>

                  <div className="p-3 bg-surface-soft rounded-lg text-center">

                    <div className="text-xs uppercase tracking-wider text-[#FF6200] font-semibold">Unity</div>

                    <div className="text-[11px] text-muted-editorial mt-0.5">Social Harmony</div>

                  </div>

                </div>



              </div>



            </div>

          </div>



          {/* Historic Leadership Lineage Gallery */}

          <div>

            <div className="mb-8">

              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6200]">Historical Succession</span>

              <h3 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Presidents & Leadership Lineage</h3>

              <p className="text-xs text-muted-editorial mt-1 max-w-lg">

                Honoring the distinguished national presidents who spearheaded Maha Seva Dal's nationwide mission over the decades.

              </p>

            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">

              {PRESIDENTS.map((pres) => (

                <div

                  key={pres.id}

                  onClick={() => setAboutPresident(pres)}

                  className="bg-canvas border border-[#E8E2D9] rounded-2xl overflow-hidden hover:border-[#FF6200]/50 hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer max-w-sm sm:max-w-none mx-auto w-full"

                  title="Click to view About & Biography"

                >

                  {/* Photo at the top - 100% Edge-to-Edge 2:3 Ratio */}

                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-card border-b border-hairline shrink-0">

                    <img

                      src={pres.image}

                      alt={`${pres.name} - ${pres.role}`}

                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"

                      loading="lazy"

                    />

                    

                    {/* Year Badge */}

                    <div className="absolute top-2.5 left-2.5 z-20 bg-gradient-to-r from-[#FF6200] to-[#FF9933] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">

                      {pres.badge.split(" ")[0]}

                    </div>



                    {/* Role Tag */}

                    <div className="absolute top-2.5 right-2.5 z-20 bg-white/90 backdrop-blur-sm text-ink text-[10px] font-semibold px-2 py-0.5 rounded-full">

                      {pres.role.includes("Founder") ? "Founder" : "President"}

                    </div>



                    {/* Hover Hint */}

                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 z-20 pointer-events-none">

                      <span className="bg-black/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow flex items-center gap-1">

                        <span>Click for About</span>

                        <ArrowRight size={11} />

                      </span>

                    </div>

                  </div>



                  {/* Downside of the Photo: Role, Name, Tenure, Short Description */}

                  <div className="p-4 flex-1 flex flex-col justify-between">

                    <div>

                      <div className="h-5 flex items-center text-[10px] uppercase tracking-wider text-[#FF6200] font-semibold truncate">

                        {pres.role}

                      </div>

                      <div className="h-12 flex items-center mt-0.5">

                        <h4 className="font-serif text-base text-ink font-semibold leading-tight line-clamp-2 group-hover:text-[#FF6200] transition-colors">

                          {pres.name}

                        </h4>

                      </div>

                      <div className="h-5 flex items-center text-[11px] text-muted-editorial font-medium truncate mt-0.5">

                        {pres.tenure}

                      </div>

                      <p className="h-10 text-xs text-body leading-relaxed line-clamp-2 mt-2">

                        {pres.historicalContext}

                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>



        </div>

      </section>



      {/* ══════════════════════════════════════════

          3-UP FEATURE CARDS GRID — Light Cream Cards (#efe9de)

      ══════════════════════════════════════════ */}

      <section className="section-editorial bg-canvas border-b border-hairline">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          

          <div className="text-center max-w-2xl mx-auto mb-16">

            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6200]">Core Pillars</span>

            <h2 className="text-3xl md:text-4xl font-serif text-ink mt-2">

              Our Foundational Commitments

            </h2>

            <p className="text-muted-editorial text-sm mt-3">

              Grounded in the values established in 1947, MSD continues to guide communities through social, cultural, and educational initiatives.

            </p>

          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            

            {/* Card 1 */}

            <div className="card-feature-cream flex flex-col justify-between">

              <div>

                <div className="w-10 h-10 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-[#FF6200] mb-6">

                  <Users size={20} />

                </div>

                <h3 className="font-serif text-xl text-ink mb-3">

                  Social Harmony & Unity

                </h3>

                <p className="text-sm text-body leading-relaxed">

                  Building strong, compassionate communities across India by fostering mutual respect, social cooperation, and solidarity.

                </p>

              </div>

              <div className="mt-6 pt-4 border-t border-hairline">

                <Link to="/ideology" className="text-xs font-semibold text-ink hover:text-[#FF6200] flex items-center justify-between">

                  <span>Learn more</span>

                  <ArrowRight size={14} />

                </Link>

              </div>

            </div>



            {/* Card 2 */}

            <div className="card-feature-cream flex flex-col justify-between">

              <div>

                <div className="w-10 h-10 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-[#FF6200] mb-6">

                  <Flame size={20} />

                </div>

                <h3 className="font-serif text-xl text-ink mb-3">

                  Cultural Heritage & Traditions

                </h3>

                <p className="text-sm text-body leading-relaxed">

                  Preserving and celebrating timeless festivals, ceremonies, and cultural gatherings like Mahashivratri and Guru Poornima.

                </p>

              </div>

              <div className="mt-6 pt-4 border-t border-hairline">

                <Link to="/events" className="text-xs font-semibold text-ink hover:text-[#FF6200] flex items-center justify-between">

                  <span>View event calendar</span>

                  <ArrowRight size={14} />

                </Link>

              </div>

            </div>



            {/* Card 3 */}

            <div className="card-feature-cream flex flex-col justify-between">

              <div>

                <div className="w-10 h-10 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-[#FF6200] mb-6">

                  <ShieldCheck size={20} />

                </div>

                <h3 className="font-serif text-xl text-ink mb-3">

                  Youth Empowerment

                </h3>

                <p className="text-sm text-body leading-relaxed">

                  Instilling discipline, service values, and leadership capabilities in youth to drive constructive societal growth.

                </p>

              </div>

              <div className="mt-6 pt-4 border-t border-hairline">

                <Link to="/legacy" className="text-xs font-semibold text-ink hover:text-[#FF6200] flex items-center justify-between">

                  <span>Read growth legacy</span>

                  <ArrowRight size={14} />

                </Link>

              </div>

            </div>



          </div>

        </div>

      </section>



      {/* ══════════════════════════════════════════

          EVENTS SHOWCASE CARDS — Light Theme (#efe9de)

      ══════════════════════════════════════════ */}

      <section className="section-editorial bg-surface-soft border-b border-hairline">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">

            <div>

              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6200]">Annual Celebrations</span>

              <h2 className="text-3xl md:text-4xl font-serif text-ink mt-2">

                Major Events & Community Assemblies

              </h2>

            </div>

            <div className="mt-4 md:mt-0">

              <Link to="/events" className="btn-secondary-cream text-xs">

                <span>All Events Directory</span>

                <ArrowRight size={14} />

              </Link>

            </div>

          </div>



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            

            {/* Event Card 1 */}

            <div className="card-feature-cream flex flex-col justify-between">

              <div>

                <div className="flex items-center justify-end mb-6">

                  <span className="text-xs text-muted-editorial font-mono">July 2025</span>

                </div>

                <h3 className="font-serif text-2xl text-ink mb-3">

                  Guru Poornima Celebration & Mahaprasadam

                </h3>

                <p className="text-sm text-body leading-relaxed mb-6">

                  Annual honor to spiritual gurus and teachers, featuring community prayers, cultural performances, and large-scale Mahaprasadam distribution.

                </p>



                <div className="p-4 rounded-lg bg-canvas border border-hairline space-y-2 mb-6">

                  <div className="flex justify-between text-xs">

                    <span className="text-muted-editorial">Attendees:</span>

                    <span className="text-ink font-semibold">5,000+ Volunteers</span>

                  </div>

                  <div className="flex justify-between text-xs">

                    <span className="text-muted-editorial">Location:</span>

                    <span className="text-ink font-semibold">MSD Grounds, Telangana</span>

                  </div>

                </div>

              </div>



              <div>

                <Link to="/events/guru-poornima" className="btn-primary-coral text-xs">

                  <span>View Event Details</span>

                  <ArrowRight size={14} />

                </Link>

              </div>

            </div>



            {/* Event Card 2 */}

            <div className="card-feature-cream flex flex-col justify-between">

              <div>

                <div className="flex items-center justify-end mb-6">

                  <span className="text-xs text-muted-editorial font-mono">September 2025</span>

                </div>

                <h3 className="font-serif text-2xl text-ink mb-3">

                  Mahashivratri Jagaran & Cultural Assembly

                </h3>

                <p className="text-sm text-body leading-relaxed mb-6">

                  Overnight spiritual vigil, Rudrabhishekam rituals, devotional bhajans, and community service activities.

                </p>



                <div className="p-4 rounded-lg bg-canvas border border-hairline space-y-2 mb-6">

                  <div className="flex justify-between text-xs">

                    <span className="text-muted-editorial">Rituals & Seva:</span>

                    <span className="text-ink font-semibold">Rudrabhishekam & Annadanam</span>

                  </div>

                  <div className="flex justify-between text-xs">

                    <span className="text-muted-editorial">Entry:</span>

                    <span className="text-ink font-semibold">Open to All Devotees</span>

                  </div>

                </div>

              </div>



              <div>

                <Link to="/events/mahashivratri" className="btn-primary-coral text-xs">

                  <span>View Event Details</span>

                  <ArrowRight size={14} />

                </Link>

              </div>

            </div>



          </div>

        </div>

      </section>



      {/* ══════════════════════════════════════════

          FULL-BLEED CORAL CALLOUT BAND (#cc785c)

      ══════════════════════════════════════════ */}

      <section className="py-16 bg-canvas border-b border-hairline">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="card-callout-coral text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">

            <div className="space-y-2 max-w-2xl">

              <h2 className="text-3xl md:text-4xl font-serif text-white font-normal">

                Join Hands with Maha Seva Dal

              </h2>

              <p className="text-white/90 text-base leading-relaxed">

                Whether through volunteer service, organizing local community events, or financial contributions — your participation strengthens our service to the nation.

              </p>

            </div>

            <div className="flex-shrink-0 flex flex-wrap items-center justify-center md:justify-start gap-4">

              <Link to="/support" className="btn-secondary-cream text-ink font-semibold hover:bg-canvas">

                <Heart size={16} className="text-[#FF6200]" />

                <span>Support & Donate</span>

              </Link>

            </div>

          </div>

        </div>

      </section>



      {/* ══════════════════════════════════════════

          DONATION & BANK ACCOUNT SECTION

      ══════════════════════════════════════════ */}

      <section className="section-editorial bg-canvas">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          

          <div className="text-center max-w-2xl mx-auto mb-12">

            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6200]">Transparency & Support</span>

            <h2 className="text-3xl md:text-4xl font-serif text-ink mt-2">

              Support Maha Seva Dal Foundation

            </h2>

            <p className="text-muted-editorial text-sm mt-3">

              Direct contributions power our community food drives, educational aid, and socio-cultural events.

            </p>

          </div>



          <div className="bg-surface-card rounded-xl border border-hairline overflow-hidden p-8 md:p-12">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

              

              {/* QR Code Column — Cloudinary CDN Image */}

              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-canvas rounded-lg border border-hairline">

                <div className="rounded-lg overflow-hidden bg-white p-3 border border-hairline mb-3 flex items-center justify-center">

                  <canvas

                    ref={qrRef}

                    className="rounded-md"

                    style={{ width: 180, height: 180 }}

                  />

                </div>

                <div className="text-center">

                  <span className="badge-pill-cream font-semibold text-xs text-ink">Scan & Pay via UPI</span>

                  <div className="text-[11px] text-muted-editorial mt-1">Maha Seva Dal Foundation</div>

                </div>

              </div>



              {/* Bank Details Column */}

              <div className="md:col-span-7 space-y-4">

                <h3 className="font-serif text-2xl text-ink">

                  Bank Account Details

                </h3>

                

                <div className="space-y-3 font-sans text-sm">

                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 border-b border-hairline">

                    <span className="text-muted-editorial font-medium shrink-0">Account Name</span>

                    <span className="text-ink font-semibold text-right">MAHA SEVA DAL FOUNDATION</span>

                  </div>

                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 border-b border-hairline">

                    <span className="text-muted-editorial font-medium shrink-0">Account Number</span>

                    <span className="font-mono text-[#FF6200] font-bold tracking-wider text-right break-all">925010021495473</span>

                  </div>

                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 border-b border-hairline">

                    <span className="text-muted-editorial font-medium shrink-0">IFSC Code</span>

                    <span className="font-mono text-ink font-semibold text-right">UTIB0004488</span>

                  </div>

                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 border-b border-hairline">

                    <span className="text-muted-editorial font-medium shrink-0">Bank Name</span>

                    <span className="text-ink font-semibold text-right">Axis Bank</span>

                  </div>

                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">

                    <span className="text-muted-editorial font-medium shrink-0">Account Type</span>

                    <span className="text-ink font-semibold text-right">Savings</span>

                  </div>

                </div>



                <div className="pt-4">

                  <Link to="/support" className="btn-primary-coral text-xs w-full justify-center">

                    <span>View Full Support Page & Tax Exemption Info</span>

                    <ArrowRight size={14} />

                  </Link>

                </div>

              </div>



            </div>

          </div>



        </div>

      </section>



      {/* ══════════════════════════════════════════

          PRESIDENT ABOUT MODAL (TRIGGERED ON PHOTO/CARD CLICK)

      ══════════════════════════════════════════ */}

      {aboutPresident && (

        <div

          role="dialog"

          aria-modal="true"

          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/75 backdrop-blur-sm no-scrollbar animate-in fade-in duration-200"

          onClick={() => setAboutPresident(null)}

        >

          <div

            className="bg-canvas border border-[#E8E2D9] rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative p-4 sm:p-8"

            onClick={(e) => e.stopPropagation()}

          >

            {/* Close Button */}

            <button

              type="button"

              onClick={() => setAboutPresident(null)}

              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-[#FF6200] hover:text-white text-ink flex items-center justify-center transition-all border border-hairline shadow-md active:scale-95 touch-manipulation"

              aria-label="Close"

            >

              <X size={18} />

            </button>



            <div>

              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">

                

                {/* President Portrait Photo */}

                <div className="w-full sm:w-48 shrink-0 flex flex-col items-center pt-2 sm:pt-0">

                  <div className="aspect-[2/3] w-full max-w-[170px] sm:max-w-[200px] rounded-xl overflow-hidden border-2 border-[#FF6200]/30 shadow-md bg-surface-card">

                    <img

                      src={aboutPresident.image}

                      alt={aboutPresident.name}

                      className="w-full h-full object-cover object-top"

                    />

                  </div>

                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6200]/10 text-xs font-semibold text-[#FF6200]">

                    <span>{aboutPresident.badge}</span>

                  </div>

                </div>



                {/* President Bio & About Details */}

                <div className="flex-1 space-y-4">

                  <div>

                    <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6200]">

                      {aboutPresident.role}

                    </span>

                    <h3 className="font-serif text-2xl sm:text-3xl text-ink font-semibold mt-1">

                      {aboutPresident.name}

                    </h3>

                    <p className="text-xs text-muted-editorial font-medium mt-0.5">

                      {aboutPresident.tenure}

                    </p>

                  </div>



                  {/* Official Quote */}

                  {aboutPresident.quote && (

                    <blockquote className="border-l-3 border-[#FF6200] pl-3 py-2 bg-surface-soft/80 rounded-r-lg italic font-serif text-xs sm:text-sm text-ink leading-relaxed">

                      "{aboutPresident.quote}"

                      <div className="mt-1.5 text-[11px] font-sans not-italic text-muted-editorial font-medium">

                        — {aboutPresident.quoteAttribution}

                      </div>

                    </blockquote>

                  )}



                  {/* Historical Context / About Narrative */}

                  <div>

                    <h4 className="text-xs uppercase tracking-wider font-semibold text-ink mb-1.5">

                      About & Historical Leadership

                    </h4>

                    <p className="text-xs sm:text-sm text-body leading-relaxed">

                      {aboutPresident.historicalContext}

                    </p>

                  </div>



                  {/* Key Contributions / Achievements */}

                  {aboutPresident.achievements && aboutPresident.achievements.length > 0 && (

                    <div>

                      <h4 className="text-xs uppercase tracking-wider font-semibold text-ink mb-2">

                        Key Historical Contributions

                      </h4>

                      <ul className="space-y-1.5 text-xs text-body">

                        {aboutPresident.achievements.map((item, idx) => (

                          <li key={idx} className="flex items-start gap-2">

                            <span className="text-[#FF6200] font-bold mt-0.5">•</span>

                            <span>{item}</span>

                          </li>

                        ))}

                      </ul>

                    </div>

                  )}



                  {/* Leadership Page Deep Link */}

                  <div className="pt-3 border-t border-hairline flex items-center justify-between">

                    <Link

                      to={`/leadership#${aboutPresident.id}`}

                      onClick={() => setAboutPresident(null)}

                      className="text-xs font-semibold text-[#FF6200] hover:underline flex items-center gap-1.5"

                    >

                      <span>View Full Archival Record in Leadership Lineage</span>

                      <ArrowRight size={13} />

                    </Link>

                  </div>



                </div>



              </div>

            </div>

          </div>

        </div>

      )}



    </PageLayout>

  );

};



export default Home;

