import * as React from 'react';
import { useDarkTheme } from './use-dark-theme';

interface Rgb { r: number; g: number; b: number; a: number }

const parseColor = (color: string): Rgb | null => {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [r, g, b, a].some(Number.isNaN) ? null : {
    r, g, b, a,
  };
};

// First opaque background at or above the element: what the stack sits on
const backdropOf = (selector: string): Rgb | null => {
  let element = document.querySelector(selector);
  while (element) {
    const color = parseColor(getComputedStyle(element).backgroundColor);
    if (color && color.a > 0.5) return color;
    element = element.parentElement;
  }
  return null;
};

const mix = (a: Rgb, b: Rgb, amount: number) => {
  const channel = (x: number, y: number) => Math.round(x + (y - x) * amount);
  return `rgb(${channel(a.r, b.r)}, ${channel(a.g, b.g)}, ${channel(a.b, b.b)})`;
};

const isDark = ({ r, g, b }: Rgb) => (0.299 * r + 0.587 * g + 0.114 * b) < 140;

const WHITE: Rgb = {
  r: 255, g: 255, b: 255, a: 1,
};
const INK: Rgb = {
  r: 6, g: 23, b: 42, a: 1,
};

/**
 * Colors of the stack itself, as CSS variables.
 *
 * Docked in a bar of the client (nav bar, actions bar) it takes the bar's own
 * background, slightly lifted, so it reads as part of the bar in any theme.
 * Over the media area it is a card, like the client's own floating controls.
 */
export const useSurface = (bar?: string): { dark: boolean; vars: React.CSSProperties } => {
  const dark = useDarkTheme();
  const [backdrop, setBackdrop] = React.useState<string>('');

  React.useEffect(() => {
    if (!bar) return undefined;
    const read = () => {
      const color = backdropOf(bar);
      setBackdrop(color ? `${color.r},${color.g},${color.b}` : '');
    };
    read();
    // Themes are plain CSS and can load or change at any time
    const interval = window.setInterval(read, 3000);
    return () => window.clearInterval(interval);
  }, [bar, dark]);

  const vars = React.useMemo(() => {
    if (!bar || !backdrop) return {};
    const [r, g, b] = backdrop.split(',').map(Number);
    const base: Rgb = {
      r, g, b, a: 1,
    };
    const ink = isDark(base) ? WHITE : INK;
    return {
      '--pav-bg': mix(base, ink, 0.1),
      '--pav-fg': mix(ink, base, 0),
      '--pav-muted-bg': mix(base, ink, 0.24),
      '--pav-border': mix(base, ink, 0.2),
      '--pav-shadow': 'none',
    } as React.CSSProperties;
  }, [bar, backdrop]);

  return { dark, vars };
};
