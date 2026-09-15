import type { Asset, CatalogStats } from '../types';
import { FEATURED } from './featured';
import { REGISTRY } from './registry';

/**
 * Static catalog (server-side). The client never imports this module —
 * it receives data through the API — so the 150-entry registry is not
 * bundled into the browser build.
 */

/** Display order of the sidebar categories. `Daily` holds generated assets. */
export const CATEGORY_ORDER = [
  'Daily',
  'Heroes',
  'Pricing',
  'Buttons',
  'Testimonials',
  'Navigation',
  'AI & Auth',
  'Backgrounds & Shaders',
  'Data & Dashboards',
  'Typography & Motion',
  'Sections & Cards',
  'Libraries',
  'UI Components',
] as const;

export type CategoryName = (typeof CATEGORY_ORDER)[number];

/** In-house Belentani components first, then the 21st.dev registry. */
export const ALL_ASSETS: Asset[] = [...FEATURED, ...REGISTRY];

export function categoryCounts(assets: Asset[]): Record<string, number> {
  return assets.reduce(
    (acc, asset) => {
      acc[asset.category] = (acc[asset.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/** Categories present in the given assets, in display order (unknown ones last). */
export function activeCategories(assets: Asset[]): string[] {
  const counts = categoryCounts(assets);
  const ordered = CATEGORY_ORDER.filter((category) => (counts[category] ?? 0) > 0);
  const extras = Object.keys(counts).filter(
    (category) => !(CATEGORY_ORDER as readonly string[]).includes(category),
  );
  return [...ordered, ...extras];
}

export function computeStats(assets: Asset[]): CatalogStats {
  return {
    total: assets.length,
    components: assets.filter((a) => a.kind === 'component').length,
    libraries: assets.filter((a) => a.kind === 'library').length,
    featured: assets.filter((a) => a.featured).length,
    generated: assets.filter((a) => a.kind === 'generated').length,
    authors: new Set(assets.map((a) => a.author).filter(Boolean)).size,
  };
}
