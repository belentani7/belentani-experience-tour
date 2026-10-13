/** Join optional class names used by the card and sidebar components. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}
