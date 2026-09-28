import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {CaptionBlock, Headline, Label, Scrim, SHADOW_BIG, SHADOW_SMALL, Small, useReveal} from './Caption';
import {Framing, KenBurns, Photo, PHOTOS} from './KenBurns';
import {loadFonts} from './fonts';
import {C, LAYOUT, Orientation, SANS, SERIF, TOTAL_FRAMES, TRANSITION} from './theme';

loadFonts();

export type PromoProps = {orientation: Orientation};

// Música: copia recortada (0,9 s → 39,4 s) de «Times», Bigvegie, Freesound 560599, CC0.
const MUSIC_FILE = 'audio/musica-times-bigvegie-cc0.wav';
const MUSIC_VOLUME = 0.5;
const MUSIC_FADE_IN = 45; // 1,5 s
const MUSIC_FADE_OUT = 90; // 3 s
const BLACK_FADE = 28; // fundido a negro final (~0,9 s)

type Shot = {photo: Photo; from: Framing; to: Framing};

type SceneDef = {
  id: string;
  dur: number;
  enter: 'fade' | 'slide-up';
  shot?: Record<Orientation, Shot>;
  Text: React.FC<{o: Orientation; dur: number}>;
};

/* ---------------------------------- textos ---------------------------------- */

const HeroText: React.FC<{o: Orientation; dur: number}> = ({o, dur}) => {
  const L = LAYOUT[o];
  const a = useReveal(8, dur);
  const b = useReveal(26, dur);
  return (
    <CaptionBlock o={o} gap={o === 'h' ? 30 : 34}>
      <div
        style={{
          ...a,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: o === 'h' ? 22 : 26,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          color: C.paper,
          textShadow: SHADOW_SMALL,
        }}
      >
        Edificio Biera
      </div>
      <Headline o={o} italic size={L.hero} style={{...b, lineHeight: 1.02}}>
        Más que una vivienda,
        <br />
        un estilo de vida.
      </Headline>
    </CaptionBlock>
  );
};

const makeText =
  (opts: {label?: string; headline: React.ReactNode; small?: string; sub?: string}): React.FC<{
    o: Orientation;
    dur: number;
  }> =>
  ({o, dur}) => {
    const a = useReveal(12, dur);
    const b = useReveal(20, dur);
    const c = useReveal(30, dur);
    return (
      <CaptionBlock o={o}>
        {opts.label ? (
          <Label o={o} style={a}>
            {opts.label}
          </Label>
        ) : null}
        <Headline o={o} style={b}>
          {opts.headline}
        </Headline>
        {opts.sub ? (
          <div
            style={{
              ...c,
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: LAYOUT[o].label,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: C.light,
              textShadow: SHADOW_SMALL,
            }}
          >
            {opts.sub}
          </div>
        ) : null}
        {opts.small ? (
          <Small o={o} style={c}>
            {opts.small}
          </Small>
        ) : null}
      </CaptionBlock>
    );
  };

