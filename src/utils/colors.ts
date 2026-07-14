import { Color, ThemeName } from '../types';

const liquidColorMap: Record<ThemeName, Record<Color, string>> = {
  Classic: {
    [Color.Red]: '#E53E3E',
    [Color.Blue]: '#3182CE',
    [Color.Green]: '#38A169',
    [Color.Yellow]: '#ECC94B',
    [Color.Purple]: '#805AD5',
    [Color.Orange]: '#DD6B20',
    [Color.Cyan]: '#00B5D8',
    [Color.Pink]: '#D53F8C',
  },
  Neon: {
    [Color.Red]: '#FF0055',
    [Color.Blue]: '#00BFFF',
    [Color.Green]: '#00FF7F',
    [Color.Yellow]: '#FFD700',
    [Color.Purple]: '#AA00FF',
    [Color.Orange]: '#FF6600',
    [Color.Cyan]: '#00FFFF',
    [Color.Pink]: '#FF1493',
  },
  Dark: {
    [Color.Red]: '#CC3333',
    [Color.Blue]: '#3366CC',
    [Color.Green]: '#33CC66',
    [Color.Yellow]: '#CCAA33',
    [Color.Purple]: '#8833CC',
    [Color.Orange]: '#CC6633',
    [Color.Cyan]: '#33CCCC',
    [Color.Pink]: '#CC3377',
  },
  Candy: {
    [Color.Red]: '#FF6B6B',
    [Color.Blue]: '#4ECDC4',
    [Color.Green]: '#95E1D3',
    [Color.Yellow]: '#FFE066',
    [Color.Purple]: '#DDA0DD',
    [Color.Orange]: '#FFB347',
    [Color.Cyan]: '#80DEEA',
    [Color.Pink]: '#FFB6C1',
  },
};

export function getLiquidColor(color: Color, theme: ThemeName): string {
  return liquidColorMap[theme][color];
}
