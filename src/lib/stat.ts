export interface ParsedStat {
  prefix: string;
  number: number;
  decimals: number;
  suffix: string;
  grouping: boolean;
}

/** Split a display stat like "+267%", "6M+" or "687,370" into its animatable parts. */
export function parseStat(value: string): ParsedStat | null {
  const match = /^([+\-]?)([\d,]+(?:\.\d+)?)(.*)$/.exec(value.trim());
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const decimals = digits.includes('.') ? digits.split('.')[1].length : 0;
  return {
    prefix,
    number: Number(digits.replaceAll(',', '')),
    decimals,
    suffix,
    grouping: digits.includes(','),
  };
}
