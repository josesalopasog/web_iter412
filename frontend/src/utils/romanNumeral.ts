const ROMAN_NUMERALS: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** 16 → "XVI". Para el número del retiro, que en la página siempre va en romanos. */
export const toRoman = (value: number): string => {
  let n = Math.floor(value);
  if (!Number.isFinite(n) || n < 1) return "";
  let result = "";
  for (const [num, symbol] of ROMAN_NUMERALS) {
    while (n >= num) {
      result += symbol;
      n -= num;
    }
  }
  return result;
};
