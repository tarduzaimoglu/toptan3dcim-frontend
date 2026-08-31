export const MAX_FILE_MB = 50;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
export const MIN_TOTAL_TRY = 200;

export const CAL_K = 0.61;
export const FLOW = 1.06;
export const INFILL_EFF = 1;
export const NOZZLE_MM = 0.4;
export const LAYER_H_MM = 0.2;
export const WALLS = 2;
export const TOP_LAYERS = 5;
export const BOTTOM_LAYERS = 5;
export const COLOR_UPCHARGE_FACTOR = 1.1;
export const BASE_COLORS = new Set(["#000000", "#ffffff"]);

export const MATERIALS = {
  PLA: { density: 1.24, gramPrice: 5 },
  ABS: { density: 1.04, gramPrice: 5.5 },
  PETG: { density: 1.27, gramPrice: 6 },
  ASA: { density: 1.07, gramPrice: 6.5 },
} as const;

export type MaterialKey = keyof typeof MATERIALS;
