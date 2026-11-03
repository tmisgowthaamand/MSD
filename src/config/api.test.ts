import { describe, it, expect } from "vitest";
import { API_BASE_URL, getApiUrl, resolveApiBaseUrl } from "./api";

describe("api configuration", () => {
  describe("resolveApiBaseUrl", () => {
    it("should return localhost:5000 in development when no env var is set", () => {
      const url = resolveApiBaseUrl("", true);
      expect(url).toBe("http://localhost:5000");
    });

    it("should return the configured environment URL in production", () => {
      const url = resolveApiBaseUrl("https://api.mahasevadal.org/", false);
      expect(url).toBe("https://api.mahasevadal.org");
    });

    it("should return empty string (same-origin relative URL) in production when VITE_API_URL is missing", () => {
      const url = resolveApiBaseUrl("", false);
      expect(url).toBe("");
    });

    it("should return empty string in production if envUrl points to localhost", () => {
      const url = resolveApiBaseUrl("http://localhost:5001", false);
      expect(url).toBe("");
    });
  });

  describe("getApiUrl", () => {
    it("should prepend leading slash if not provided", () => {
      const url = getApiUrl("api/members");
      expect(url).toContain("/api/members");
    });

    it("should handle endpoints that already start with slash", () => {
      const url = getApiUrl("/api/upload");
      expect(url).toContain("/api/upload");
    });

    it("should handle nested subpaths correctly", () => {
      const url = getApiUrl("api/members/status/123");
      expect(url).toContain("/api/members/status/123");
    });
  });
});
