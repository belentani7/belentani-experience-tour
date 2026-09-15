import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { Asset, CatalogStats, CategoryCount, ALL_CATEGORY } from './types';
import { Sidebar } from './components/Sidebar';
import { AssetCard } from './components/AssetCard';

const AssetModal = lazy(() =>
  import('./components/AssetModal').then((m) => ({ default: m.AssetModal })),
);
import {
  Search,
  Command,
  ArrowRight,
  Database,
  X,
  ArrowUpDown,
  LayoutGrid,
  Rows3,
  RefreshCw,
  AlertTriangle,
  WandSparkles,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

type SortKey = 'featured' | 'newest' | 'title' | 'category' | 'author';

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'title', label: 'A → Z' },
  { id: 'category', label: 'Category' },
  { id: 'author', label: 'Author' },
];

const EMPTY_STATS: CatalogStats = {
  total: 0,
  components: 0,
  libraries: 0,
  featured: 0,
  generated: 0,
  authors: 0,
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Try the live API first; fall back to the static snapshot baked at build time.
 * This lets the exact same build run with the Express API (local, Vercel) or
 * as a pure static site (Cloudflare Pages).
 */
let apiReachable: boolean | null = null;

async function fetchWithFallback<T>(
  primary: string,
  fallback: string,
): Promise<{ data: T; live: boolean }> {
  // Probe the API at most once per session; afterwards go straight to the snapshot.
  if (apiReachable !== false) {
    try {
      const res = await fetch(primary);
      if (res.ok) {
        apiReachable = true;
        return { data: (await res.json()) as T, live: true };
      }
      apiReachable = false;
    } catch {
      apiReachable = false;
    }
  }
  const res = await fetch(fallback);
  if (!res.ok) throw new Error(`Failed to load catalog (${res.status})`);
  return { data: (await res.json()) as T, live: false };
}

const currentSeed = () => {
  const now = new Date();
  return Number(
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`,
  );
};

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<CatalogStats>(EMPTY_STATS);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sort, setSort] = useState<SortKey>('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [generating, setGenerating] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const loadMeta = useCallback(() => {
    fetchWithFallback<CatalogStats>('/api/stats', '/stats.json')
      .then(({ data }) => setStats(data))
      .catch(() => undefined);
    fetchWithFallback<CategoryCount[]>('/api/categories', '/categories.json')
      .then(({ data }) => setCategories(data))
      .catch(() => undefined);
  }, []);

  const loadAssets = useCallback((): Promise<void> => {
    setLoading(true);
    setError(null);
    return fetchWithFallback<Asset[]>('/api/assets', '/catalog.json')
      .then(({ data, live }) => {
        setAssets(data);
        setApiAvailable(live);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error('Failed to load assets', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.gsap-hero-anim', {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2,
      });
    },
    { scope: heroRef },
  );

  useEffect(() => {
    loadAssets().then(() => loadMeta());
    const saved = localStorage.getItem('library_bookmarks');
    if (saved) {
      try {
        setBookmarkedIds(new Set(JSON.parse(saved)));
      } catch {
        localStorage.removeItem('library_bookmarks');
      }
    }
  }, [loadAssets, loadMeta]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearchQuery('');
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('library_bookmarks', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const generateNow = useCallback(() => {
    if (!apiAvailable) return;
    setGenerating(true);
    fetch('/api/generate', { method: 'POST' })
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) {
          console.warn('generate failed:', body?.error);
          return;
        }
        loadAssets();
        loadMeta();
      })
      .catch(() => undefined)
      .finally(() => setGenerating(false));
  }, [apiAvailable, loadAssets, loadMeta]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory(ALL_CATEGORY);
    setShowBookmarks(false);
  };

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = assets.filter((asset) => {
      const haystack = [
        asset.title,
        asset.description,
        asset.category,
        asset.source,
        asset.author ?? '',
        ...(asset.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesCategory = activeCategory === ALL_CATEGORY || asset.category === activeCategory;
      const matchesBookmark = !showBookmarks || bookmarkedIds.has(asset.id);
      return matchesSearch && matchesCategory && matchesBookmark;
    });

    const sorted = [...list];
    switch (sort) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
        break;
      case 'author':
        sorted.sort((a, b) => (a.author ?? '~').localeCompare(b.author ?? '~') || a.title.localeCompare(b.title));
        break;
      case 'newest':
        sorted.sort((a, b) => (b.seed ?? 0) - (a.seed ?? 0));
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        break;
    }
    return sorted;
  }, [assets, searchQuery, activeCategory, showBookmarks, bookmarkedIds, sort]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeCategory !== ALL_CATEGORY || showBookmarks;

  const heading = showBookmarks ? 'Your Extractions' : activeCategory;
  const subheading = showBookmarks
    ? 'Deeply saved UI configurations.'
    : activeCategory === 'Daily'
      ? 'One brand-new component appended by the Belentani daily engine. Nothing is ever deleted.'
      : activeCategory === ALL_CATEGORY
        ? 'The definitive 2026 open database collection.'
        : `${activeCategory} extracted from the 2026 open registry.`;

  const today = currentSeed();

  return (
    <div className="min-h-screen bg-[#110000] text-[#ffeded] flex flex-col font-sans selection:bg-red-500/40">
      <a
        href="#grid-start"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-red-950 focus:font-bold"
      >
        Skip to catalog
      </a>

      {/* Top Navbar */}
      <header className="h-[65px] border-b border-red-500/20 glass-thick-red flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)] border border-red-300/50">
            <Command size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-white hidden sm:block drop-shadow-md">
            BELENTANI <span className="text-red-400">TOUR</span>
          </span>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50 group-focus-within:text-red-400 transition-colors"
              size={18}
            />
            <input
              ref={searchRef}
              type="text"
              aria-label="Search components, authors and tags"
              placeholder="Search components, authors, tags…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-panel border-red-500/30 rounded-xl pl-12 pr-20 py-2.5 text-sm font-bold text-red-100 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-red-800/70"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="p-1 rounded-md text-red-300 hover:text-white hover:bg-red-500/20 transition-colors"
                >
                  <X size={14} />
                </button>
              ) : null}
              <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-1 text-[10px] font-black font-mono text-red-300 bg-red-950 border border-red-500/30 rounded shadow-inner">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="w-8 sm:w-auto flex items-center gap-6">
          <a
            href="https://21st.dev/community/components"
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-bold text-red-300/70 hover:text-white transition-colors hidden md:block"
          >
            21st.dev
          </a>
          <div className="w-10 h-10 rounded-full bg-red-900 border-2 border-red-500/30 cursor-pointer hover:border-red-400 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"></div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          showBookmarks={showBookmarks}
          onToggleShowBookmarks={setShowBookmarks}
          bookmarkCount={bookmarkedIds.size}
          categories={categories}
          stats={stats}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          {activeCategory === ALL_CATEGORY && !showBookmarks && !searchQuery && (
            <div
              ref={heroRef}
              className="relative border-b border-red-500/20 overflow-hidden min-h-[450px] flex items-center bg-[#1a0005]"
            >
              <div className="absolute inset-0 pattern-grid-red opacity-30 pointer-events-none" aria-hidden="true" />
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[150px] animate-blob pointer-events-none mix-blend-screen" aria-hidden="true" />
              <div
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/40 rounded-full blur-[120px] animate-blob pointer-events-none mix-blend-screen"
                style={{ animationDelay: '3s' }}
                aria-hidden="true"
              />

              <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 md:px-10">
                <div className="max-w-4xl">
                  <div className="gsap-hero-anim inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel text-xs font-black font-mono text-red-200 uppercase tracking-[0.2em] mb-8 border-red-400/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,0,1)]" />
                    Belentani Experience Tour
                  </div>

                  <h1 className="gsap-hero-anim text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.95] drop-shadow-2xl">
                    THICK GLOSSY <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-800 filter drop-shadow-[0_10px_20px_rgba(255,0,0,0.3)]">
                      GLASSMORPHISM
                    </span>
                  </h1>

                  <p className="gsap-hero-anim text-xl text-red-200/90 leading-relaxed mb-10 max-w-2xl font-bold">
                    A self-growing library: {stats.total} assets, {stats.generated} of them generated
                    autonomously — one new component every day, without any API.
                  </p>

                  <div className="gsap-hero-anim flex flex-wrap items-center gap-5">
                    <button
                      onClick={() => document.getElementById('grid-start')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-8 py-4 rounded-xl bg-gradient-to-br from-white to-red-100 text-red-950 font-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-2 border border-white/50"
                    >
                      Browse {stats.total} assets <ArrowRight size={18} strokeWidth={3} />
                    </button>
                    <button
                      onClick={generateNow}
                      disabled={generating || !apiAvailable}
                      title={apiAvailable ? undefined : 'Generation runs locally with Python'}
                      className="px-8 py-4 rounded-xl glass-thick-red text-white font-bold hover:bg-red-900/50 transition-colors border-red-400/40 shadow-[0_0_15px_rgba(255,0,0,0.2)] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <WandSparkles size={18} className={generating ? 'animate-spin' : ''} />
                      {generating ? 'Generating…' : apiAvailable ? 'Generate now' : 'Local generation only'}
                    </button>
                  </div>

                  <dl className="gsap-hero-anim grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 max-w-2xl">
                    {[
                      { label: 'Total assets', value: stats.total },
                      { label: 'Components', value: stats.components },
                      { label: 'Libraries', value: stats.libraries },
                      { label: 'Generated', value: stats.generated },
                    ].map((stat) => (
                      <div key={stat.label} className="glass-panel rounded-2xl px-4 py-3 border-red-500/20">
                        <dd className="text-3xl font-black text-white font-mono tabular-nums">{stat.value}</dd>
                        <dt className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest mt-1">
                          {stat.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 md:p-10 max-w-6xl mx-auto" id="grid-start">
            <div className="mb-8 flex flex-col gap-6 border-b border-red-500/20 pb-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-3">
                    {activeCategory === 'Daily' && <WandSparkles size={26} className="text-red-400" />}
                    {heading}
                  </h2>
                  <p className="text-red-400/80 mt-2 text-sm font-bold">{subheading}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-[11px] font-black font-mono text-red-300 uppercase tracking-widest glass-panel px-4 py-2 rounded-xl">
                    <Database size={14} className="text-red-500" />
                    <span aria-live="polite">
                      {filteredAssets.length} asset{filteredAssets.length !== 1 && 's'}
                    </span>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] font-black font-mono text-red-300 uppercase tracking-widest glass-panel px-3 py-2 rounded-xl">
                    <ArrowUpDown size={14} className="text-red-500" />
                    <span className="sr-only">Sort assets</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="bg-transparent text-red-200 font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-red-950 text-red-100">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-center glass-panel rounded-xl p-1" role="group" aria-label="View mode">
                    <button
                      onClick={() => setView('grid')}
                      aria-pressed={view === 'grid'}
                      aria-label="Grid view"
                      className={`p-2 rounded-lg transition-colors ${
                        view === 'grid' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      onClick={() => setView('list')}
                      aria-pressed={view === 'list'}
                      aria-label="List view"
                      className={`p-2 rounded-lg transition-colors ${
                        view === 'list' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-white'
                      }`}
                    >
                      <Rows3 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  {searchQuery.trim() && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950 border border-red-500/30 text-red-200">
                      “{searchQuery}”
                      <button onClick={() => setSearchQuery('')} aria-label="Remove search filter" className="hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {activeCategory !== ALL_CATEGORY && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950 border border-red-500/30 text-red-200">
                      {activeCategory}
                      <button
                        onClick={() => setActiveCategory(ALL_CATEGORY)}
                        aria-label="Remove category filter"
                        className="hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {showBookmarks && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950 border border-red-500/30 text-red-200">
                      Saved only
                      <button
                        onClick={() => setShowBookmarks(false)}
                        aria-label="Remove bookmarks filter"
                        className="hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 rounded-full text-red-400 hover:text-white hover:bg-red-900/40 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true" aria-label="Loading assets">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-3xl glass-thick-red overflow-hidden">
                    <div className="h-48 skeleton" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 w-3/4 skeleton rounded" />
                      <div className="h-3 w-full skeleton rounded" />
                      <div className="h-3 w-2/3 skeleton rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-24 glass-thick-red rounded-3xl border border-red-500/30">
                <AlertTriangle className="mx-auto h-14 w-14 text-red-500 mb-6" />
                <h3 className="text-2xl font-black text-white mb-2">Catalog offline</h3>
                <p className="text-red-300 font-medium max-w-sm mx-auto text-sm mb-6">{error}</p>
                <button
                  onClick={loadAssets}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-red-500 to-red-700 text-white font-bold hover:scale-105 transition-transform border border-red-400/50"
                >
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            ) : filteredAssets.length > 0 ? (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    view={view}
                    isNew={asset.seed === today}
                    onClick={() => setSelectedAsset(asset)}
                    isBookmarked={bookmarkedIds.has(asset.id)}
                    onToggleBookmark={() => toggleBookmark(asset.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass-thick-red rounded-3xl border border-red-500/20 border-dashed">
                <Command className="mx-auto h-16 w-16 text-red-800 mb-6 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                <h3 className="text-2xl font-black text-white mb-2">Nothing extracted</h3>
                <p className="text-red-400 font-medium max-w-sm mx-auto text-sm mb-6">
                  No 2026 data assets match this specific query.
                </p>
                {activeCategory === 'Daily' ? (
                  <button
                    onClick={generateNow}
                    disabled={generating || !apiAvailable}
                    title={apiAvailable ? undefined : 'Generation runs locally with Python'}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-red-500 to-red-700 text-white font-bold hover:scale-105 transition-transform border border-red-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <WandSparkles size={16} />{' '}
                    {generating ? 'Generating…' : apiAvailable ? "Generate today's asset" : 'Local generation only'}
                  </button>
                ) : hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-xl glass-panel text-red-100 font-bold hover:bg-red-900/50 transition-colors border border-red-500/30"
                  >
                    Reset filters
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedAsset && (
        <Suspense fallback={null}>
          <AssetModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        </Suspense>
      )}
    </div>
  );
}
