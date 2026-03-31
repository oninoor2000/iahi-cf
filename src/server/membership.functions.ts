import { membership as membershipTable } from "@/db/membership.schema";
import { getDb } from "@/db";
import { auth } from "@/lib/auth";
import { isActiveMembership } from "@/lib/membership";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { desc, eq } from "drizzle-orm";
import type { MembershipStatus } from "@/db/membership.schema";

export type MyMembership = null | {
  id: string;
  status: MembershipStatus;
  validFrom: string | null;
  validUntil: string | null;
  memberNumber: string | null;
  cardVersion: number;
  revokedAt: string | null;
  appliedAt: string;
};

export const getMyMembershipFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ membership: MyMembership; isActive: boolean }> => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const db = getDb();
    const [row] = await db
      .select({
        id: membershipTable.id,
        status: membershipTable.status,
        validFrom: membershipTable.validFrom,
        validUntil: membershipTable.validUntil,
        memberNumber: membershipTable.memberNumber,
        cardVersion: membershipTable.cardVersion,
        revokedAt: membershipTable.revokedAt,
        appliedAt: membershipTable.appliedAt,
      })
      .from(membershipTable)
      .where(eq(membershipTable.userId, userId))
      .orderBy(desc(membershipTable.appliedAt))
      .limit(1);

    if (!row) {
      return { membership: null, isActive: false };
    }

    const membership = {
      ...row,
      validFrom: row.validFrom ? new Date(row.validFrom).toISOString() : null,
      validUntil: row.validUntil ? new Date(row.validUntil).toISOString() : null,
      revokedAt: row.revokedAt ? new Date(row.revokedAt).toISOString() : null,
      appliedAt: new Date(row.appliedAt).toISOString(),
    } satisfies NonNullable<MyMembership>;

    const active = isActiveMembership({
      status: membership.status,
      validUntil: membership.validUntil ? new Date(membership.validUntil) : null,
      revokedAt: membership.revokedAt ? new Date(membership.revokedAt) : null,
    });

    return { membership, isActive: active };
  },
);

