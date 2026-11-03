import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logActivity } from "@/utils/activityLogger";

/**
 * Universal scroll-to-top helper compatible with Lenis smooth scroll and native window.
 * Ensures the header is fully displayed at the top of the viewport.
 */
export const scrollToPageTop = () => {
  try {
    const lenis = (typeof window !== "undefined" && (window as any).lenis) || null;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { immediate: true });
    }
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }
};

const ScrollToTop = () => {
  const location = useLocation();

  // Scroll to top whenever the route or location changes
  useEffect(() => {
    scrollToPageTop();
    const channel = location.pathname.includes("/admin")
      ? "ADMIN"
      : location.pathname.includes("/flow")
      ? "WHATSAPP"
      : "WEB";
    logActivity({
      channel,
      component: "PageNavigation",
      action: `Viewed Page: ${location.pathname}`,
      status: "PASS",
    });
  }, [location.pathname, location.search, location.hash, location.key]);

  // Global link click listener: whenever user clicks ANY link on the page,
  // immediately scroll to top so the header is displayed.
  useEffect(() => {
    const handleGlobalLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (
          href &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:") &&
          !href.startsWith("javascript:") &&
          !href.startsWith("blob:") &&
          (!anchor.target || anchor.target === "_self")
        ) {
          // If it's an internal link or same-page link
          if (!href.startsWith("http://") && !href.startsWith("https://")) {
            scrollToPageTop();
          }
        }
      }
    };

    document.addEventListener("click", handleGlobalLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalLinkClick, { capture: true });
    };
  }, []);

  return null;
};

export default ScrollToTop;
