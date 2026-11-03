import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import mahaImages from "../maha_images.json";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Image as ImageIcon, X, Mic, Award, Scale, Sparkles, BookOpen, Trophy } from "lucide-react";

const speakers = [
  {
    name: "Mr. Srinivasan",
    role: "MSD Tamil Nadu State President",
    note: "Formally welcomed Dr. Chuba Ao to Tamil Nadu and hosted the evening's proceedings.",
    icon: Mic,
  },
  {
    name: "Mr. Kesavan",
    role: "General Secretary, International Sports & Youth Development Campaign of India",
    note: "Delivered an insightful speech on the growth of Hindu development initiatives through Maha Seva Dal.",
    icon: Award,
  },
  {
    name: "Mr. Sasikumar",
    role: "State President, MSD Tamil Nadu Advocate Wing",
    note: "Highlighted Dr. Chuba Ao's lifelong dedication to social reform in a special address.",
    icon: Scale,
  },
];

const msdPillars = [
  {
    icon: Sparkles,
    title: "Hindu Traditional Culture",
    desc: "Revitalising and preserving India's ancient cultural and spiritual traditions.",
  },
  {
    icon: BookOpen,
    title: "Educational Advancement",
    desc: "Advancing educational opportunities for youth from all walks of life.",
  },
  {
    icon: Trophy,
    title: "Sports & Youth Development",
    desc: "Encouraging sports activities across India to foster national pride and unity.",
  },
];

const Mahashivratri = () => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  return (
    <PageLayout>
      <section className="py-8 lg:py-12 bg-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <PageHeader
            category="September 2025 · Cultural Assembly"
            title="Mahashivratri Celebration & Social Outreach"
            subtitle="Grand assembly at T. Nagar Hall, Chennai — honoring service in Nagaland and empowering persons with disabilities."
          />

          {/* Featured Stage Photo Container — Cloudinary CDN Image */}
          <div className="bg-surface-card p-4 rounded-xl border border-hairline mb-12 shadow-sm">
            <div className="rounded-lg overflow-hidden border border-hairline bg-canvas">
              <img
                src="https://res.cloudinary.com/wq9znxvs/image/upload/v1785928764/msd/maha/mahashivratri-stage-dignitaries.webp"
                alt="BJP National VP Dr. Chuba Ao and MSD Tamil Nadu Leadership Team"
                className="w-full h-auto block object-cover"
              />
            </div>
            <div className="mt-3 px-2 flex justify-between items-center text-xs text-muted-editorial">
              <span className="font-semibold text-ink">BJP National VP Dr. Chuba Ao with MSD TN Leaders & Advocate Wing Dignitaries</span>
              <span className="badge-coral-fill font-mono text-[10px]">Sept 2025</span>
            </div>
          </div>

          {/* Chief Guest Card (Light Cream Surface) */}
          <div className="card-feature-cream mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="badge-coral-fill">Chief Guest</span>
                <h2 className="font-serif text-2xl text-ink mt-2">
                  Shri Dr. Chuba Ao
                </h2>
                <p className="text-xs text-muted-editorial font-mono">
                  BJP National Vice President & Veteran Tribal Welfare Leader
                </p>
              </div>
            </div>

            <p className="text-sm text-body leading-relaxed border-t border-hairline pt-4">
              Honoured for 30 years of selfless service establishing schools, colleges, and environmental initiatives for tribal youth in Nagaland.
            </p>
          </div>

          {/* Key Speakers Section */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl text-ink mb-6 text-center">
              Dignitaries & Speakers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {speakers.map((sp) => {
                const IconComp = sp.icon;
                return (
                  <div key={sp.name} className="card-feature-cream">
                    <div className="w-9 h-9 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-[#FF6200] mb-3">
                      <IconComp size={18} />
                    </div>
                    <h3 className="font-serif text-lg text-ink mb-1">{sp.name}</h3>
                    <div className="text-[11px] font-semibold text-[#FF6200] uppercase tracking-wider mb-2">{sp.role}</div>
                    <p className="text-xs text-body leading-relaxed">{sp.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Pillars */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl text-ink mb-6 text-center">
              Event Objectives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {msdPillars.map((p) => {
                const IconComp = p.icon;
                return (
                  <div key={p.title} className="tile-connector">
                    <div className="w-9 h-9 rounded-lg bg-surface-card border border-hairline flex items-center justify-center text-[#FF6200] mb-3">
                      <IconComp size={18} />
                    </div>
                    <h3 className="font-serif text-lg text-ink mb-1">{p.title}</h3>
                    <p className="text-xs text-muted-editorial">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gallery Toggle & Grid — Cloudinary CDN Images */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="btn-secondary-cream"
            >
              <ImageIcon size={16} className="text-[#FF6200]" />
              <span>{showGallery ? "Hide Photo Gallery" : "View Photo Gallery"}</span>
            </button>

            {showGallery && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 animate-fade-in">
                {mahaImages.map((imgUrl, idx) => {
                  if (failedImages[idx]) return null;
                  return (
                    <div
                      key={idx}
                      className="rounded-lg overflow-hidden border border-hairline bg-surface-card aspect-square cursor-pointer group"
                      onClick={() => setSelectedImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={`Mahashivratri moment ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={() => setFailedImages((prev) => ({ ...prev, [idx]: true }))}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lightbox Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <button
                  className="absolute -top-10 right-0 text-white hover:text-[#FF6200]"
                  onClick={() => setSelectedImage(null)}
                >
                  <X size={24} />
                </button>
                <img src={selectedImage} alt="Event Preview" className="rounded-lg max-h-[85vh] object-contain" />
              </div>
            </div>
          )}

        </div>
      </section>
    </PageLayout>
  );
};

export default Mahashivratri;
