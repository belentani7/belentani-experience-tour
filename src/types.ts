export type AssetKind = "featured" | "component" | "library" | "generated";

/** Sentinel category meaning "no category filter". */
export const ALL_CATEGORY = "All";

export interface Asset {
  id: string;
  title: string;
  category: string;
  description: string;
  source: string;
  code: string;
  /** Registry author handle, e.g. "@dillionverma". */
  author?: string;
  /** Canonical source URL (21st.dev). */
  url?: string;
  /** Feature keywords derived from the slug. */
  tags?: string[];
  /** Where this asset comes from. */
  kind?: AssetKind;
  /** Belentani in-house components. */
  featured?: boolean;
  /** ISO timestamp — only present on daily-generated assets. */
  createdAt?: string;
  /** Deterministic generation seed (YYYYMMDD) — only on daily-generated assets. */
  seed?: number;
  /** Content hash — only on daily-generated assets. */
  hash?: string;
}

export interface CatalogStats {
  total: number;
  components: number;
  libraries: number;
  featured: number;
  generated: number;
  authors: number;
}

export interface CategoryCount {
  id: string;
  count: number;
}
