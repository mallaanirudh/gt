// Exactly 45 authorized roll numbers:
// 1. 241AI001 through 241AI044 (44 roll numbers)
// 2. 231AI007 (1 roll number)

export const AUTHORIZED_ROLL_NUMBERS = new Set<string>([
  '231AI007',
  ...Array.from({ length: 44 }, (_, i) => {
    const num = String(i + 1).padStart(3, '0');
    return `241AI${num}`;
  }),
]);

export const MIN_VOTE_VALUE = 50;
export const MAX_VOTE_VALUE = 85;

/**
 * Standardizes roll number: uppercase and trimmed.
 * Ensures case-insensitive comparison and storage.
 */
export function normalizeRollNumber(rollNumber: string): string {
  return rollNumber.toUpperCase().trim();
}

/**
 * Checks whether the normalized roll number is authorized.
 */
export function isAuthorizedRollNumber(normalizedRollNumber: string): boolean {
  return AUTHORIZED_ROLL_NUMBERS.has(normalizedRollNumber);
}
