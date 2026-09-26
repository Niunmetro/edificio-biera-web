import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_SITE, LAYOUT, Orientation, SANS, SERIF, TRANSITION} from './theme';

const RISE = 12; // px
const IN = 22; // frames de entrada
const OUT = 12; // frames de salida

// Entrada: opacidad + subida de 12 px. Salida: se desvanece justo antes de que
// empiece la transición a la escena siguiente (así nunca se solapan dos textos).
export const useReveal = (delay: number, sceneDuration: number, fadeOut = true) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [delay, delay + IN], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_SITE,
  });
  const outEnd = sceneDuration - TRANSITION;
  const outP = fadeOut
    ? interpolate(frame, [outEnd - OUT, outEnd], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;
  return {
    opacity: inP * outP,
    transform: `translateY(${(1 - inP) * RISE}px)`,
  } as React.CSSProperties;
};

// Degradado ink 0 → 55 % en la parte inferior, para legibilidad. Se mantiene al
// 55 % en toda la franja donde vive el texto y se disuelve por encima.
export const Scrim: React.FC<{o: Orientation; strength?: number}> = ({o, strength = 0.55}) => {
  const k = (f: number) => `rgba(30,36,41,${(strength * f).toFixed(3)})`;
  const stops =
    o === 'h'
      ? `${k(1)} 0%, ${k(0.95)} 24%, ${k(0.62)} 40%, ${k(0.25)} 54%, ${k(0)} 68%`
      : `${k(1)} 0%, ${k(1)} 24%, ${k(0.8)} 36%, ${k(0.4)} 48%, ${k(0.12)} 58%, ${k(0)} 66%`;
  return <AbsoluteFill style={{background: `linear-gradient(to top, ${stops})`}} />;
};

const SHADOW_SMALL = '0 1px 2px rgba(21,25,28,0.35), 0 1px 14px rgba(21,25,28,0.55)';
const SHADOW_BIG = '0 1px 3px rgba(21,25,28,0.25), 0 2px 28px rgba(21,25,28,0.45)';

export const Label: React.FC<{
  o: Orientation;
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: boolean;
}> = ({o, children, style, accent}) => {
  const L = LAYOUT[o];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: o === 'h' ? 20 : 22,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: L.label,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        lineHeight: 1.3,
        color: C.light,
        textShadow: SHADOW_SMALL,
        ...style,
      }}
    >
      <span
        style={{
          display: 'block',
          width: o === 'h' ? 44 : 48,
          height: 1.5,
          backgroundColor: accent ? C.amber : 'rgba(247,245,241,0.7)',
        }}
      />
      <span>{children}</span>
    </div>
  );
};

export {SHADOW_SMALL, SHADOW_BIG};

export const Headline: React.FC<{
  o: Orientation;
  children: React.ReactNode;
  style?: React.CSSProperties;
  size?: number;
  italic?: boolean;
}> = ({o, children, style, size, italic}) => {
  const L = LAYOUT[o];
  return (
    <div
      style={{
        fontFamily: SERIF,
        fontWeight: 400,
        fontStyle: italic ? 'italic' : 'normal',
        fontSize: size ?? L.headline,
        lineHeight: 1.04,
        letterSpacing: '-0.005em',
        fontVariantNumeric: 'lining-nums',
        color: C.light,
        maxWidth: L.maxText,
        textWrap: 'balance',
        textShadow: SHADOW_BIG,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Small: React.FC<{o: Orientation; children: React.ReactNode; style?: React.CSSProperties}> = ({
  o,
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 400,
      fontSize: LAYOUT[o].small,
      letterSpacing: '0.04em',
      lineHeight: 1.4,
      color: 'rgba(247,245,241,0.9)',
      textShadow: SHADOW_SMALL,
      ...style,
    }}
  >
    {children}
  </div>
);

// Bloque de texto anclado abajo-izquierda respetando márgenes y zonas seguras
export const CaptionBlock: React.FC<{o: Orientation; children: React.ReactNode; gap?: number}> = ({
  o,
  children,
  gap,
}) => {
  const L = LAYOUT[o];
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingLeft: L.side,
        paddingRight: L.side,
        paddingBottom: L.bottom,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: gap ?? (o === 'h' ? 26 : 30)}}>{children}</div>
    </AbsoluteFill>
  );
};
