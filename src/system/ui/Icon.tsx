import React, { useMemo, useState } from 'react';
import { getIconCandidates } from './icons';
// Optional fallback: lucide-react icon set (already present in project deps)
// If removed from deps, this import will be tree-shaken out by bundler when unused.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as lucideIcons from 'lucide-react';

export const ICON_16 = 16;
export const ICON_24 = 24;
export const ICON_32 = 32;
export const ICON_48 = 48;

type IconProps = {
  name: string;
  size?: number;
  alt?: string;
  className?: string;
  title?: string;
};

export const Icon: React.FC<IconProps> = ({ name, size = ICON_32, alt, className, title }) => {
  const candidates = useMemo(() => getIconCandidates(name), [name]);
  const [idx, setIdx] = useState(0);

  // lucide fallback: a candidate formatted as "lucide:Name"
  if (candidates[idx]?.startsWith('lucide:')) {
    const compName = candidates[idx].slice('lucide:'.length) as keyof typeof lucideIcons;
    const LucideComp = (lucideIcons as any)[compName] as React.ComponentType<any> | undefined;
    if (LucideComp) {
      return <LucideComp width={size} height={size} className={className} title={title || alt || name} />;
    }
  }

  const src = candidates[idx];
  const handleError = () => {
    if (idx < candidates.length - 1) {
      setIdx(idx + 1);
    } else if (idx !== candidates.length - 1) {
      setIdx(candidates.length - 1);
    }
  };

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt || String(name)}
      title={title || alt || String(name)}
      className={className}
      draggable={false}
      onError={handleError}
      style={{ imageRendering: 'auto' }}
    />
  );
};
