export interface Layer {
  id: number;
  name: string;
  extent?: number[];
}

export interface Basemap {
  name: string;
  basemap: 'osm' | 'satellite';
}

export interface ProjectLayer {
  id: number;
  layerId?: number;
  name: string;
  layer: Layer;
  extent?: number[];
  style?: any;
  basemap?: 'osm' | 'satellite';
  getStyle: () => any;
  getProperties: () => any;
}
