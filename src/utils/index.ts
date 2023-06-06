export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Marker {
  id: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  color: Color;
  name?: string;
}

export interface MarkersMap {
  [key: string]: Marker;
}

export function getRandomRgb() {
  const random = Math.random() * (1 - 0.6) + 0.6;
  const num = Math.round(0xffffff * random);
  const r = num >> 16;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return {
    r,
    g,
    b,
  };
}
