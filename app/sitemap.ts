import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://trconcept.co";
  const paths = [
    "",
    "/learn/level-1",
    "/learn/level-2",
    "/community",
    "/solve",
    "/build",
    "/work",
    "/about",
    "/start-here",
    "/privacy",
    "/terms",
    "/refund-cancellation",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
