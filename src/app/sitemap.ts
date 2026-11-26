import type { MetadataRoute } from "next";
import { buildCanonicalUrl } from "@/lib/seo";
import { contentService } from "@/services/content/contentService";

async function getIndexablePaths(): Promise<string[]> {
  const paths: string[] = ["/", "/levels"];
  const levels = await contentService.getLevels();

  for (const level of levels) {
    paths.push(`/levels/${level.slug}`);
    const courses = await contentService.getCoursesByLevelSlug(level.slug);

    for (const course of courses) {
      paths.push(`/courses/${course.slug}`);
      const weeks = await contentService.getWeeksByCourseSlug(course.slug);

      for (const week of weeks) {
        paths.push(`/courses/${course.slug}/weeks/${week.slug}`);
        const lessons = await contentService.getLessonsByWeekSlugs(course.slug, week.slug);

        for (const lesson of lessons) {
          paths.push(`/lessons/${lesson.slug}`);
        }
      }
    }
  }

  return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await getIndexablePaths();

  return paths
    .map((path) => buildCanonicalUrl(path))
    .filter((url): url is string => typeof url === "string" && url.length > 0)
    .map((url) => ({ url }));
}

