import { ThemeName } from '../types';

export interface ThemeColors {
  tubeBorder: string;
  tubeGlass: string;
  tubeShadow: string;
  liquidColors: Record<string, string>;
  background: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  card: string;
  accent: string;
  success: string;
  surface: string;
}

const classic: ThemeColors = {
  tubeBorder: '#B0D4F1',
  tubeGlass: '#FFFFFF',
  tubeShadow: 'rgba(0,0,0,0.08)',
  liquidColors: {
    R: '#FF4444',
    B: '#4488FF',
    G: '#44CC44',
    Y: '#FFDD44',
    P: '#AA66FF',
    O: '#FF8844',
    C: '#44DDDD',
    I: '#FF88CC',
  },
  background: '#E6F4FE',
  primary: '#4488FF',
  secondary: '#FF8844',
  text: '#1A1A1A',
  textSecondary: '#666666',
  card: '#FFFFFF',
  accent: '#AA66FF',
  success: '#44CC44',
  surface: '#F0F8FF',
};

const neon: ThemeColors = {
  tubeBorder: '#3333AA',
  tubeGlass: '#1A1A4E',
  tubeShadow: 'rgba(0,0,0,0.4)',
  liquidColors: {
    R: '#FF0044',
    B: '#00D4FF',
    G: '#00FF88',
    Y: '#FFEE00',
    P: '#FF00FF',
    O: '#FF6600',
    C: '#00FFFF',
    I: '#FF66B2',
  },
  background: '#0D0D2B',
  primary: '#00D4FF',
  secondary: '#FF00FF',
  text: '#FFFFFF',
  textSecondary: '#8888BB',
  card: '#1A1A4E',
  accent: '#00FF88',
  success: '#00FF88',
  surface: '#12123A',
};

const dark: ThemeColors = {
  tubeBorder: '#444444',
  tubeGlass: '#2D2D2D',
  tubeShadow: 'rgba(0,0,0,0.5)',
  liquidColors: {
    R: '#CC5555',
    B: '#5577CC',
    G: '#55AA55',
    Y: '#CCAA33',
    P: '#9966CC',
    O: '#CC7733',
    C: '#44AAAA',
    I: '#CC77AA',
  },
  background: '#1A1A1A',
  primary: '#5577CC',
  secondary: '#CC7733',
  text: '#FFFFFF',
  textSecondary: '#888888',
  card: '#2D2D2D',
  accent: '#9966CC',
  success: '#55AA55',
  surface: '#222222',
};

const candy: ThemeColors = {
  tubeBorder: '#FFD6E0',
  tubeGlass: '#FFFFFF',
  tubeShadow: 'rgba(255,150,180,0.15)',
  liquidColors: {
    R: '#FF6B6B',
    B: '#6BA3FF',
    G: '#6BCC6B',
    Y: '#FFE66B',
    P: '#C96BC9',
    O: '#FF9F6B',
    C: '#6BCCCC',
    I: '#FF9FC9',
  },
  background: '#FFF0F5',
  primary: '#FF6B9D',
  secondary: '#C96BC9',
  text: '#4A2D3A',
  textSecondary: '#998899',
  card: '#FFFFFF',
  accent: '#FF9FC9',
  success: '#6BCC6B',
  surface: '#FFF5F8',
};

const themes: Record<ThemeName, ThemeColors> = {
  Classic: classic,
  Neon: neon,
  Dark: dark,
  Candy: candy,
};

export function getTheme(name: ThemeName): ThemeColors {
  return themes[name];
}
