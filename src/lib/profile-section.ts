export const PROFILE_SECTIONS = [
  "personal",
  "contact",
  "social-links",
  "preferences",
  "security",
  "membership",
] as const;

export type ProfileSection = (typeof PROFILE_SECTIONS)[number];

export const DEFAULT_PROFILE_SECTION: ProfileSection = "personal";

export function parseProfileSection(raw: unknown): ProfileSection {
  if (
    typeof raw === "string" &&
    (PROFILE_SECTIONS as readonly string[]).includes(raw)
  ) {
    return raw as ProfileSection;
  }
  return DEFAULT_PROFILE_SECTION;
}
