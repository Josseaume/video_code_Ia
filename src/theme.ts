import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const anton = loadAnton('normal', {weights: ['400'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['500'], subsets: ['latin']});

export const COLORS = {
  bg: '#0B0B10',
  ink: '#F4EFE6',
  orange: '#FF5B2E',
  violet: '#7B5CFF',
  cyan: '#2DE2C5',
  yellow: '#FFD23F',
};

export const FONTS = {
  display: anton.fontFamily,
  mono: mono.fontFamily,
};

export const W = 1920;
export const H = 1080;

// Options réutilisées partout : on bloque les valeurs aux bornes de l'intervalle.
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
