import { contentService } from "@/services/content/contentService";
import {
  ProgressOverviewClient,
  type PublishedCourseItem,
  type PublishedLessonItem,
} from "@/components/progress/progress-overview-client";

export default async function ProgressOverviewPage() {
  const levels = await contentService.getLevels();
  const publishedLevels = levels.filter((lvl) => lvl.status === "published");

  const publishedCourses: PublishedCourseItem[] = [];
  const publishedLessons: PublishedLessonItem[] = [];

  for (const lvl of publishedLevels) {
    const courses = await contentService.getCoursesByLevelSlug(lvl.slug);
    const levelPublishedCourses = courses.filter((crs) => crs.status === "published");

    for (const crs of levelPublishedCourses) {
      publishedCourses.push({
        levelId: lvl.id,
        levelName: lvl.name,
        levelSlug: lvl.slug,
        courseId: crs.id,
        courseSlug: crs.slug,
        courseTitle: crs.title,
      });

      const weeks = await contentService.getWeeksByCourseSlug(crs.slug);
      const publishedWeeks = weeks.filter((wk) => wk.status === "published");

      for (const wk of publishedWeeks) {
        const lessons = await contentService.getLessonsByWeekSlugs(crs.slug, wk.slug);
        const weekPublishedLessons = lessons.filter((lsn) => lsn.status === "published");

        for (const lsn of weekPublishedLessons) {
          publishedLessons.push({
            levelId: lvl.id,
            levelName: lvl.name,
            levelSlug: lvl.slug,
            courseId: crs.id,
            courseSlug: crs.slug,
            courseTitle: crs.title,
            weekId: wk.id,
            weekSlug: wk.slug,
            weekTitle: wk.title,
            lessonId: lsn.id,
            lessonSlug: lsn.slug,
            lessonTitle: lsn.title,
          });
        }
      }
    }
  }

  return (
    <ProgressOverviewClient
      publishedCourses={publishedCourses}
      publishedLessons={publishedLessons}
    />
  );
}