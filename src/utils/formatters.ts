/**
 * Formatters for CarbonWise AI UI display
 */

/**
 * Formats carbon values into kg CO2e or metric tons CO2e
 * @param kg Value in kilograms
 * @param decimals Decimal places
 */
export function formatCarbon(kg: number, decimals: number = 0): string {
  if (kg >= 1000) {
    const tons = kg / 1000;
    return `${tons.toLocaleString(undefined, {
      minimumFractionDigits: decimals === 0 ? 1 : decimals,
      maximumFractionDigits: decimals === 0 ? 2 : decimals,
    })} t CO₂e`;
  }
  return `${Math.round(kg).toLocaleString()} kg CO₂e`;
}

/**
 * Formats numbers as percentages
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Formats standard ISO dates to clean readable displays
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}
