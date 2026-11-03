import { getApiUrl } from "@/config/api";

export interface ActivityEvent {
  channel: "WEB" | "WHATSAPP" | "ADMIN" | "LEADS";
  component: string;
  action: string;
  status: "PASS" | "FAIL";
  details?: Record<string, any>;
}

/**
 * Sends a real-time event log to the backend server.
 * Uses navigator.sendBeacon when available for non-blocking telemetry,
 * falling back to non-blocking fetch with keepalive.
 */
export const logActivity = (event: ActivityEvent) => {
  try {
    const payload = JSON.stringify({
      channel: event.channel,
      component: event.component,
      action: event.action,
      status: event.status,
      details: event.details || {},
      timestamp: new Date().toISOString(),
    });

    const apiUrl = getApiUrl("/api/logs/activity");

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(apiUrl, blob);
      if (sent) return;
    }

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-channel": event.channel,
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Non-blocking, ignore network stalls
    });
  } catch (err) {
    // Non-blocking, ignore telemetry failure
  }
};

