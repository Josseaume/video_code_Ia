import {loadFont} from '@remotion/google-fonts/Montserrat';

const montserrat = loadFont('normal', {weights: ['300', '400', '600', '800'], subsets: ['latin', 'latin-ext']});

// Palette "institutionnelle rurale" : fond blanc, verts, orange, bleu canard, bordeaux.
export const K = {
  white: '#FFFFFF',
  lime: '#9CC31C',
  green: '#1F9A43',
  orange: '#E3900F',
  teal: '#3BA5BF',
  burgundy: '#852245',
  rust: '#8E3B26',
  text: '#3A3A3A',
  line: '#9FB48C',
};

export const FONT = montserrat.fontFamily;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type Weight = 300 | 400 | 600 | 800;

// Une ligne de texte stylée, réutilisée par la plupart des composants.
export type TextLine = {
  text: string;
  weight?: Weight;
  color?: string;
  size?: number;
};
