import { resolve, sep } from "node:path";

export function isWithinBase(base: string, target: string): boolean {
  const normalizedBase = resolve(base) + sep;
  return resolve(target).startsWith(normalizedBase);
}
