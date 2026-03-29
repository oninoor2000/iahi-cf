/**
 * @description The theme mode values
 * @returns The theme mode values ["light", "dark", "system"]
 */
export const THEME_MODE_VALUES = ["light", "dark", "system"] as const;

/**
 * @description The theme mode type
 * @returns The theme mode type ["light", "dark", "system"]
 */
export type THEME_MODE_TYPE = (typeof THEME_MODE_VALUES)[number];
