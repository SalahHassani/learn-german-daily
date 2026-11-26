import "server-only";

import {
  DatabaseContentRepository,
  type AssembledLessonBundle,
} from "./databaseContentRepository";

export class DatabaseContentProvider {
  private readonly repository: DatabaseContentRepository;

  constructor(repository = new DatabaseContentRepository()) {
    this.repository = repository;
  }

  async getLevels() {
    return this.repository.listPublicLevels();
  }

  async getCoursesByLevelSlug(levelSlug: string) {
    return this.repository.listPublicCoursesByLevelSlug(levelSlug);
  }

  async getWeeksByCourseSlug(courseSlug: string) {
    return this.repository.listPublicWeeksByCourseSlug(courseSlug);
  }

  async getPublishedLessonBySlug(slug: string): Promise<AssembledLessonBundle | null> {
    return this.repository.getPublishedLessonBySlug(slug);
  }
}

