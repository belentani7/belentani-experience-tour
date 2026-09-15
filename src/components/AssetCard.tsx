import React, { useRef } from 'react';
import { Asset } from '../types';
import {
  Bookmark,
  Terminal,
  Box,
  Sparkles,
  Layers,
  Cpu,
  ExternalLink,
  BadgeCheck,
  Library,
  WandSparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';
import gsap from 'gsap';

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  view?: 'grid' | 'list';
  /** True when this is today's generated asset. */
  isNew?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function CategoryIcon({ category, size = 28 }: { category: string; size?: number }) {
  if (category === 'Daily') return <WandSparkles className="text-red-200 drop-shadow-[0_0_10px_rgba(255,80,80,0.7)]" size={size} strokeWidth={1.5} />;
  if (category === 'Heroes') return <Sparkles className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" size={size} strokeWidth={1.5} />;
  if (category === 'Data & Dashboards') return <Cpu className="text-red-300" size={size} strokeWidth={1.5} />;
  if (category === 'Backgrounds & Shaders' || category === 'Typography & Motion')
    return <Layers className="text-red-400" size={size} strokeWidth={1.5} />;
  if (category === 'Libraries') return <Library className="text-red-400" size={size} strokeWidth={1.5} />;
  return <Box className="text-red-500" size={size} strokeWidth={1.5} />;
}

export function AssetCard({ asset, onClick, isBookmarked, onToggleBookmark, view = 'grid', isNew = false }: AssetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getPattern = () => {
    if (asset.category === 'Heroes') return 'pattern-grid-red';
    if (asset.category === 'Backgrounds & Shaders') return 'pattern-diagonal-red';
    return 'pattern-dots-red';
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion()) return;
    gsap.to(cardRef.current, { y: -8, scale: 1.02, duration: 0.4, ease: 'power3.out' });
    gsap.to(cardRef.current?.querySelector('.shimmer-overlay'), { opacity: 1, duration: 0.3 });
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion()) return;
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
    gsap.to(cardRef.current?.querySelector('.shimmer-overlay'), { opacity: 0, duration: 0.3 });
  };

  const openInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (asset.url) window.open(asset.url, '_blank', 'noopener,noreferrer');
  };

  const BookmarkButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleBookmark();
      }}
      aria-label={isBookmarked ? `Remove ${asset.title} from saved` : `Save ${asset.title}`}
      aria-pressed={isBookmarked}
      className={cn(
        'p-2.5 rounded-full backdrop-blur-md border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400',
        isBookmarked
          ? 'bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(255,0,0,0.6)]'
          : 'bg-black/50 text-red-300/70 border-red-500/20 hover:bg-red-500/20 hover:text-white',
      )}
    >
      <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} strokeWidth={isBookmarked ? 1 : 2} />
    </button>
  );

  if (view === 'list') {
    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className="group relative flex items-center gap-5 rounded-2xl overflow-hidden cursor-pointer glass-thick-red transition-all duration-300 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <div className="shimmer-overlay absolute inset-0 bg-gradient-to-br from-red-400/20 via-red-600/10 to-transparent opacity-0 pointer-events-none transition-opacity" />

        <div
          className={cn(
            'relative z-10 w-14 h-14 shrink-0 rounded-xl border border-red-400/30 bg-red-900/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(200,0,0,0.5)] flex items-center justify-center',
          )}
        >
          <CategoryIcon category={asset.category} size={24} />
        </div>

        <div className="min-w-0 flex-1 relative z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-red-200 transition-colors">
              {asset.title}
            </h3>
            {asset.featured && (
              <BadgeCheck size={14} className="text-red-400 shrink-0" aria-label="In-house Belentani asset" />
            )}
            {isNew && (
              <span className="text-[9px] font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-red-500 text-white shrink-0">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-red-200/70 line-clamp-1 leading-relaxed">{asset.description}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-red-500/80">
            <span className="uppercase tracking-widest">{asset.category}</span>
            {asset.author && <span className="text-red-400/70">· {asset.author}</span>}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          {asset.url && (
            <button
              onClick={openInNewTab}
              aria-label={`Open ${asset.title} on 21st.dev`}
              className="p-2.5 rounded-full bg-black/50 text-red-300/70 border border-red-500/20 hover:bg-red-500/20 hover:text-white transition-all"
            >
              <ExternalLink size={15} />
            </button>
          )}
          {BookmarkButton}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer glass-thick-red transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
    >
      <div className="shimmer-overlay absolute inset-0 bg-gradient-to-br from-red-400/20 via-red-600/10 to-transparent opacity-0 pointer-events-none transition-opacity" />

      <div
        className={cn(
          'h-48 w-full relative flex items-center justify-center p-6 overflow-hidden bg-red-950/40 border-b border-red-500/20',
          getPattern(),
        )}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500 rounded-full blur-[50px] opacity-20 group-hover:opacity-50 transition-opacity duration-500" />

        <div className="relative z-10 w-16 h-16 rounded-2xl border border-red-400/30 bg-red-900/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(200,0,0,0.5)] flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-30" />
          <CategoryIcon category={asset.category} />
        </div>

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="text-[9px] font-black font-mono uppercase tracking-widest px-2 py-1 rounded-md bg-black/50 backdrop-blur-md border border-red-500/20 text-red-300">
            {asset.kind ?? 'component'}
          </span>
          {isNew && (
            <span className="text-[9px] font-black font-mono uppercase tracking-widest px-2 py-1 rounded-md bg-red-500 text-white border border-red-300/60 shadow-[0_0_12px_rgba(255,0,0,0.6)]">
              New today
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 z-20">{BookmarkButton}</div>
      </div>

      <div className="p-6 flex flex-col gap-3 flex-1 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight mb-1 group-hover:text-red-200 transition-colors flex items-center gap-2">
            <span className="truncate">{asset.title}</span>
            {asset.featured && <BadgeCheck size={15} className="text-red-400 shrink-0" aria-label="In-house Belentani asset" />}
          </h3>
          <p className="text-sm text-red-200/70 line-clamp-2 leading-relaxed">{asset.description}</p>
        </div>

        {(asset.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {asset.tags!.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-950/70 border border-red-500/15 text-red-300/90"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-red-900/40 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md bg-red-950 border border-red-500/20 text-red-400 shadow-inner truncate">
            {asset.category}
          </span>
          <div className="flex items-center gap-1.5 text-red-500/80 min-w-0">
            {asset.author ? (
              <span className="text-[10px] font-bold font-mono truncate">{asset.author}</span>
            ) : (
              <>
                <Terminal size={12} className="shrink-0" />
                <span className="text-[10px] font-bold font-mono truncate">{asset.source}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
