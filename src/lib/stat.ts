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

/** Format a number back into the shape parseStat read it from. */
export function formatStat(stat: ParsedStat, n: number): string {
  const body = n.toLocaleString('en-US', {
    minimumFractionDigits: stat.decimals,
    maximumFractionDigits: stat.decimals,
    useGrouping: stat.grouping,
  });
  return `${stat.prefix}${body}${stat.suffix}`;
}
