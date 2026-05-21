import { Region, POI } from './types';

export const targetRegions: Region[] = [
  { 
      id: "jp", name: "Central Jakarta", query: "Jakarta Pusat, Indonesia", group: "DKI Jakarta", population: 1057270, density: 21831, income: 949, commuter: 75, medianAge: 31,
      maleDistribution: [17168, 38731, 68126, 83155, 80006, 83945, 84168, 75379],
      femaleDistribution: [24877, 42137, 68132, 83496, 78477, 79872, 79045, 70556]
  },
  { 
      id: "ju", name: "North Jakarta", query: "Jakarta Utara, Indonesia", group: "DKI Jakarta", population: 1819030, density: 12378, income: 392, commuter: 42, medianAge: 29,
      maleDistribution: [30520, 65710, 109660, 143670, 146670, 138460, 142690, 138500],
      femaleDistribution: [36880, 69780, 108990, 142570, 143090, 134470, 134780, 132590]
  },
  { 
      id: "js", name: "South Jakarta", query: "Jakarta Selatan, Indonesia", group: "DKI Jakarta", population: 2323644, density: 15233, income: 409, commuter: 65, medianAge: 32,
      maleDistribution: [36807, 80261, 152503, 186120, 169619, 184051, 193763, 156247],
      femaleDistribution: [46476, 87743, 151723, 193696, 177339, 177831, 182959, 146506]
  },
  { 
      id: "jb", name: "West Jakarta", query: "Jakarta Barat, Indonesia", group: "DKI Jakarta", population: 2525856, density: 19953, income: 269, commuter: 58, medianAge: 30,
      maleDistribution: [39097, 83101, 153808, 212416, 195279, 193913, 208734, 184228],
      femaleDistribution: [50108, 89782, 149586, 212272, 198009, 186988, 196935, 171600]
  },
  { 
      id: "jt", name: "East Jakarta", query: "Jakarta Timur, Indonesia", group: "DKI Jakarta", population: 3085080, density: 16622, income: 218, commuter: 62, defaultOff: true, medianAge: 31,
      maleDistribution: [53220, 118690, 193380, 234910, 236790, 240090, 240200, 227370],
      femaleDistribution: [61860, 126040, 197920, 237040, 240000, 232680, 227530, 217360]
  },
  { 
      id: "ts", name: "South Tangerang", query: "Tangerang Selatan, Indonesia", group: "Banten", population: 1474311, density: 8523, income: 85, commuter: 68, defaultOff: true, medianAge: 28,
      maleDistribution: [23110, 53271, 91933, 115210, 116558, 117233, 118647, 97991],
      femaleDistribution: [23312, 53735, 92736, 116215, 117576, 118256, 119682, 98846]
  },
  { 
      id: "tg", name: "Tangerang City", query: "Kota Tangerang, Indonesia", group: "Banten", population: 1977376, density: 11098, income: 122, commuter: 48, medianAge: 29,
      maleDistribution: [26327, 61212, 113756, 158145, 157844, 154782, 165449, 154659],
      femaleDistribution: [29313, 66524, 116233, 162857, 158728, 152113, 154832, 144602]
  },
  { 
      id: "tgr", name: "Tangerang Regency", query: "Kabupaten Tangerang, Indonesia", group: "Banten", population: 3516095, density: 3373, income: 58, commuter: 32, defaultOff: true, medianAge: 27,
      maleDistribution: [44270, 99883, 200007, 269109, 302360, 290100, 308035, 275297],
      femaleDistribution: [46153, 95069, 195181, 274740, 290369, 281738, 289501, 254283]
  },
  { 
      id: "bg", name: "Bogor City", query: "Kota Bogor, Indonesia", group: "West Java", population: 1093570, density: 9780, income: 60, commuter: 38, defaultOff: true, medianAge: 29,
      maleDistribution: [19937, 40500, 64762, 80027, 87200, 87104, 86604, 82195],
      femaleDistribution: [23805, 42287, 64596, 77713, 83727, 83069, 81460, 78790]
  },
  { 
      id: "bgr", name: "Bogor Regency", query: "Kabupaten Bogor, Indonesia", group: "West Java", population: 5721618, density: 1926, income: 58, commuter: 24, defaultOff: true, medianAge: 26,
      maleDistribution: [79039, 184133, 323695, 426942, 497127, 485176, 471092, 463359],
      femaleDistribution: [84314, 176874, 308936, 406179, 471528, 454921, 444784, 443519]
  },
  { 
      id: "dp", name: "Depok City", query: "Kota Depok, Indonesia", group: "West Java", population: 2167911, density: 10871, income: 46, commuter: 67, defaultOff: true, medianAge: 29,
      maleDistribution: [33125, 76331, 135659, 171467, 169525, 161517, 172442, 169764],
      femaleDistribution: [39987, 80894, 133575, 169060, 173490, 155033, 163947, 162095]
  },
  { 
      id: "bk", name: "Bekasi City", query: "Kota Bekasi, Indonesia", group: "West Java", population: 2646272, density: 12453, income: 52, commuter: 60, defaultOff: true, medianAge: 28,
      maleDistribution: [43170, 101772, 156173, 202246, 221040, 201993, 201968, 200350],
      femaleDistribution: [45344, 107112, 161831, 202956, 222691, 193598, 192559, 191469]
  }
];

export const ageCohorts: string[] = ["70+", "60-69", "50-59", "40-49", "30-39", "20-29", "10-19", "0-9"];

export const locations: POI[] = [
  { id: "pik", name: "Pantai Indah Kapuk", desc: "Premium coastal district", lat: -6.1112, lon: 106.7404, color: "#4C4A4B" },
  { id: "dm", name: "Daan Mogot", desc: "Industrial transit hub", lat: -6.1543, lon: 106.7398, color: "#1C6048", radii: [5000, 10000] },
  { id: "monas", name: "TB Simatupang", desc: "South Jakarta", lat: -6.293221949027879, lon: 106.81898208001107, color: "#1E2f31" }
];
