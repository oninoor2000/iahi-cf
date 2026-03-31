import {
  MEMBERSHIP_STATUS,
  PAYMENT_PROOF_STATUS,
  membership as membershipTable,
  membershipPayment as membershipPaymentTable,
} from "@/db/membership.schema";
import { getDb } from "@/db";
import { user as userTable } from "@/db/auth.schema";
import { auth } from "@/lib/auth";
import { isActiveMembership } from "@/lib/membership";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { desc, eq } from "drizzle-orm";
import type { MembershipStatus } from "@/db/membership.schema";
import { getInfrequentR2Binding } from "@/server/env.server";
import { INDONESIA_PROVINCES } from "@/lib/indonesia-provinces";
import { z } from "zod";

export type MembershipApplicantFields = {
  profession: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  institutionName: string | null;
  institutionType: string | null;
  contactPerson: string | null;
};

export type MyMembership = null | {
  id: string;
  status: MembershipStatus;
  validFrom: string | null;
  validUntil: string | null;
  memberNumber: string | null;
  cardVersion: number;
  revokedAt: string | null;
  appliedAt: string;
  rejectionReason: string | null;
  verifyToken?: string;
  verifyUrl?: string;
} & MembershipApplicantFields;

const membershipApplicantInputSchema = z.object({
  profession: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  address: z.string().trim().min(1).max(2000),
  province: z.enum(INDONESIA_PROVINCES),
  institutionName: z.string().trim().min(1).max(200),
  institutionType: z.enum(["individu", "institusi"]),
  contactPerson: z.string().trim().min(1).max(200),
});
export type MembershipApplicantInput = z.infer<typeof membershipApplicantInputSchema>;

export type MembershipJoinGuide = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  currency: "IDR";
  transferMethods: readonly string[];
  uploadChecklist: readonly string[];
};

type SessionUser = {
  id: string;
  role?: string;
  emailVerified: boolean;
};

async function requireSessionUser(): Promise<SessionUser> {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  const sessionUser = session?.user as
    | { id?: string; role?: string; emailVerified?: boolean }
    | undefined;
  const userId = sessionUser?.id;
  if (!userId) throw new Error("Unauthorized");
  return {
    id: userId,
    role: sessionUser?.role,
    emailVerified: Boolean(sessionUser?.emailVerified),
  };
}

async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (user.role !== "administrator") throw new Error("Forbidden");
  return user;
}

async function requireVerifiedUser(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!user.emailVerified) {
    throw new Error("Please verify your email before joining membership.");
  }
  return user;
}

function base64UrlEncode(value: Uint8Array): string {
  const str = btoa(String.fromCharCode(...value));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + pad);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function signPayload(payload: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET ?? "iahi-dev-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(sig));
}

async function makeMembershipToken(payload: Record<string, unknown>): Promise<string> {
  const payloadJson = JSON.stringify(payload);
  const payloadPart = base64UrlEncode(new TextEncoder().encode(payloadJson));
  const sig = await signPayload(payloadPart);
  return `${payloadPart}.${sig}`;
}

async function verifyMembershipToken(token: string): Promise<Record<string, unknown> | null> {
  const [payloadPart, sig] = token.split(".");
  if (!payloadPart || !sig) return null;
  const expected = await signPayload(payloadPart);
  if (expected !== sig) return null;
  const payloadBytes = base64UrlDecode(payloadPart);
  const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as Record<
    string,
    unknown
  >;
  return payload;
}

function generateMemberNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const rand = Math.floor(100000 + Math.random() * 900000).toString();
  return `IAHI-${yyyy}-${rand}`;
}

const MEMBERSHIP_FEE = {
  amount: 250000,
  currency: "IDR",
} as const;

const MEMBERSHIP_JOIN_GUIDE: MembershipJoinGuide = {
  accountName: "IAHI Organisasi",
  bankName: "Bank BCA",
  accountNumber: "1234567890",
  amount: MEMBERSHIP_FEE.amount,
  currency: MEMBERSHIP_FEE.currency,
  transferMethods: [
    "ATM: Open bank transfer, enter destination account number, then confirm the exact amount.",
    "Mobile Banking: Open transfer menu, select destination bank, enter account number and amount, then save the transaction proof.",
    "SMS Banking: Use your bank transfer SMS format, confirm the amount, and keep the transaction notification.",
  ],
  uploadChecklist: [
    "A clear photo/screenshot of the transfer proof.",
    "Sender name or transaction reference is visible.",
    "Transfer date and amount are visible.",
  ],
};

export const getMembershipJoinGuideFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ guide: MembershipJoinGuide }> => ({ guide: MEMBERSHIP_JOIN_GUIDE }),
);

