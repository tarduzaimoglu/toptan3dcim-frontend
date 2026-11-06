export const STANDARD_COLORS = [
  { id: 'black', label: 'Siyah', hex: '#111111' },
  { id: 'white', label: 'Beyaz', hex: '#FFFFFF' },
  { id: 'grey', label: 'Gri', hex: '#808080' },
  { id: 'red', label: 'Kırmızı', hex: '#FF0000' },
  { id: 'blue', label: 'Mavi', hex: '#0000FF' },
  { id: 'green', label: 'Yeşil', hex: '#008000' },
  { id: 'yellow', label: 'Sarı', hex: '#FFFF00' },
  { id: 'orange', label: 'Turuncu', hex: '#FFA500' },
  { id: 'purple', label: 'Mor', hex: '#800080' },
  { id: 'pink', label: 'Pembe', hex: '#FFC0CB' },
];

export function getClosestStandardColor(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return STANDARD_COLORS[0];
  const r = parseInt(result[1], 16), g = parseInt(result[2], 16), b = parseInt(result[3], 16);

  let minDistance = Infinity;
  let closest = STANDARD_COLORS[0];

  for (const std of STANDARD_COLORS) {
    const stdRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(std.hex)!;
    const distance = Math.sqrt(
      Math.pow(r - parseInt(stdRgb[1], 16), 2) + Math.pow(g - parseInt(stdRgb[2], 16), 2) + Math.pow(b - parseInt(stdRgb[3], 16), 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = std;
    }
  }
  return closest;
}

