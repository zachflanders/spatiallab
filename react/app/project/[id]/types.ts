export interface Layer {
  id: number;
  name: string;
  extent?: number[];
}

export interface ProjectLayer {
  id: number;
  layerId: number;
  name: string;
  layer: Layer;
  extent?: number[];
}
