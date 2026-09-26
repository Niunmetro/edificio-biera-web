import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {EASE_KB} from './theme';

export type Photo = {
  file: string; // ruta dentro de public/img
  w: number; // tamaño natural
  h: number;
};

// Punto de encuadre: x/y funcionan como object-position (0 = izq/arriba, 1 = der/abajo);
// s = zoom adicional sobre "cover" (>= 1, nunca deja ver bordes).
export type Framing = {x: number; y: number; s: number};

export const PHOTOS = {
  fachada: {file: 'img/fachada.jpg', w: 1600, h: 1022},
  aerea: {file: 'img/foto-aerea-tarde.jpg', w: 1448, h: 1086},
  salon: {file: 'img/foto-salon.jpg', w: 1536, h: 1024},
  cocinaH: {file: 'img/interior-cocina.jpg', w: 1589, h: 730},
  cocinaV: {file: 'img/foto-cocina.jpg', w: 900, h: 1600},
  dormitorioH: {file: 'img/foto-dormitorio.jpg', w: 1448, h: 1086},
  dormitorioV: {file: 'img/foto-dormitorio2.jpg', w: 1122, h: 1402},
  terraza: {file: 'img/foto-terraza.jpg', w: 1254, h: 1254},
  terraza2: {file: 'img/foto-terraza2.jpg', w: 1536, h: 1024},
  bano: {file: 'img/foto-bano.jpg', w: 1122, h: 1402},
  noche: {file: 'img/foto-fachada-noche.jpg', w: 1448, h: 1086},
} satisfies Record<string, Photo>;

export const KenBurns: React.FC<{
  photo: Photo;
  from: Framing;
  to: Framing;
  duration: number; // duración de la escena (incluye solapes de transición)
}> = ({photo, from, to, duration}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();

  const p = interpolate(frame, [0, duration - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_KB,
  });
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p;
  const s = Math.max(1, from.s + (to.s - from.s) * p);

  // object-fit: cover calculado a mano para poder hacer zoom + paneo sin bordes
  const cover = Math.max(W / photo.w, H / photo.h);
  const baseW = photo.w * cover;
  const baseH = photo.h * cover;
  const left = (W - baseW * s) * x;
  const top = (H - baseH * s) * y;

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#15191C'}}>
      <Img
        src={staticFile(photo.file)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: baseW,
          height: baseH,
          maxWidth: 'none',
          transformOrigin: '0 0',
          transform: `translate3d(${left}px, ${top}px, 0) scale(${s})`,
        }}
      />
    </AbsoluteFill>
  );
};
