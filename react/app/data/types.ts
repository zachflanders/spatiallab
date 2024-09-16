export type Layer = {
  id: string;
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