export const createMembershipApplicationFn = createServerFn({ method: "POST" })
  .inputValidator(membershipApplicantInputSchema)
  .handler(async ({ data }) => {
    const user = await requireVerifiedUser();
    const db = getDb();

    const [existing] = await db
      .select({
        id: membershipTable.id,
        status: membershipTable.status,
      })
      .from(membershipTable)
      .where(eq(membershipTable.userId, user.id))
      .orderBy(desc(membershipTable.appliedAt))
      .limit(1);

    if (existing && existing.status !== MEMBERSHIP_STATUS.REJECTED) {
      return { membershipId: existing.id, reused: true };
    }

    const membershipId = crypto.randomUUID();
    await db.insert(membershipTable).values({
      id: membershipId,
      userId: user.id,
      tierId: null,
      status: MEMBERSHIP_STATUS.PENDING_PAYMENT,
      appliedAt: new Date(),
      profession: data.profession,
      phone: data.phone,
      address: data.address,
      province: data.province,
      institutionName: data.institutionName,
      institutionType: data.institutionType,
      contactPerson: data.contactPerson,
    });

    return { membershipId, reused: false };
  });

export const uploadMembershipProofFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const membershipId = data.get("membershipId");
    const file = data.get("file");
    const payerNote = data.get("payerNote");
    if (typeof membershipId !== "string" || !membershipId) {
      throw new Error("Missing membershipId");
    }
    if (!(file instanceof File)) throw new Error('Missing field "file"');
    return { membershipId, file, payerNote: typeof payerNote === "string" ? payerNote : null };
  })
  .handler(async ({ data }) => {
    const user = await requireVerifiedUser();
    const db = getDb();
    const [membership] = await db
      .select({
        id: membershipTable.id,
        userId: membershipTable.userId,
      })
      .from(membershipTable)
      .where(eq(membershipTable.id, data.membershipId))
      .limit(1);
    if (!membership || membership.userId !== user.id) throw new Error("Membership not found");

    const file = data.file;
    if (file.size <= 0) throw new Error("Empty file");
    if (file.size > 5 * 1024 * 1024) throw new Error("Max 5MB");
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const key = `membership-proofs/${membership.id}/${Date.now()}.${ext}`;
    await getInfrequentR2Binding().put(key, new Uint8Array(await file.arrayBuffer()), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
      customMetadata: { membershipId: membership.id, userId: user.id },
    });

    await db.insert(membershipPaymentTable).values({
      id: crypto.randomUUID(),
      membershipId: membership.id,
      amount: MEMBERSHIP_FEE.amount,
      currency: MEMBERSHIP_FEE.currency,
      proofObjectKey: key,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      payerNote: data.payerNote,
      status: PAYMENT_PROOF_STATUS.PENDING,
      submittedAt: new Date(),
    });

    await db
      .update(membershipTable)
      .set({ status: MEMBERSHIP_STATUS.PENDING_REVIEW })
      .where(eq(membershipTable.id, membership.id));

    return { ok: true };
  });

type PendingReviewItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  appliedAt: Date;
  profession: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  institutionName: string | null;
  institutionType: string | null;
  contactPerson: string | null;
  payment: null | {
    id: string;
    proofObjectKey: string | null;
    originalFilename: string | null;
    submittedAt: Date;
    status: string;
    proofUrl: string | null;
  };
};

export const listPendingMembershipReviewsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ items: PendingReviewItem[] }> => {
    await requireAdminUser();
    const db = getDb();
    const memberships = await db
      .select({
        id: membershipTable.id,
        userId: membershipTable.userId,
        status: membershipTable.status,
        appliedAt: membershipTable.appliedAt,
        profession: membershipTable.profession,
        phone: membershipTable.phone,
        address: membershipTable.address,
        province: membershipTable.province,
        institutionName: membershipTable.institutionName,
        institutionType: membershipTable.institutionType,
        contactPerson: membershipTable.contactPerson,
        userName: userTable.name,
        userEmail: userTable.email,
      })
      .from(membershipTable)
      .innerJoin(userTable, eq(userTable.id, membershipTable.userId))
      .where(eq(membershipTable.status, MEMBERSHIP_STATUS.PENDING_REVIEW))
      .orderBy(desc(membershipTable.appliedAt));

    const result: PendingReviewItem[] = [];
    for (const m of memberships) {
      const [payment] = await db
        .select({
          id: membershipPaymentTable.id,
          proofObjectKey: membershipPaymentTable.proofObjectKey,
          originalFilename: membershipPaymentTable.originalFilename,
          submittedAt: membershipPaymentTable.submittedAt,
          status: membershipPaymentTable.status,
        })
        .from(membershipPaymentTable)
        .where(eq(membershipPaymentTable.membershipId, m.id))
        .orderBy(desc(membershipPaymentTable.submittedAt))
        .limit(1);
      result.push({
        ...m,
        payment: payment
          ? {
              ...payment,
              proofUrl: payment.proofObjectKey
                ? `/api/proofs/${encodeURIComponent(payment.proofObjectKey)}`
                : null,
            }
          : null,
      });
    }
    return { items: result };
  },
);

