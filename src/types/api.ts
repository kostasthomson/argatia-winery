/** Standard API success response wrapper */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

/** Standard API error response */
export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

/** Pagination metadata included in list responses */
export interface ApiMeta {
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

/** Union type for any API response */
export type ApiResult<T> = ApiResponse<T> | ApiError;

/** Supported locale codes */
export type Locale = "el" | "en";

/** Query parameters for news list endpoint */
export interface NewsQueryParams {
  limit?: number;
  page?: number;
  locale?: Locale;
  featured?: boolean;
  published?: boolean;
}
