import type { MetadataRoute } from "next";
import { buildCanonicalUrl, getConfiguredSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getConfiguredSiteUrl();
  const sitemapUrl = buildCanonicalUrl("/sitemap.xml");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/progress"],
      },
    ],
    ...(sitemapUrl
      ? { sitemap: sitemapUrl }
      : { sitemap: "/sitemap.xml" }),
    ...(siteUrl ? { host: siteUrl } : {}),
  };
}

