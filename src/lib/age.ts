/** Whole years from an ISO `yyyy-mm-dd` birth date to `asOf` (UTC, no tz drift). */
export function ageInYears(birthDate: string, asOf: Date): number {
  const b = new Date(`${birthDate}T00:00:00Z`);
  let age = asOf.getUTCFullYear() - b.getUTCFullYear();
  const monthDelta = asOf.getUTCMonth() - b.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && asOf.getUTCDate() < b.getUTCDate())) {
    age--;
  }
  return age;
}
