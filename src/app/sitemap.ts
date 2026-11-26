import type { MetadataRoute } from "next";
import { buildCanonicalUrl, getPublicSitemapPaths } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = getPublicSitemapPaths();

  return paths.map((path) => ({
    url: buildCanonicalUrl(path) ?? path,
  }));
}

