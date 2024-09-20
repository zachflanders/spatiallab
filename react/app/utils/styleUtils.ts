import { Style, Fill, Stroke } from 'ol/style';

export const applyStyleToLayer = (layer: any, styleOptions: StyleOptions) => {
  const { fillColor, strokeColor, lineWidth } = styleOptions;

  const newStyle = new Style({
    fill: new Fill({
      color: fillColor,
    }),
    stroke: new Stroke({
      color: strokeColor,
      width: lineWidth,
    }),
  });

  layer.setStyle(newStyle);
  return layer;
};

export interface StyleOptions {
  fillColor: string;
  strokeColor: string;
  lineWidth: number;
}
