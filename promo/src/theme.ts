import {Easing} from 'remotion';

// Sistema de diseño de la web (assets/css/styles.css)
export const C = {
  paper: '#F1EDE6',
  light: '#F7F5F1',
  ink: '#1E2429',
  night: '#15191C',
  slate: '#56697A',
  stone: '#ECE6DD',
  amber: '#D59B34',
} as const;

export const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
export const SANS = "'Jost', system-ui, 'Segoe UI', sans-serif";

// --ease de la web: cubic-bezier(.2,.7,.2,1)
export const EASE_SITE = Easing.bezier(0.2, 0.7, 0.2, 1);
// Ken Burns: casi lineal, con extremos suaves
export const EASE_KB = Easing.bezier(0.33, 0.12, 0.67, 0.9);

export const FPS = 30;
export const TOTAL_FRAMES = 1110; // 37 s
export const TRANSITION = 18; // 0,6 s

export type Orientation = 'h' | 'v';

export type Layout = {
  width: number;
  height: number;
  side: number; // margen lateral
  bottom: number; // distancia del bloque de texto al borde inferior
  label: number;
  headline: number;
  hero: number;
  small: number;
  maxText: number;
};

export const LAYOUT: Record<Orientation, Layout> = {
  h: {
    width: 1920,
    height: 1080,
    side: 120,
    bottom: 112,
    label: 22,
    headline: 80,
    hero: 104,
    small: 24,
    maxText: 1180,
  },
  v: {
    width: 1080,
    height: 1920,
    side: 80,
    // zona segura: nada de texto en los 260 px inferiores (UI de Instagram/TikTok)
    bottom: 330,
    label: 26,
    headline: 86,
    hero: 100,
    small: 28,
    maxText: 920,
  },
};
