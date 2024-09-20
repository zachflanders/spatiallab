export type Layer = {
  id: number;
  name: string;
  directory: number;
};

export type Directory = {
  id: number;
  name: string;
  layers: Layer[];
  subdirectories: Directory[];
  parent?: string;
};
