export { cn } from "cn";

/**
 * Convert any user input into a clean string array.
 * Handles:
 *   - null / undefined        → []
 *   - ""                      → []
 *   - "a, b, c"               → ["a","b","c"]
 *   - ["a","", "b"]           → ["a","b"]
 *   - "single value"          → ["single value"]
 *   - number / boolean        → [String(value)]
 */
export function toStringArray(value) {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [String(value)];
}

/**
 * Convert a string array (or a string) into a comma-separated display string.
 * Used when filling a text input from a List<String>.
 */
export function toCsv(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}