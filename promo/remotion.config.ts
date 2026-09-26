import {Config} from '@remotion/cli/config';

// Fotogramas intermedios en JPEG de alta calidad (por defecto 80) para no
// degradar los renders antes de la compresión H.264.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