const PriceText: React.FC<{o: Orientation; dur: number}> = ({o, dur}) => {
  const a = useReveal(12, dur);
  const b = useReveal(22, dur);
  const big = o === 'h' ? 168 : 156;
  return (
    <CaptionBlock o={o} gap={o === 'h' ? 18 : 22}>
      <Label o={o} accent style={a}>
        Desde
      </Label>
      <div
        style={{
          ...b,
          display: 'flex',
          alignItems: 'baseline',
          gap: o === 'h' ? 26 : 22,
          fontFamily: SERIF,
          fontWeight: 400,
          color: C.light,
          fontVariantNumeric: 'lining-nums',
          textShadow: SHADOW_BIG,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{fontSize: big, lineHeight: 1, letterSpacing: '-0.01em'}}>289.000&nbsp;€</span>
        <span style={{fontSize: big * 0.4, lineHeight: 1, letterSpacing: '0.02em'}}>+ IVA</span>
      </div>
    </CaptionBlock>
  );
};

/* -------------------------------- cierre ----------------------------------- */

const Closing: React.FC<{o: Orientation; dur: number}> = ({o, dur}) => {
  const h = o === 'h';
  const r1 = useReveal(18, dur, false);
  const r2 = useReveal(28, dur, false);
  const r3 = useReveal(34, dur, false);
  const r4 = useReveal(54, dur, false);
  const r5 = useReveal(62, dur, false);
  const r6 = useReveal(76, dur, false);
  const centered: React.CSSProperties = {textAlign: 'center'};
  return (
    <AbsoluteFill style={{backgroundColor: C.night}}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          paddingLeft: LAYOUT[o].side,
          paddingRight: LAYOUT[o].side,
          // en vertical el bloque sube un poco para quedar centrado en la zona segura
          paddingBottom: h ? 40 : 120,
        }}
      >
        <div
          style={{
            ...r1,
            ...centered,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: h ? 28 : 30,
            letterSpacing: '0.42em',
            paddingLeft: '0.42em', // compensa el tracking final para centrar ópticamente
            textTransform: 'uppercase',
            color: C.paper,
          }}
        >
          Edificio Biera
        </div>
        <div style={{...r2, width: h ? 56 : 64, height: 1.5, backgroundColor: C.amber, margin: h ? '40px 0 38px' : '46px 0 44px'}} />
        <div
          style={{
            ...r3,
            ...centered,
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: h ? 82 : 84,
            lineHeight: 1.06,
            color: C.light,
            maxWidth: h ? 1400 : 900,
            textWrap: 'balance',
          }}
        >
          Más que una vivienda,{h ? ' ' : <br />}un estilo de vida.
        </div>
        <div
          style={{
            ...r4,
            ...centered,
            marginTop: h ? 64 : 84,
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: h ? 36 : 40,
            letterSpacing: '0.08em',
            color: C.paper,
          }}
        >
          edificiobiera.com
        </div>
        <div
          style={{
            ...r5,
            ...centered,
            marginTop: h ? 18 : 22,
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: h ? 22 : 24,
            letterSpacing: '0.2em',
            paddingLeft: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(241,237,230,0.78)',
          }}
        >
          JD León Inmobiliaria · 640 51 24 34
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          // vertical: por encima de los 260 px inferiores
          paddingBottom: h ? 64 : 300,
        }}
      >
        <div
          style={{
            ...r6,
            ...centered,
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: h ? 16 : 19,
            letterSpacing: '0.2em',
            paddingLeft: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(241,237,230,0.56)',
          }}
        >
          Infografías orientativas · Precios sin IVA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------- escenas ---------------------------------- */

export const SCENES: SceneDef[] = [
  {
    id: '1 · fachada (claim)',
    dur: 165,
    enter: 'fade',
    shot: {
      h: {photo: PHOTOS.fachada, from: {x: 0.5, y: 0.9, s: 1.0}, to: {x: 0.5, y: 0.72, s: 1.07}},
      v: {photo: PHOTOS.fachada, from: {x: 0.4, y: 0.5, s: 1.0}, to: {x: 0.56, y: 0.5, s: 1.06}},
    },
    Text: HeroText,
  },
  {
    id: '2 · aérea',
    dur: 120,
    enter: 'fade',
    shot: {
      h: {photo: PHOTOS.aerea, from: {x: 0.5, y: 0.3, s: 1.02}, to: {x: 0.5, y: 0.55, s: 1.08}},
      v: {photo: PHOTOS.aerea, from: {x: 0.32, y: 0.5, s: 1.0}, to: {x: 0.48, y: 0.5, s: 1.05}},
    },
    Text: makeText({label: '10 tríplex de obra nueva', headline: 'Santa Catalina, al sur de Murcia'}),
  },
  {
    id: '3 · salón',
    dur: 120,
    enter: 'fade',
    shot: {
      h: {photo: PHOTOS.salon, from: {x: 0.5, y: 0.5, s: 1.0}, to: {x: 0.56, y: 0.56, s: 1.08}},
      v: {photo: PHOTOS.salon, from: {x: 0.36, y: 0.5, s: 1.0}, to: {x: 0.5, y: 0.5, s: 1.05}},
    },
    Text: makeText({label: 'Dos modalidades', headline: '3 o 4 dormitorios + estudio en buhardilla'}),
  },
  {
    id: '4 · cocina',
    dur: 120,
    enter: 'fade',
    shot: {
      h: {photo: PHOTOS.cocinaH, from: {x: 0.25, y: 0.5, s: 1.0}, to: {x: 0.7, y: 0.5, s: 1.05}},
      v: {photo: PHOTOS.cocinaV, from: {x: 0.55, y: 0.35, s: 1.0}, to: {x: 0.55, y: 0.35, s: 1.08}},
    },
    Text: makeText({
      label: 'En todas las viviendas',
      headline: '3 o 4 baños y aseos',
      small: 'La cocina se entrega sin amueblar',
    }),
  },
  {
    id: '5 · solárium',
    dur: 120,
    enter: 'slide-up', // «subimos» a la cubierta
    shot: {
      h: {photo: PHOTOS.terraza, from: {x: 0.5, y: 0.45, s: 1.0}, to: {x: 0.5, y: 0.62, s: 1.05}},
      v: {photo: PHOTOS.terraza, from: {x: 0.2, y: 0.5, s: 1.0}, to: {x: 0.55, y: 0.5, s: 1.04}},
    },
    Text: makeText({label: 'Solárium privado', headline: 'De 18 a 77 m²'}),
  },
  {
    id: '6 · dormitorio (calidades)',
    dur: 120,
    enter: 'fade',
    shot: {
      h: {photo: PHOTOS.dormitorioH, from: {x: 0.5, y: 0.6, s: 1.0}, to: {x: 0.5, y: 0.5, s: 1.08}},
      v: {photo: PHOTOS.dormitorioV, from: {x: 0.55, y: 0.5, s: 1.0}, to: {x: 0.6, y: 0.45, s: 1.07}},
    },
    Text: makeText({label: 'Calidades', headline: 'Suelos y baños Porcelanosa Grupo', sub: 'Mecanismos JUNG'}),
  },
  {
    id: '7 · garaje',
    dur: 126,
    enter: 'fade',
    shot: {
      h: {photo: PHOTOS.terraza2, from: {x: 0.3, y: 0.5, s: 1.04}, to: {x: 0.7, y: 0.5, s: 1.09}},
      v: {photo: PHOTOS.bano, from: {x: 0.4, y: 0.5, s: 1.0}, to: {x: 0.5, y: 0.4, s: 1.07}},
    },
    Text: makeText({headline: 'Garaje cerrado con escalera propia o plaza de aparcamiento'}),
  },
  {
    id: '8 · precio (noche)',
    dur: 135,
    enter: 'fade',
    shot: {
      h: {photo: PHOTOS.noche, from: {x: 0.5, y: 0.75, s: 1.0}, to: {x: 0.46, y: 0.85, s: 1.06}},
      v: {photo: PHOTOS.noche, from: {x: 0.36, y: 0.5, s: 1.0}, to: {x: 0.46, y: 0.5, s: 1.05}},
    },
    Text: PriceText,
  },
  {
    id: '9 · cierre',
    dur: 228,
    enter: 'fade',
    Text: Closing,
  },
];

