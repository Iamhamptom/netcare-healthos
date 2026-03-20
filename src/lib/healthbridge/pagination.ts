// Healthbridge — Pagination helpers for claim/remittance list endpoints

/** Paginated result wrapper */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Parse pagination parameters from a URL's search params.
 * Clamps page to >= 1 and pageSize to 1..100 (default 20).
 * Returns skip/take values ready for Prisma queries.
 */
export function parsePaginationParams(url: URL): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const rawPage = parseInt(url.searchParams.get("page") ?? "1", 10);
  const rawPageSize = parseInt(
    url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    10
  );

  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, isNaN(rawPageSize) ? DEFAULT_PAGE_SIZE : rawPageSize)
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Wrap a data array and total count into a standardized paginated result.
 */
export function paginateResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
