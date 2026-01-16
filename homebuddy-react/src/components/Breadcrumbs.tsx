// components/Breadcrumbs.tsx
'use client';

import Link from 'next/link';

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-400 mb-6">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center">
            {it.href ? (
              <Link href={it.href} className="hover:text-white underline-offset-4 hover:underline transition-colors">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-white font-medium">{it.label}</span>
            )}
            {i < items.length - 1 && <span className="mx-2 text-gray-500">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
