/* Dev-only helper to check icon asset availability.
   Import this file in development to log missing assets and adjust ICON_CANDIDATES accordingly. */

import { ICON_CANDIDATES, XP_BASE, CC0_BASE } from './icons';

export async function checkIconAssetsDev() {
  if (!(import.meta as any).env?.DEV) return;
  const names = Object.keys(ICON_CANDIDATES);
  for (const name of names) {
    const candidates = (ICON_CANDIDATES as any)[name] as string[];
    let found = false;
    for (const file of candidates) {
      for (const base of [XP_BASE, CC0_BASE]) {
        try {
          const res = await fetch(base + file, { method: 'HEAD' });
          if (res.ok) {
            found = true;
            break;
          }
        } catch {
          // ignore network errors in dev
        }
      }
      if (found) break;
    }
    if (!found) {
      // eslint-disable-next-line no-console
      console.warn(`[icons] missing asset for: ${name} -> ${candidates.join(', ')}`);
    }
  }
}
