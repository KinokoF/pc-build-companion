import { SortDirection } from "../models/config.model.js";
import { CONVERSION_TO_MB, EN_US_NUMBER_PARSER } from "./constants.js";

export function normalizeSize(label: string): number {
  const [num, unit] = label.split(" ");

  return EN_US_NUMBER_PARSER.parse(num) * (CONVERSION_TO_MB as any)[unit];
}

export function extractYear(date: string): number {
  return +date.split(" ")[1];
}

function compare(a: any, b: any): number {
  return typeof a === "string" ? a.localeCompare(b) : a - b;
}

export function getCompareFn<T>(by?: keyof T, direction?: SortDirection): (a: T, b: T) => number {
  return (a, b) => by
    ? (direction !== "desc" ? compare(a[by], b[by]) : compare(b[by], a[by]))
    : 1;
}
