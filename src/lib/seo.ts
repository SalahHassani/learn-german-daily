import type { Metadata } from "next";
import { contentService } from "@/services/content/contentService";

export const SITE_NAME = "Learn German Daily";
export const SITE_TAGLINE = "A little German. Every day.";
export const DEFAULT_SITE_DESCRIPTION =
  "A little German. Every day. Structured CEFR German lessons, content blocks, interactive exercises, and local browser progress tracking.";

export type BreadcrumbEntry = {
  name: string;
  path: string;
};

export function getConfiguredSiteUrl(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "";
  if (!raw) {
    return null;
  }
  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return normalized.replace(/\/+$/, "");
}

export function getMetadataBase(): URL | undefined {
  const siteUrl = getConfiguredSiteUrl();
  if (!siteUrl) {
    return undefined;
  }
  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

export function buildCanonicalUrl(path: string): string | undefined {
  const siteUrl = getConfiguredSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!siteUrl) {
    return undefined;
  }
  return `${siteUrl}${normalizedPath}`;
}

export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  openGraphType?: "website" | "article";
}): Metadata {
  const canonical = buildCanonicalUrl(options.path);
  const ogType = options.openGraphType ?? "website";

  return {
    title: options.title,
    description: options.description,
    ...(canonical
      ? {
          alternates: {
            canonical,
          },
        }
      : {}),
    ...(options.noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {
          robots: {
            index: true,
            follow: true,
          },
        }),
    openGraph: {
      title: options.title,
      description: options.description,
      siteName: SITE_NAME,
      type: ogType,
      ...(canonical ? { url: canonical } : {}),
    },
  };
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  const siteUrl = getConfiguredSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    description: DEFAULT_SITE_DESCRIPTION,
    inLanguage: "en",
    ...(siteUrl ? { url: siteUrl } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  entries: BreadcrumbEntry[]
): Record<string, unknown> | null {
  if (entries.length === 0) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => {
      const canonical = buildCanonicalUrl(entry.path);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: entry.name,
        item: canonical ?? entry.path,
      };
    }),
  };
}

export async function getPublicSitemapPaths(): Promise<string[]> {
  const paths = new Set<string>(["/", "/levels"]);

  const levels = (await contentService.getLevels()).filter(
    (lvl) => lvl.status === "published"
  );

  for (const level of levels) {
    paths.add(`/levels/${level.slug}`);

    const courses = (await contentService.getCoursesByLevelSlug(level.slug)).filter(
      (crs) => crs.status === "published"
    );

    for (const course of courses) {
      paths.add(`/courses/${course.slug}`);

      const weeks = (await contentService.getWeeksByCourseSlug(course.slug)).filter(
        (wk) => wk.status === "published"
      );

      for (const week of weeks) {
        paths.add(`/courses/${course.slug}/weeks/${week.slug}`);

        const lessons = (
          await contentService.getLessonsByWeekSlugs(course.slug, week.slug)
        ).filter((lsn) => lsn.status === "published");

        for (const lesson of lessons) {
          paths.add(`/lessons/${lesson.slug}`);
        }
      }
    }
  }

  return Array.from(paths);
}

