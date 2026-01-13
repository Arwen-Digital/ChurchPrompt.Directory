import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { DirectoryBootData } from '../../../convex/directory';
import { Sidebar, type Category } from './Sidebar';
import PromptGrid from '@/components/prompts/PromptGrid';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: string;
  usageCount: number;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}

export const DirectoryContent: React.FC<{ initialPrompts?: any[]; initialBootData?: DirectoryBootData | null }> = ({ initialPrompts, initialBootData }) => {
  const BOOT_CACHE_KEY = 'directoryBootData';
  const BOOT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes freshness
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<string>(''); // '' = default heuristic

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Boot data: categories + recent prompts (single aggregated query)
  const bootData: DirectoryBootData | undefined = useQuery(api.directory.getDirectoryBootData);
  const [cachedBootData, setCachedBootData] = React.useState<DirectoryBootData | null>(null);

  // Load cached boot data on mount if fresh
  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(BOOT_CACHE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && typeof parsed.ts === 'number') {
        const age = Date.now() - parsed.ts;
        if (age < BOOT_CACHE_TTL_MS) {
          setCachedBootData(parsed.data as DirectoryBootData);
        }
      }
    } catch (_) {
      // ignore malformed cache
    }
  }, []);

  // Persist fresh boot data when query resolves
  React.useEffect(() => {
    if (bootData) {
      try {
        window.localStorage.setItem(BOOT_CACHE_KEY, JSON.stringify({ data: bootData, ts: Date.now() }));
        setCachedBootData(bootData);
      } catch (_) {
        // storage may be unavailable
      }
    }
  }, [bootData]);

  const promptsResult = useQuery(api.prompts.getApprovedPrompts, {
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    search: searchQuery || undefined,
    sort: sort === 'popular' ? 'usage' : sort || undefined,
    limit: itemsPerPage,
    page: currentPage,
  });

  // Extract data from result structure
  const prompts = promptsResult?.prompts;
  const totalPages = promptsResult?.totalPages || 1;

  // Loading and error states
  const effectiveBoot = bootData || cachedBootData || initialBootData || null;
  const isLoading = (prompts === undefined && !initialPrompts) || !effectiveBoot;
  // Fallback to initialPrompts only if we are on page 1 and no filters
  const promptList = (prompts === undefined && initialPrompts && currentPage === 1 && !searchQuery && selectedCategories.length === 0)
    ? initialPrompts
    : (prompts || []);

  const newestList = effectiveBoot?.recentPrompts || [];
  const categories: Category[] = effectiveBoot?.categories?.map(cat => ({
    id: cat.categoryId,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    promptCount: cat.promptCount
  })) || [];

  // Debug logging
  console.log('[DirectoryContent] State:', {
    bootData: bootData ? 'loaded' : 'undefined',
    cachedBootData: cachedBootData ? 'present' : 'null',
    initialBootData: initialBootData ? 'present' : 'null',
    effectiveBoot: effectiveBoot ? 'present' : 'null',
    categoriesCount: categories.length,
    promptsResult: promptsResult ? 'loaded' : 'undefined',
    prompts: prompts ? `${prompts.length} items` : 'undefined',
    promptListCount: promptList.length,
    isLoading
  });

  // Initialize from URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('q');
    const sortParam = params.get('sort');
    const pageParam = params.get('page');

    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    }
    if (searchParam) setSearchQuery(searchParam);
    if (sortParam) setSort(sortParam);
    if (pageParam) {
      const p = parseInt(pageParam);
      if (!isNaN(p) && p > 0) setCurrentPage(p);
    }
  }, []);

  // Update URL when state changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (searchQuery) params.set('q', searchQuery);
    if (sort) params.set('sort', sort);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''
      }`;

    window.history.replaceState({}, '', newUrl);
  }, [selectedCategories, searchQuery, sort, currentPage]);

  // Client-side filtering for multiple categories (Convex query only supports one category)
  // Note: Pagination happens on the server now. Client-side filtering of multiple categories 
  // currently only works if we fetch ALL results, which we don't do anymore with pagination.
  // For now, we will rely on server-side single category filter. If multi-category support is needed,
  // we would need to request that feature from backend or accept that "secondary" categories might not be filtered perfectly
  // or we need to pass multiple categories to backend. Since the plan didn't specify multi-category backend changes, 
  // and the current UI mainly allows single selection or we pass the first one, we stick to passing the first one.
  const filteredPrompts = promptList;

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      // Toggle logic (single select or multi select depending on UX)
      // Original logic seemed to allow multi select array, but backend only takes one.
      // We'll reset page to 1 on filter change
      setCurrentPage(1);
      return prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSort('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar
        categories={categories}
        searchQuery={searchQuery}
        selectedCategories={selectedCategories}
        onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        onCategoryToggle={handleCategoryToggle}
        onClearFilters={handleClearFilters}
        resultCount={promptsResult?.totalCount || filteredPrompts.length}
      />

      <div className="flex-1 min-w-0">
        <div className="mb-6 space-y-4">
          {/* Newest Submitted Prompts section - only show when no filters/search are active and on page 1 */}
          {selectedCategories.length === 0 && !searchQuery && !sort && currentPage === 1 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Newest Submitted Prompts</h2>
              <p className="text-sm text-muted-foreground mb-4">Recently added submissions from the community</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {newestList.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No recent submissions.</div>
                ) : (
                  newestList.map((p: any, idx: number) => (
                    <a
                      key={p.id}
                      href={`/directory/${p.id}`}
                      className="block p-3 border rounded-md hover:shadow-sm bg-card"
                      style={{ animation: `slideUpFadeIn 0.6s ease-out ${idx * 0.1}s both` }}
                    >
                      <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</div>
                      <div className="text-xs text-muted-foreground mt-2">By {p.authorName || 'Anonymous'}</div>
                    </a>
                  ))
                )}
              </div>

              <div className="border-b mt-4" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Prompts</h1>
            <p className="text-muted-foreground">
              {isLoading
                ? 'Loading prompts...'
                : `Explore our collection of ${promptsResult?.totalCount || promptList.length} church ministry prompts`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium" htmlFor="sortSelect">
              Sort
            </label>
            <select
              id="sortSelect"
              className="border rounded px-2 py-1 text-sm bg-background"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Default</option>
              <option value="popular">Popularity</option>
              <option value="recent">Recent</option>
              <option value="featured">Featured</option>
            </select>
            {sort && (
              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                {sort === 'popular'
                  ? 'Sorting by popularity'
                  : sort === 'recent'
                    ? 'Sorting by most recent'
                    : sort === 'featured'
                      ? 'Sorting by featured'
                      : null}
              </span>
            )}
          </div>
        </div>

        <PromptGrid prompts={filteredPrompts} isLoading={isLoading} />

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show window of pages around current page
                let p = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) p = i + 1;
                  else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                  else p = currentPage - 2 + i;
                }

                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`h-8 w-8 rounded text-sm flex items-center justify-center ${currentPage === p
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'border hover:bg-muted'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
