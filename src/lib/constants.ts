/** Brand color palette — matches the HTML design template */
export const COLORS = {
  gold: "#c69d53",
  goldDark: "#b8925a",
  goldLight: "rgba(198, 157, 83, 0.1)",
  dark: "#2c2c2c",
  background: "#f8f6f3",
  white: "#ffffff",
  wineRed: "#8b1538",
  wineRedDark: "#a91b47",
  textMuted: "#666666",
} as const;

/** Supported locale codes */
export const LOCALES = ["el", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Default (primary) locale */
export const DEFAULT_LOCALE: Locale = "el";

/** Firestore collection names */
export const COLLECTIONS = {
  news: "news",
} as const;

/** Firebase Storage paths */
export const STORAGE_PATHS = {
  newsImages: "news-images",
} as const;

/** News display limits */
export const NEWS_LIMITS = {
  /** Max news items shown on the home page featured section */
  homePageFeatured: 5,
  /** Default number of news items per page on the news page */
  newsPageDefault: 9,
  /** Max items per page (API enforced) */
  maxPerPage: 50,
} as const;

/** Contact form inquiry types */
export const INQUIRY_TYPES = [
  "general",
  "tasting",
  "wholesale",
  "visit",
  "other",
] as const;

/** Rate limiting thresholds */
export const RATE_LIMITS = {
  contactFormPerHour: 5,
  authAttemptsPerWindow: 5,
} as const;

/** Google Maps embed URL for the winery location */
export const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12069.888092920997!2d22.016146143849113!3d40.6932032546789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13579815354c3055%3A0x9006daf3b5f25865!2zzp_Ouc69zr_PgM6_zrnOtc6vzr8gzpHPgc6zzrHPhM6vzrEgzqHOv860zr_Ph8-Oz4HOuSDOnc6szr_Phc-DzrE!5e1!3m2!1sel!2sgr!4v1761475251086!5m2!1sel!2sgr";

/** Social media URLs (update when available) */
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/argatia",
  instagram: "https://www.instagram.com/argatia",
  youtube: "",
} as const;

/** Winery contact information */
export const CONTACT_INFO = {
  address: "Ροδοχώρι, Νάουσα, Ημαθία, Ελλάδα",
  addressEn: "Rodochori, Naoussa, Imathia, Greece",
  phone: "+30 23320 XXXXX",
  email: "info@argatia.gr",
  elevationM: 480,
} as const;