export const reviewMembershipFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      membershipId: z.string().min(1),
      decision: z.enum(["approve", "reject"]),
      reviewerNote: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdminUser();
    const db = getDb();
    const [m] = await db
      .select({
        id: membershipTable.id,
      })
      .from(membershipTable)
      .where(eq(membershipTable.id, data.membershipId))
      .limit(1);
    if (!m) throw new Error("Membership not found");

    const now = new Date();
    if (data.decision === "reject") {
      await db
        .update(membershipTable)
        .set({
          status: MEMBERSHIP_STATUS.REJECTED,
          rejectionReason: data.reviewerNote ?? null,
          reviewedAt: now,
          reviewedByUserId: admin.id,
        })
        .where(eq(membershipTable.id, m.id));
      await db
        .update(membershipPaymentTable)
        .set({
          status: PAYMENT_PROOF_STATUS.REJECTED,
          reviewedAt: now,
          reviewerUserId: admin.id,
          reviewerNote: data.reviewerNote ?? null,
        })
        .where(eq(membershipPaymentTable.membershipId, m.id));
      return { ok: true };
    }

    const validFrom = now;
    const validUntil = new Date(validFrom);
    validUntil.setDate(validUntil.getDate() + 365);

    await db
      .update(membershipTable)
      .set({
        status: MEMBERSHIP_STATUS.ACTIVE,
        validFrom,
        validUntil,
        memberNumber: generateMemberNumber(),
        reviewedAt: now,
        reviewedByUserId: admin.id,
      })
      .where(eq(membershipTable.id, m.id));

    await db
      .update(membershipPaymentTable)
      .set({
        status: PAYMENT_PROOF_STATUS.APPROVED,
        reviewedAt: now,
        reviewerUserId: admin.id,
        reviewerNote: data.reviewerNote ?? null,
      })
      .where(eq(membershipPaymentTable.membershipId, m.id));

    return { ok: true };
  });

export const verifyMembershipByTokenFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ token: z.string().min(1), mode: z.enum(["verify", "checkin"]).optional() }))
  .handler(async ({ data }) => {
    const payload = await verifyMembershipToken(data.token);
    if (!payload) return { ok: false, reason: "Invalid token" };

    const membershipId = String(payload.membershipId ?? "");
    if (!membershipId) return { ok: false, reason: "Invalid payload" };

    const db = getDb();
    const [row] = await db
      .select({
        id: membershipTable.id,
        status: membershipTable.status,
        memberNumber: membershipTable.memberNumber,
        validUntil: membershipTable.validUntil,
        revokedAt: membershipTable.revokedAt,
      })
      .from(membershipTable)
      .where(eq(membershipTable.id, membershipId))
      .limit(1);
    if (!row) return { ok: false, reason: "Membership not found" };

    const active = isActiveMembership({
      status: row.status as MembershipStatus,
      validUntil: row.validUntil ? new Date(row.validUntil) : null,
      revokedAt: row.revokedAt ? new Date(row.revokedAt) : null,
    });
    return {
      ok: active,
      reason: active ? null : "Membership is not active",
      memberNumber: row.memberNumber,
      status: row.status,
      mode: data.mode ?? "verify",
    };
  });

export const getMyMembershipFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ membership: MyMembership; isActive: boolean }> => {
    const user = await requireSessionUser();
    const userId = user.id;

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
        rejectionReason: membershipTable.rejectionReason,
        profession: membershipTable.profession,
        phone: membershipTable.phone,
        address: membershipTable.address,
        province: membershipTable.province,
        institutionName: membershipTable.institutionName,
        institutionType: membershipTable.institutionType,
        contactPerson: membershipTable.contactPerson,
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
      status: row.status as MembershipStatus,
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

    const verifyToken = await makeMembershipToken({
      membershipId: membership.id,
      memberNumber: membership.memberNumber,
      cardVersion: membership.cardVersion,
      issuedAt: Date.now(),
    });

    return {
      membership: {
        ...membership,
        verifyToken,
        verifyUrl: `/members/verify?token=${encodeURIComponent(verifyToken)}`,
      },
      isActive: active,
    };
  },
);

