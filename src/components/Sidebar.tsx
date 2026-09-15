import React, { useRef } from 'react';
import { cn } from '../lib/utils';
import {
  Database,
  Sparkles,
  CircleDollarSign,
  MousePointerClick,
  Quote,
  Compass,
  Bot,
  Waves,
  BarChart3,
  Type,
  LayoutPanelTop,
  Library,
  Component,
  Bookmark,
  Hexagon,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ALL_CATEGORY, CatalogStats, CategoryCount } from '../types';

interface SidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  showBookmarks: boolean;
  onToggleShowBookmarks: (show: boolean) => void;
  bookmarkCount: number;
  categories: CategoryCount[];
  stats: CatalogStats;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Daily: WandSparkles,
  Heroes: Sparkles,
  Pricing: CircleDollarSign,
  Buttons: MousePointerClick,
  Testimonials: Quote,
  Navigation: Compass,
  'AI & Auth': Bot,
  'Backgrounds & Shaders': Waves,
  'Data & Dashboards': BarChart3,
  'Typography & Motion': Type,
  'Sections & Cards': LayoutPanelTop,
  Libraries: Library,
  'UI Components': Component,
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Sidebar({
  activeCategory,
  onSelectCategory,
  showBookmarks,
  onToggleShowBookmarks,
  bookmarkCount,
  categories,
  stats,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.sidebar-item', {
        x: -50,
        opacity: 0,
        stagger: 0.04,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      });
    },
    { scope: sidebarRef },
  );

  const items = [
    { id: ALL_CATEGORY, label: 'All 2026 Datasets', icon: Database as LucideIcon, count: stats.total },
    ...categories.map((category) => ({
      id: category.id,
      label: category.id,
      icon: CATEGORY_ICONS[category.id] ?? Component,
      count: category.count,
    })),
  ];

  return (
    <aside
      ref={sidebarRef}
      className="w-64 glass-thick-red border-r border-red-500/30 flex-shrink-0 h-[calc(100vh-65px)] overflow-y-auto hidden md:block"
    >
      <div className="p-5 space-y-8 relative z-10">
        {/* Library Info (Hacker-Premium Vibe) */}
        <div className="sidebar-item px-3 py-4 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-3 shadow-[inset_0_2px_10px_rgba(255,0,0,0.1)]">
          <motion.div
            animate={prefersReducedMotion() ? undefined : { rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <Hexagon className="text-red-400 shrink-0 mt-0.5 filter drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]" size={20} />
          </motion.div>
          <div>
            <h4 className="text-sm font-bold text-red-100 tracking-tight">Belentani Core</h4>
            <p className="text-[10px] font-mono text-red-400 mt-1 uppercase tracking-widest">
              Status: <span className="text-red-300 font-bold">Max Extract</span>
            </p>
          </div>
        </div>

        {/* Categories */}
        <nav className="space-y-3" aria-label="Categories">
          <h3 className="sidebar-item text-[10px] font-bold text-red-500 font-mono uppercase tracking-widest px-2">
            Data Repos
          </h3>
          <div className="space-y-1">
            {items.map((cat) => {
              const isActive = !showBookmarks && activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onToggleShowBookmarks(false);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'sidebar-item w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all font-medium border border-transparent',
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-[0_4px_15px_rgba(255,0,0,0.4)] border-red-400/50'
                      : 'text-red-300/70 hover:bg-red-900/30 hover:border-red-500/20 hover:text-red-100',
                  )}
                >
                  <cat.icon size={16} className={cn('shrink-0', isActive ? 'text-white' : 'text-red-500/70')} />
                  <span className="truncate text-left flex-1">{cat.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded',
                      isActive ? 'bg-black/30 text-white' : 'bg-red-950/60 text-red-400',
                    )}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Personal State */}
        <div className="space-y-3">
          <h3 className="sidebar-item text-[10px] font-bold text-red-500 font-mono uppercase tracking-widest px-2">
            Your Extracts
          </h3>
          <button
            onClick={() => onToggleShowBookmarks(true)}
            aria-current={showBookmarks ? 'page' : undefined}
            className={cn(
              'sidebar-item w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all font-medium border border-transparent',
              showBookmarks
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-[0_4px_15px_rgba(255,0,0,0.4)] border-red-400/50'
                : 'text-red-300/70 hover:bg-red-900/30 hover:border-red-500/20 hover:text-red-100',
            )}
          >
            <Bookmark size={16} className={cn('shrink-0', showBookmarks ? 'text-white' : 'text-red-500/70')} />
            <span className="flex-1 text-left">Saved Assets</span>
            <span
              className={cn(
                'text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded',
                showBookmarks ? 'bg-black/30 text-white' : 'bg-red-950/60 text-red-400',
              )}
            >
              {bookmarkCount}
            </span>
          </button>
        </div>

        <p className="sidebar-item text-[10px] font-mono text-red-500/70 leading-relaxed px-2">
          {stats.components} components · {stats.libraries} libraries · {stats.generated} generated ·{' '}
          {stats.authors} authors
        </p>
      </div>
    </aside>
  );
}
