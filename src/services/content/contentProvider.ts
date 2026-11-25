import type { ContentDataset } from "@/types/content";
import { LOCAL_CONTENT_DATASET } from "./localContentData";
import { validateContentDataset } from "./contentValidator";

export interface ContentProvider {
  getDataset(): ContentDataset | Promise<ContentDataset>;
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