export const TOTAL_FROM_SCENES =
  SCENES.reduce((acc, s) => acc + s.dur, 0) - (SCENES.length - 1) * TRANSITION;

if (TOTAL_FROM_SCENES !== TOTAL_FRAMES) {
  throw new Error(`Duración de escenas (${TOTAL_FROM_SCENES}) ≠ TOTAL_FRAMES (${TOTAL_FRAMES})`);
}

const timing = linearTiming({durationInFrames: TRANSITION, easing: Easing.inOut(Easing.quad)});

const SceneView: React.FC<{scene: SceneDef; o: Orientation}> = ({scene, o}) => {
  const shot = scene.shot?.[o];
  return (
    <AbsoluteFill style={{backgroundColor: C.night}}>
      {shot ? <KenBurns photo={shot.photo} from={shot.from} to={shot.to} duration={scene.dur} /> : null}
      {shot ? <Scrim o={o} /> : null}
      <scene.Text o={o} dur={scene.dur} />
    </AbsoluteFill>
  );
};

const Music: React.FC = () => (
  <Audio
    src={staticFile(MUSIC_FILE)}
    volume={(f) =>
      MUSIC_VOLUME *
      Math.min(
        interpolate(f, [0, MUSIC_FADE_IN], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        interpolate(f, [TOTAL_FRAMES - MUSIC_FADE_OUT, TOTAL_FRAMES - 1], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      )
    }
  />
);

const FadeToBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [TOTAL_FRAMES - BLACK_FADE, TOTAL_FRAMES - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  return <AbsoluteFill style={{backgroundColor: '#000', opacity}} />;
};

export const Promo: React.FC<PromoProps> = ({orientation}) => {
  const o = orientation;
  return (
    <AbsoluteFill style={{backgroundColor: C.night}}>
      <TransitionSeries>
        {SCENES.map((scene, i) => (
          <React.Fragment key={scene.id}>
            {i > 0 ? (
              <TransitionSeries.Transition
                presentation={scene.enter === 'slide-up' ? slide({direction: 'from-bottom'}) : fade()}
                timing={timing}
              />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={scene.dur}>
              <SceneView scene={scene} o={o} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
      <FadeToBlack />
      <Music />
    </AbsoluteFill>
  );
};
