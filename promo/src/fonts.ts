import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

// Fuentes locales de la web (public/fonts). Se cargan con la API FontFace y el
// render espera (delayRender) hasta que están listas.
const faces: Array<[string, string, FontFaceDescriptors]> = [
  ['Jost', 'fonts/jost-latin.woff2', {weight: '300 600', style: 'normal'}],
  ['Cormorant Garamond', 'fonts/cormorant-latin.woff2', {weight: '400 600', style: 'normal'}],
  ['Cormorant Garamond', 'fonts/cormorant-italic-latin.woff2', {weight: '400 600', style: 'italic'}],
];

let started = false;

export const loadFonts = () => {
  if (started) return;
  started = true;
  const handle = delayRender('Cargando fuentes Jost / Cormorant Garamond');
  Promise.all(
    faces.map(([family, file, desc]) => {
      const face = new FontFace(family, `url('${staticFile(file)}') format('woff2')`, desc);
      return face.load().then((loaded) => {
        document.fonts.add(loaded);
        return loaded;
      });
    }),
  )
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((err) => cancelRender(err));
};
