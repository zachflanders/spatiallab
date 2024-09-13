import { Style, Fill, Stroke } from 'ol/style';

export const applyStyleToLayer = (layer: any, styleOptions: StyleOptions) => {
  const { fillColor, strokeColor, lineWidth, fillOpacity, strokeOpacity } =
    styleOptions;

  const newStyle = new Style({
    fill: new Fill({
      color: `rgba(${hexToRgb(fillColor)}, ${fillOpacity})`,
    }),
    stroke: new Stroke({
      color: `rgba(${hexToRgb(strokeColor)}, ${strokeOpacity})`,
      width: lineWidth,
    }),
  });

  layer.setStyle(newStyle);
};

// Helper function to convert hex color to rgb
export function hexToRgb(hex: string): string {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

export interface StyleOptions {
  fillColor: string;
  strokeColor: string;
  lineWidth: number;
  fillOpacity: number;
  strokeOpacity: number;
}
