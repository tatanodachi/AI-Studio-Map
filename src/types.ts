export interface Region {
  id: string;
  name: string;
  query: string;
  group: string;
  population: number;
  density: number;
  income: number;
  commuter: number;
  medianAge: number;
  maleDistribution?: number[];
  femaleDistribution?: number[];
  defaultOff?: boolean;
}

export interface POI {
  id: string;
  name: string;
  desc: string;
  lat: number;
  lon: number;
  color: string;
  radii?: number[];
}

export type ViewMode = 'admin' | 'population' | 'density' | 'economy' | 'commuter' | 'age';
