import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases condicionales de Tailwind resolviendo conflictos.
 *
 * Restauro tras el refactor que elimino `src/lib/`. Sin este modulo
 * `tsc --noEmit` falla con TS2307 en:
 *   - src/components/AssetCard.tsx (linea 15)
 *   - src/components/Sidebar.tsx  (linea 2)
 *
 * Dependencias ya presentes: clsx ^2.1.1, tailwind-merge ^3.7.0
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
