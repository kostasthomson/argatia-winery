import { Timestamp } from "firebase/firestore";

/** A news article stored in Firestore */
export interface NewsItem {
  id: string;
  title_el: string;
  title_en?: string;
  content_el: string;
  content_en?: string;
  /** Short preview text shown on home page and news list */
  excerpt_el?: string;
  excerpt_en?: string;
  imageUrl?: string;
  /** Alt text for the image */
  imageAlt_el?: string;
  imageAlt_en?: string;
  author: string;
  /** If true, shown in the featured section on the home page */
  featured: boolean;
  /** If false, article is a draft and not visible publicly */
  published: boolean;
  date: Timestamp;
  updatedAt: Timestamp;
}

/** Data required to create a new news article (no auto-generated fields) */
export type CreateNewsInput = Omit<NewsItem, "id" | "date" | "updatedAt">;

/** Data for updating an existing news article */
export type UpdateNewsInput = Partial<Omit<NewsItem, "id" | "date">>;

/** News item with resolved dates (for client-side use) */
export interface NewsItemClient extends Omit<NewsItem, "date" | "updatedAt"> {
  date: string;
  updatedAt: string;
}
