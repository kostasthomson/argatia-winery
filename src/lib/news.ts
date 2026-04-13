import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, NEWS_LIMITS } from "@/lib/constants";
import type { NewsItem, NewsItemClient, CreateNewsInput, UpdateNewsInput } from "@/types/news";

// ── Converters ─────────────────────────────────────────────────────

function docToNewsItem(docSnap: QueryDocumentSnapshot<DocumentData>): NewsItem {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title_el: data.title_el,
    title_en: data.title_en,
    content_el: data.content_el,
    content_en: data.content_en,
    excerpt_el: data.excerpt_el,
    excerpt_en: data.excerpt_en,
    imageUrl: data.imageUrl,
    imageAlt_el: data.imageAlt_el,
    imageAlt_en: data.imageAlt_en,
    author: data.author,
    featured: data.featured ?? false,
    published: data.published ?? false,
    date: data.date,
    updatedAt: data.updatedAt,
  } as NewsItem;
}

/** Convert a Firestore NewsItem to a client-safe object (Timestamps → ISO strings). */
export function toClientNewsItem(item: NewsItem): NewsItemClient {
  return {
    ...item,
    date: item.date instanceof Timestamp
      ? item.date.toDate().toISOString()
      : String(item.date),
    updatedAt: item.updatedAt instanceof Timestamp
      ? item.updatedAt.toDate().toISOString()
      : String(item.updatedAt),
  };
}

// ── Reads ──────────────────────────────────────────────────────────

const newsCol = () => collection(db, COLLECTIONS.news);

/** Fetch a single news article by ID. Returns null if not found. */
export async function getNewsItemById(id: string): Promise<NewsItem | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.news, id));
  if (!docSnap.exists()) return null;
  return docToNewsItem(docSnap as QueryDocumentSnapshot<DocumentData>);
}

/** Fetch published news with cursor-based pagination. */
export async function getPublishedNews(options?: {
  limit?: number;
  startAfterDate?: string;
}): Promise<{ items: NewsItem[]; hasMore: boolean }> {
  const pageSize = Math.min(
    options?.limit ?? NEWS_LIMITS.newsPageDefault,
    NEWS_LIMITS.maxPerPage,
  );

  const q = options?.startAfterDate
    ? query(
        newsCol(),
        where("published", "==", true),
        orderBy("date", "desc"),
        startAfter(Timestamp.fromDate(new Date(options.startAfterDate))),
        firestoreLimit(pageSize + 1),
      )
    : query(
        newsCol(),
        where("published", "==", true),
        orderBy("date", "desc"),
        firestoreLimit(pageSize + 1),
      );

  const snapshot = await getDocs(q);

  const items = snapshot.docs.map(docToNewsItem);
  const hasMore = items.length > pageSize;
  if (hasMore) items.pop();

  return { items, hasMore };
}

/** Fetch published + featured news for the home page. */
export async function getFeaturedNews(): Promise<NewsItem[]> {
  const q = query(
    newsCol(),
    where("published", "==", true),
    where("featured", "==", true),
    orderBy("date", "desc"),
    firestoreLimit(NEWS_LIMITS.homePageFeatured),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToNewsItem);
}

/** Fetch ALL news (including drafts) for the admin panel. */
export async function getAllNews(): Promise<NewsItem[]> {
  const q = query(newsCol(), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToNewsItem);
}

// ── Writes ─────────────────────────────────────────────────────────

/**
 * Remove keys whose value is `undefined`.
 * Firestore rejects `undefined` — omitted keys are simply not written.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

/** Create a new news article. Returns the generated document ID. */
export async function createNewsItem(input: CreateNewsInput): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(newsCol(), {
    ...stripUndefined(input),
    date: now,
    updatedAt: now,
  });
  return docRef.id;
}

/** Update an existing news article by ID. */
export async function updateNewsItem(id: string, input: UpdateNewsInput): Promise<void> {
  const docRef = doc(db, COLLECTIONS.news, id);
  await updateDoc(docRef, {
    ...stripUndefined(input),
    updatedAt: Timestamp.now(),
  });
}

/** Delete a news article by ID. */
export async function deleteNewsItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.news, id));
}
