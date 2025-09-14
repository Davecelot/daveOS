/* Dev-only helper to check icon asset availability.
   Import this file in development to log missing assets and adjust ICON_CANDIDATES accordingly. */

import { ICON_CANDIDATES, getIconCandidates } from './icons';

export async function checkIconAssetsDev() {
  if (!(import.meta as any).env?.DEV) return;
  const names = Object.keys(ICON_CANDIDATES);
  for (const name of names) {
    // Prefer size 24 for general UI toolbars; the resolver will add size-aware XP paths
    const candidates = getIconCandidates(name as any, 24).filter((c) => !c.startsWith('lucide:'));
    let found = false;
    for (const url of candidates) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          found = true;
          break;
        }
      } catch {
        // ignore network errors in dev
      }
    }
    if (!found) {
      // eslint-disable-next-line no-console
      console.warn(`[icons] missing asset for: ${name} -> ${candidates.join(', ')}`);
    }
  }
}
