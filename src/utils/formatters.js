/**
 * Formats a raw population number into standard comma-separated string format.
 * Example: 83240525 -> "83,240,525"
 */
export function formatPopulation(population) {
  if (population === undefined || population === null) return 'N/A';
  return new Intl.NumberFormat('en-US').format(population);
}
