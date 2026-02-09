'use client';

import Link from 'next/link';

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  /** Current query params (e.g. from URL) to preserve when changing page */
  searchParams: Record<string, string>;
  totalCount?: number;
  pageSize?: number;
};

export default function PaginationBar({
  currentPage,
  totalPages,
  basePath,
  searchParams,
  totalCount = 0,
  pageSize = 24,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    const q = params.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-12 border-t-2" style={{ borderColor: '#E8DCC4' }}>
      {totalCount > 0 && (
        <span className="text-sm font-medium" style={{ color: '#5A6C7D' }}>
          Showing {start}–{end} of {totalCount}
        </span>
      )}
      <div className="flex justify-center items-center gap-4">
        <Link
          href={buildUrl(currentPage - 1)}
          aria-label="Previous page"
          className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            currentPage === 1 ? 'pointer-events-none opacity-30' : ''
          }`}
          style={{
            backgroundColor: currentPage === 1 ? '#E8DCC4' : '#F4A261',
            color: '#FFFFFF',
          }}
        >
          ← Previous
        </Link>

        <span
          className="px-4 py-2 rounded-lg font-bold text-sm"
          style={{ backgroundColor: '#FFFFFF', color: '#2D3E50', border: '2px solid #E8DCC4' }}
        >
          Page {currentPage} of {totalPages}
        </span>

        <Link
          href={buildUrl(currentPage + 1)}
          aria-label="Next page"
          className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            currentPage === totalPages ? 'pointer-events-none opacity-30' : ''
          }`}
          style={{
            backgroundColor: currentPage === totalPages ? '#E8DCC4' : '#F4A261',
            color: '#FFFFFF',
          }}
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
