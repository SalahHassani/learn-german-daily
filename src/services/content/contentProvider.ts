import type { ContentDataset } from "@/types/content";
import type { AssembledLessonBundle } from "./databaseContentRepository";
import type {
  cefrLevels,
  courses,
  weeks,
} from "@/db/schema";
import { LOCAL_CONTENT_DATASET } from "./localContentData";
import { validateContentDataset } from "./contentValidator";

export type CefrLevelRecord = typeof cefrLevels.$inferSelect;
export type CourseRecord = typeof courses.$inferSelect;
export type WeekRecord = typeof weeks.$inferSelect;

export interface ContentProvider {
  getDataset(): ContentDataset | Promise<ContentDataset>;
  getLevels?(): Promise<CefrLevelRecord[]>;
  getCoursesByLevelSlug?(levelSlug: string): Promise<CourseRecord[]>;
  getWeeksByCourseSlug?(courseSlug: string): Promise<WeekRecord[]>;
  getPublishedLessonBySlug?(slug: string): Promise<AssembledLessonBundle | null>;
}

export class LocalContentProvider implements ContentProvider {
  private readonly dataset: ContentDataset;

  constructor(dataset: ContentDataset = LOCAL_CONTENT_DATASET, shouldValidate = true) {
    if (shouldValidate) {
      validateContentDataset(dataset);
    }
    this.dataset = dataset;
  }

  getDataset(): ContentDataset {
    return this.dataset;
  }
}

export const defaultContentProvider = new LocalContentProvider();

