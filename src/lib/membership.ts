import type { MembershipStatus } from "@/db/membership.schema";
import { MEMBERSHIP_STATUS } from "@/db/membership.schema";

export type MembershipLike = {
  status: MembershipStatus;
  validUntil: Date | null;
  revokedAt: Date | null;
};

export function isActiveMembership(m: MembershipLike | null | undefined): boolean {
  if (!m) return false;
  if (m.status !== MEMBERSHIP_STATUS.ACTIVE) return false;
  if (m.revokedAt) return false;
  if (!m.validUntil) return true;
  return m.validUntil.getTime() > Date.now();
}

