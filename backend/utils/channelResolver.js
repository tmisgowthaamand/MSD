/**
 * Shared channel attribution helper.
 *
 * Determines which platform(s) a candidate actually used, from every available
 * signal, and returns a single resolved value: "web", "whatsapp", or "both".
 *
 * Signals:
 *  - memberChannelSource : Member.channelSource (where they completed registration)
 *  - leadChannel         : IncompleteLead.channel (where they started / dropped off)
 *  - hasWhatsAppConvo    : a WhatsAppConversation exists for this mobile (they chatted on WA)
 *
 * This is intentionally the single source of truth so leads, incomplete leads,
 * and the CRM overview all attribute the channel the same way for every future record.
 */
function resolveChannel({ memberChannelSource, leadChannel, hasWhatsAppConvo } = {}) {
  const src = String(memberChannelSource || "").toLowerCase();
  const lead = String(leadChannel || "").toLowerCase();

  const touchedWhatsApp =
    src.includes("whatsapp") || src === "both" || lead.includes("whatsapp") || !!hasWhatsAppConvo;
  const touchedWeb = src === "web" || src === "both" || lead === "web";

  if (touchedWhatsApp && touchedWeb) return "both";
  if (touchedWhatsApp) return "whatsapp";
  return "web";
}

module.exports = { resolveChannel };
