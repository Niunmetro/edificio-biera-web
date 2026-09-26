# Música del vídeo promocional Edificio Biera

| Campo | Valor |
|---|---|
| Pista | **«Times»** (instrumental: progresión de acordes de piano sobre coro de órgano) |
| Autor | **Bigvegie** (Freesound) |
| Fuente | https://freesound.org/people/Bigvegie/sounds/560599/ |
| Licencia | **Creative Commons 0 (CC0 1.0, dominio público)**: http://creativecommons.org/publicdomain/zero/1.0/. Permite el uso comercial. No exige atribución; se incluye igualmente por cortesía. |
| Fichero en el proyecto | `public/audio/musica-times-bigvegie-cc0.wav` |

## De dónde sale y cómo se comprobó

- Origen: `D:\SOLO-SE-STUDIO\assets\audio\SS-AUD-0255\SS-AUD-0255_freesound_560599.mp3`
  (SHA-256 `44e76630f3b5b153330969eb7bfec711ef43710b41fd2f5551b38aa4d4f14017`).
- `SS-AUD-0255\certificate.json`:
  - `license.type` = "CC0"
  - `license.source` = "Freesound"
  - `license.url` = la URL de arriba
  - `license.autor` = "Bigvegie"
  - `attribution_required` = false
  - `id_fuente` = "560599"
  - `nota` = "recodificado tras una colision de numeracion"
- El certificado original al que remite (`SS-AUD-0024\certificate.json`) tiene los metadatos de Freesound:
  - id 560599, name "Times", username "Bigvegie"
  - license `http://creativecommons.org/publicdomain/zero/1.0/`
  - duration 65.7116 s
  - tags Background, Cinematic, Film, Romantic, Uplifting…
- Comprobación cruzada: el ID de Freesound del nombre del fichero (560599) coincide con el del certificado. La duración real del fichero (65,7116 s, medida con ffprobe) también coincide con la del certificado.

## Tratamiento en el vídeo

- Copia recortada: de 0,9 s a 39,4 s del original. El primer segundo es silencio.
- Ganancia lineal de +5,8 dB (pico −1,7 dBFS), sin compresión ni limitador.
- Guardada en WAV PCM de 16 bits a 44,1 kHz.
- En Remotion (`src/Promo.tsx`) se reproduce con `volume` 0,5, con un fundido de entrada de 1,5 s y uno de salida de 3 s al final.

## Pistas descartadas

- **SS-AUD-0001 a SS-AUD-0029** (pianos y ambientes musicales): el `certificate.json` de cada carpeta no corresponde al fichero que contiene. El ID de Freesound y la duración no coinciden; por ejemplo, SS-AUD-0017 certifica 755823 con 99,3 s, pero el fichero es 616830 y dura 40,1 s. Esos certificados no sirven como prueba de licencia. Las copias corregidas están en SS-AUD-0233 a SS-AUD-0260, y de ahí sale la pista elegida.
- **propias_2026-09** (certificados en `certificados_propias`): son pistas generadas con Suno (V5_5, a través de kie.ai). El certificado no incluye ningún campo de licencia, así que no se han usado.
