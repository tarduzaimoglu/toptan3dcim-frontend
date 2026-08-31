import {
  BASE_COLORS, BOTTOM_LAYERS, CAL_K, COLOR_UPCHARGE_FACTOR, FLOW,
  INFILL_EFF, LAYER_H_MM, MATERIALS, MIN_TOTAL_TRY, NOZZLE_MM,
  TOP_LAYERS, WALLS, type MaterialKey,
} from "./constants";

export type Metrics = { volumeMM3: number; saMM2: number; sahMM2: number };

export function calcPricing(input: {
  metrics: Metrics | null;
  material: MaterialKey;
  colorHex: string;
  infillPct: number;
  qty: number;
}) {
  const { metrics, material, colorHex, infillPct, qty } = input;
  const { density, gramPrice } = MATERIALS[material];
  const colorFactorApplied = !BASE_COLORS.has(colorHex.toLowerCase());

  if (!metrics) {
    return { weightG: 0, finalTotalTRY: 0, gramPriceUsed: gramPrice, colorFactorApplied, minimumApplied: false };
  }

  const solidCm3 = metrics.volumeMM3 / 1000;
  const surfaceCm2 = metrics.saMM2 / 100;
  const horizontalCm2 = metrics.sahMM2 / 100;
  const wallThicknessCm = (WALLS * NOZZLE_MM * 0.92) / 10;
  const topBottomCm3 = horizontalCm2 * (TOP_LAYERS + BOTTOM_LAYERS) * (LAYER_H_MM / 10);
  const sideCm2 = Math.max(0, surfaceCm2 - horizontalCm2);
  const wallCm3 = Math.min(sideCm2 * wallThicknessCm, solidCm3 * 0.35);
  const coreCm3 = Math.max(0, solidCm3 - topBottomCm3 - wallCm3);
  const infillCm3 = coreCm3 * (infillPct / 100) * INFILL_EFF;
  const weightG = (topBottomCm3 + wallCm3 + infillCm3) * FLOW * CAL_K * density;
  const total = weightG * gramPrice * (colorFactorApplied ? COLOR_UPCHARGE_FACTOR : 1) * qty;
  const minimumApplied = total > 0 && total < MIN_TOTAL_TRY;

  return {
    weightG,
    finalTotalTRY: minimumApplied ? MIN_TOTAL_TRY : total,
    gramPriceUsed: gramPrice,
    colorFactorApplied,
    minimumApplied,
  };
}
