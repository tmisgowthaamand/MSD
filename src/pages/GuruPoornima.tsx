import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import poornimaImages from "../poornima_images.json";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Heart, Image as ImageIcon, X, Utensils, GraduationCap, Globe, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Utensils,
    title: "Social Welfare & Food Outreach",
    description:
      "Direct outreach through large-scale food distribution for those in need, exemplifying MSD's commitment to grassroots service delivery.",
  },
  {
    icon: Sparkles,
    title: "Cultural Identity & Values",
    description:
      "A focus on strengthening Indian culture and social values to build national unity and preserve our civilisational heritage.",
  },
  {
    icon: GraduationCap,
    title: "Empowerment through Education",
    description:
      "Strategies to provide better academic opportunities for children in underserved sectors, ensuring no child is left behind.",
  },
  {
    icon: Globe,
    title: "Organisational Growth",
    description:
      "Recognition of the Maha Seva Dal's expanding influence in social service across India, reaching new communities every year.",
  },
];

const GuruPoornima = () => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  return (
    <PageLayout>
      <section className="py-8 lg:py-12 bg-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <PageHeader
            category="July 2025 · Cultural Celebration"
            title="Guru Poornima Food Distribution Drive"
            subtitle="Honouring teachers and spiritual traditions through community service and Mahaprasadam distribution."
          />

          {/* Banner Container — Cloudinary CDN Image */}
          <div className="bg-surface-card p-4 rounded-xl border border-hairline mb-12">
            <div className="rounded-lg overflow-hidden border border-hairline bg-canvas">
              <img
                src="https://res.cloudinary.com/wq9znxvs/image/upload/v1785928743/msd/poornima/WhatsApp_Image_2026-04-24_at_7_13_06_PM__1_.webp"
                alt="Guru Poornima Food Distribution Drive"
                className="w-full h-auto block object-cover max-h-[500px] object-center"
              />
            </div>
            <div className="mt-3 px-2 flex justify-between items-center text-xs text-muted-editorial">
              <span>Shri Sanjay Nirmal & MSD Volunteers Serving Mahaprasadam</span>
              <span className="badge-pill-cream font-mono">July 2025</span>
            </div>
          </div>

          {/* Guest of Honour Card (Light Surface) */}
          <div className="card-feature-cream mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="badge-coral-fill">Chief Guest</span>
                <h2 className="font-serif text-2xl text-ink mt-2">
                  Shri Sanjay Nirmal
                </h2>
                <p className="text-xs text-muted-editorial font-mono">
                  BJP National General Secretary, SC Morcha
                </p>
              </div>
            </div>

            <p className="text-sm text-body leading-relaxed border-t border-hairline pt-4">
              Shri Sanjay Nirmal graced the event, highlighting Maha Seva Dal's pivotal role in uplifting underserved communities and integrating them into India's national development journey.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl text-ink mb-6 text-center">
              Program Highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {highlights.map((h) => {
                const IconComp = h.icon;
                return (
                  <div key={h.title} className="card-feature-cream">
                    <div className="w-10 h-10 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-coral mb-4">
                      <IconComp size={20} />
                    </div>
                    <h3 className="font-serif text-lg text-ink mb-2">{h.title}</h3>
                    <p className="text-xs text-body leading-relaxed">{h.description}</p>
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
              <ImageIcon size={16} className="text-coral" />
              <span>{showGallery ? "Hide Photo Gallery" : "View Photo Gallery"}</span>
            </button>

            {showGallery && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 animate-fade-in">
                {poornimaImages.map((imgUrl, idx) => {
                  if (failedImages[idx]) return null;
                  return (
                    <div
                      key={idx}
                      className="rounded-lg overflow-hidden border border-hairline bg-surface-card aspect-square cursor-pointer group"
                      onClick={() => setSelectedImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={`Guru Poornima moment ${idx + 1}`}
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
                  className="absolute -top-10 right-0 text-white hover:text-coral"
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

export default GuruPoornima;
