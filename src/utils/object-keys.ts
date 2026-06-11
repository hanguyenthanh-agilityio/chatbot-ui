/** Typed `Object.keys` — keys are inferred from the object shape. */
export function objectKeys<T extends Record<string, unknown>>(
  value: T,
): (keyof T & string)[] {
  return Object.keys(value) as (keyof T & string)[];
}
