import {
  MEMBERSHIP_STATUS,
  PAYMENT_PROOF_STATUS,
  membershipTier as membershipTierTable,
  membership as membershipTable,
  membershipPayment as membershipPaymentTable,
} from "@/db/membership.schema";
import { user as userTable } from "@/db/auth.schema";
import { isActiveMembership } from "@/lib/membership";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import type { MembershipStatus } from "@/db/membership.schema";
import { getInfrequentR2Binding } from "@/server/api/env.server";
import { INDONESIA_PROVINCES } from "@/lib/indonesia-provinces";
import { z } from "zod";
import {
  type DbAuthContext,
  type DbContext,
} from "@/server/api/function-context";
import { dbMiddleware } from "@/server/middleware/db-middleware";
import {
  requireAdminMiddleware,
  requireAuthMiddleware,
  requireVerifiedMiddleware,
} from "@/server/middleware/auth-middleware";
import { sessionMiddleware } from "@/server/middleware/session-middleware";

export type MembershipApplicantFields = {
  profession: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  institutionName: string | null;
  institutionType: string | null;
  contactPerson: string | null;
};

export type MyMembership =
  | null
  | ({
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
    } & MembershipApplicantFields);

const membershipApplicantInputSchema = z.object({
  profession: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  address: z.string().trim().min(1).max(2000),
  province: z.enum(INDONESIA_PROVINCES),
  institutionName: z.string().trim().min(1).max(200),
  institutionType: z.enum(["individu", "institusi"]),
  contactPerson: z.string().trim().min(1).max(200),
});
export type MembershipApplicantInput = z.infer<
  typeof membershipApplicantInputSchema
>;
export const membershipResubmitRejectedInputSchema = membershipApplicantInputSchema;
export type MembershipResubmitRejectedInput = z.infer<
  typeof membershipResubmitRejectedInputSchema
>;

const membershipStatusValues = [
  MEMBERSHIP_STATUS.PENDING_PAYMENT,
  MEMBERSHIP_STATUS.PENDING_REVIEW,
  MEMBERSHIP_STATUS.ACTIVE,
  MEMBERSHIP_STATUS.NEEDS_CORRECTION,
  MEMBERSHIP_STATUS.REJECTED,
  MEMBERSHIP_STATUS.EXPIRED,
  MEMBERSHIP_STATUS.CANCELLED,
] as const;

export const membershipAdminListFilterSchema = z
  .object({
    search: z.string().trim().optional(),
    status: z.enum(membershipStatusValues).optional(),
    institutionType: z.enum(["individu", "institusi"]).optional(),
    province: z.enum(INDONESIA_PROVINCES).optional(),
    hasPaymentProof: z.boolean().optional(),
    includeDeleted: z.boolean().optional(),
    appliedFrom: z.string().datetime().optional(),
    appliedTo: z.string().datetime().optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    sortBy: z.enum(["appliedAt", "updatedAt", "userName", "status"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .strict();
export type MembershipAdminListFilterInput = z.input<
  typeof membershipAdminListFilterSchema
>;

export const membershipAdminCreateInputSchema = membershipApplicantInputSchema
  .extend({
    userId: z.string().trim().min(1),
    status: z
      .enum([
        MEMBERSHIP_STATUS.PENDING_PAYMENT,
        MEMBERSHIP_STATUS.PENDING_REVIEW,
        MEMBERSHIP_STATUS.ACTIVE,
        MEMBERSHIP_STATUS.NEEDS_CORRECTION,
        MEMBERSHIP_STATUS.REJECTED,
      ])
      .optional(),
    tierId: z.string().trim().optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
  })
  .strict();
export type MembershipAdminCreateInput = z.infer<
  typeof membershipAdminCreateInputSchema
>;

export const membershipAdminUpdateInputSchema = membershipApplicantInputSchema
  .partial()
  .extend({
    membershipId: z.string().trim().min(1),
    status: z.enum(membershipStatusValues).optional(),
    tierId: z.string().trim().optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
    rejectionReason: z.string().trim().max(2000).optional().nullable(),
  })
  .strict();
export type MembershipAdminUpdateInput = z.infer<
  typeof membershipAdminUpdateInputSchema
>;

export const membershipAdminRevokeInputSchema = z
  .object({
    membershipId: z.string().trim().min(1),
  })
  .strict();
export type MembershipAdminRevokeInput = z.infer<
  typeof membershipAdminRevokeInputSchema
>;

const membershipAdminUserSearchSchema = z
  .object({
    search: z.string().trim().optional(),
    limit: z.number().int().positive().max(50).optional(),
  })
  .strict();
export type MembershipAdminUserSearchInput = z.input<
  typeof membershipAdminUserSearchSchema
>;

export type MembershipAdminUserOption = {
  id: string;
  name: string;
  email: string;
};

export type MembershipAdminListItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: MembershipStatus;
  memberNumber: string | null;
  appliedAt: string;
  updatedAt: string;
  validUntil: string | null;
  tierId: string | null;
  tierName: string | null;
  profession: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  institutionName: string | null;
  institutionType: string | null;
  contactPerson: string | null;
  rejectionReason: string | null;
  notes: string | null;
  paymentProofUrl: string | null;
  paymentProofFilename: string | null;
  paymentStatus: string | null;
  deletedAt: string | null;
};

export type MembershipAdminListResult = {
  data: MembershipAdminListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const membershipAdminBulkActionSchema = z
  .object({
    action: z.enum([
      "approve",
      "needs_correction",
      "reject_final",
      "reject",
      "delete",
      "set_pending_review",
      "set_pending_payment",
      "set_active",
    ]),
    reviewerNote: z.string().trim().max(2000).optional(),
    target: z
      .object({
        mode: z.literal("selected_ids"),
        ids: z.array(z.string().min(1)).min(1),
      })
      .strict(),
  })
  .strict();
export type MembershipAdminBulkActionInput = z.infer<
  typeof membershipAdminBulkActionSchema
>;

function normalizePagination(filters: MembershipAdminListFilterInput): {
  page: number;
  pageSize: number;
} {
  return {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 10,
  };
}

function buildMembershipAdminWhereClause(filters: MembershipAdminListFilterInput) {
  const appliedFrom = filters.appliedFrom ? new Date(filters.appliedFrom) : undefined;
  const appliedTo = filters.appliedTo ? new Date(filters.appliedTo) : undefined;
  return and(
    filters.status ? eq(membershipTable.status, filters.status) : undefined,
    filters.institutionType
      ? eq(membershipTable.institutionType, filters.institutionType)
      : undefined,
    filters.province ? eq(membershipTable.province, filters.province) : undefined,
    appliedFrom ? sql`${membershipTable.appliedAt} >= ${appliedFrom}` : undefined,
    appliedTo ? sql`${membershipTable.appliedAt} <= ${appliedTo}` : undefined,
    filters.hasPaymentProof === true
      ? sql`exists (
            select 1
            from membership_payment mp
            where mp.membership_id = ${membershipTable.id}
              and mp.proof_object_key is not null
          )`
      : undefined,
    filters.hasPaymentProof === false
      ? sql`not exists (
            select 1
            from membership_payment mp
            where mp.membership_id = ${membershipTable.id}
              and mp.proof_object_key is not null
          )`
      : undefined,
    filters.includeDeleted ? undefined : sql`${membershipTable.deletedAt} is null`,
    filters.search
      ? or(
          like(sql`lower(${userTable.name})`, `%${filters.search.toLowerCase()}%`),
          like(sql`lower(${userTable.email})`, `%${filters.search.toLowerCase()}%`),
          like(
            sql`lower(${membershipTable.memberNumber})`,
            `%${filters.search.toLowerCase()}%`,
          ),
        )
      : undefined,
  );
}

export type MembershipJoinGuide = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  currency: "IDR";
  transferMethods: readonly string[];
  uploadChecklist: readonly string[];
};

function base64UrlEncode(value: Uint8Array): string {
  const str = btoa(String.fromCharCode(...value));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
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
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return base64UrlEncode(new Uint8Array(sig));
}

async function makeMembershipToken(
  payload: Record<string, unknown>,
): Promise<string> {
  const payloadJson = JSON.stringify(payload);
  const payloadPart = base64UrlEncode(new TextEncoder().encode(payloadJson));
  const sig = await signPayload(payloadPart);
  return `${payloadPart}.${sig}`;
}

async function verifyMembershipToken(
  token: string,
): Promise<Record<string, unknown> | null> {
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

export const getMembershipJoinGuideFn = createServerFn({
  method: "GET",
}).handler(
  async (): Promise<{ guide: MembershipJoinGuide }> => ({
    guide: MEMBERSHIP_JOIN_GUIDE,
  }),
);

export const createMembershipApplicationFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireVerifiedMiddleware,
  ])
  .inputValidator(membershipApplicantInputSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipApplicantInput;
      context: DbAuthContext;
    }) => {
      const { db, user } = context;

      const [existing] = await db
        .select({
          id: membershipTable.id,
          status: membershipTable.status,
        })
        .from(membershipTable)
        .where(eq(membershipTable.userId, user.id))
        .orderBy(desc(membershipTable.appliedAt))
        .limit(1);

      if (
        existing &&
        existing.status !== MEMBERSHIP_STATUS.REJECTED &&
        existing.status !== MEMBERSHIP_STATUS.CANCELLED
      ) {
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
    },
  );

export const resubmitRejectedMembershipFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireVerifiedMiddleware,
  ])
  .inputValidator(membershipResubmitRejectedInputSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipResubmitRejectedInput;
      context: DbAuthContext;
    }) => {
      const { db, user } = context;
      const [existing] = await db
        .select({
          id: membershipTable.id,
          status: membershipTable.status,
        })
        .from(membershipTable)
        .where(eq(membershipTable.userId, user.id))
        .orderBy(desc(membershipTable.appliedAt))
        .limit(1);

      if (!existing || existing.status !== MEMBERSHIP_STATUS.NEEDS_CORRECTION) {
        throw new Error("No membership request requires correction");
      }

      const paymentRows = await db
        .select({
          id: membershipPaymentTable.id,
          proofObjectKey: membershipPaymentTable.proofObjectKey,
        })
        .from(membershipPaymentTable)
        .where(eq(membershipPaymentTable.membershipId, existing.id));

      const hasPaymentProof = paymentRows.some((row) => Boolean(row.proofObjectKey));
      const nextStatus = hasPaymentProof
        ? MEMBERSHIP_STATUS.PENDING_REVIEW
        : MEMBERSHIP_STATUS.PENDING_PAYMENT;

      await db
        .update(membershipTable)
        .set({
          status: nextStatus,
          profession: data.profession,
          phone: data.phone,
          address: data.address,
          province: data.province,
          institutionName: data.institutionName,
          institutionType: data.institutionType,
          contactPerson: data.contactPerson,
          rejectionReason: null,
          reviewedAt: null,
          reviewedByUserId: null,
        })
        .where(eq(membershipTable.id, existing.id));

      if (hasPaymentProof) {
        await db
          .update(membershipPaymentTable)
          .set({
            status: PAYMENT_PROOF_STATUS.PENDING,
            reviewedAt: null,
            reviewerUserId: null,
            reviewerNote: null,
          })
          .where(eq(membershipPaymentTable.membershipId, existing.id));
      }

      return {
        membershipId: existing.id,
        status: nextStatus,
        hasPaymentProof,
      };
    },
  );

export const uploadMembershipProofFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireVerifiedMiddleware,
  ])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const membershipId = data.get("membershipId");
    const file = data.get("file");
    const payerNote = data.get("payerNote");
    if (typeof membershipId !== "string" || !membershipId) {
      throw new Error("Missing membershipId");
    }
    if (!(file instanceof File)) throw new Error('Missing field "file"');
    return {
      membershipId,
      file,
      payerNote: typeof payerNote === "string" ? payerNote : null,
    };
  })
  .handler(
    async ({
      data,
      context,
    }: {
      data: { membershipId: string; file: File; payerNote: string | null };
      context: DbAuthContext;
    }) => {
      const { db, user } = context;
      const [membership] = await db
        .select({
          id: membershipTable.id,
          userId: membershipTable.userId,
        })
        .from(membershipTable)
        .where(eq(membershipTable.id, data.membershipId))
        .limit(1);
      if (!membership || membership.userId !== user.id)
        throw new Error("Membership not found");

      const file = data.file;
      if (file.size <= 0) throw new Error("Empty file");
      if (file.size > 5 * 1024 * 1024) throw new Error("Max 5MB");
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const key = `membership-proofs/${membership.id}/${Date.now()}.${ext}`;
      await getInfrequentR2Binding().put(
        key,
        new Uint8Array(await file.arrayBuffer()),
        {
          httpMetadata: {
            contentType: file.type || "application/octet-stream",
          },
          customMetadata: { membershipId: membership.id, userId: user.id },
        },
      );

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
    },
  );

export const listAdminMembershipsFn = createServerFn({ method: "GET" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(membershipAdminListFilterSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipAdminListFilterInput;
      context: DbAuthContext;
    }): Promise<MembershipAdminListResult> => {
      const { db } = context;
      const filters = data ?? {};
      const { page, pageSize } = normalizePagination(filters);
      const whereClause = buildMembershipAdminWhereClause(filters);

      const totalRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(membershipTable)
        .innerJoin(userTable, eq(userTable.id, membershipTable.userId))
        .where(whereClause);
      const total = Number(totalRows[0]?.count ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);

      const rows = await db
        .select({
          id: membershipTable.id,
          userId: membershipTable.userId,
          status: membershipTable.status,
          memberNumber: membershipTable.memberNumber,
          appliedAt: membershipTable.appliedAt,
          updatedAt: membershipTable.updatedAt,
          validUntil: membershipTable.validUntil,
          tierId: membershipTable.tierId,
          tierName: membershipTierTable.name,
          profession: membershipTable.profession,
          phone: membershipTable.phone,
          address: membershipTable.address,
          province: membershipTable.province,
          institutionName: membershipTable.institutionName,
          institutionType: membershipTable.institutionType,
          contactPerson: membershipTable.contactPerson,
          rejectionReason: membershipTable.rejectionReason,
          notes: membershipTable.notes,
          deletedAt: membershipTable.deletedAt,
          userName: userTable.name,
          userEmail: userTable.email,
        })
        .from(membershipTable)
        .innerJoin(userTable, eq(userTable.id, membershipTable.userId))
        .leftJoin(
          membershipTierTable,
          eq(membershipTierTable.id, membershipTable.tierId),
        )
        .where(whereClause)
        .orderBy(
          filters.sortBy === "userName"
            ? filters.sortOrder === "asc"
              ? asc(userTable.name)
              : desc(userTable.name)
            : filters.sortBy === "status"
              ? filters.sortOrder === "asc"
                ? asc(membershipTable.status)
                : desc(membershipTable.status)
              : filters.sortBy === "updatedAt"
                ? filters.sortOrder === "asc"
                  ? asc(membershipTable.updatedAt)
                  : desc(membershipTable.updatedAt)
                : filters.sortOrder === "asc"
                  ? asc(membershipTable.appliedAt)
                  : desc(membershipTable.appliedAt),
        )
        .limit(pageSize)
        .offset((safePage - 1) * pageSize);

      const dataRows: MembershipAdminListItem[] = [];
      for (const row of rows) {
        const [payment] = await db
          .select({
            proofObjectKey: membershipPaymentTable.proofObjectKey,
            originalFilename: membershipPaymentTable.originalFilename,
            status: membershipPaymentTable.status,
          })
          .from(membershipPaymentTable)
          .where(eq(membershipPaymentTable.membershipId, row.id))
          .orderBy(desc(membershipPaymentTable.submittedAt))
          .limit(1);

        dataRows.push({
          id: row.id,
          userId: row.userId,
          userName: row.userName,
          userEmail: row.userEmail,
          status: row.status as MembershipStatus,
          memberNumber: row.memberNumber,
          appliedAt: new Date(row.appliedAt).toISOString(),
          updatedAt: new Date(row.updatedAt).toISOString(),
          validUntil: row.validUntil ? new Date(row.validUntil).toISOString() : null,
          tierId: row.tierId,
          tierName: row.tierName,
          profession: row.profession,
          phone: row.phone,
          address: row.address,
          province: row.province,
          institutionName: row.institutionName,
          institutionType: row.institutionType,
          contactPerson: row.contactPerson,
          rejectionReason: row.rejectionReason,
          notes: row.notes,
          deletedAt: row.deletedAt ? new Date(row.deletedAt).toISOString() : null,
          paymentProofUrl: payment?.proofObjectKey
            ? `/api/proofs/${encodeURIComponent(payment.proofObjectKey)}`
            : null,
          paymentProofFilename: payment?.originalFilename ?? null,
          paymentStatus: payment?.status ?? null,
        });
      }

      return {
        data: dataRows,
        total,
        page: safePage,
        pageSize,
        totalPages,
      };
    },
  );

export const bulkActionMembershipAdminFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(membershipAdminBulkActionSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipAdminBulkActionInput;
      context: DbAuthContext;
    }): Promise<{ affectedCount: number; affectedIds: string[] }> => {
      const { db, user: admin } = context;
      const ids = [...new Set(data.target.ids)];
      if (!ids.length) return { affectedCount: 0, affectedIds: [] };

      const now = new Date();
      if (data.action === "delete") {
        await db
          .update(membershipTable)
          .set({
            status: MEMBERSHIP_STATUS.CANCELLED,
            revokedAt: now,
            deletedAt: now,
            reviewedAt: now,
            reviewedByUserId: admin.id,
          })
          .where(inArray(membershipTable.id, ids));
        return { affectedCount: ids.length, affectedIds: ids };
      }

      if (data.action === "approve" || data.action === "set_active") {
        const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        for (const membershipId of ids) {
          await db
            .update(membershipTable)
            .set({
              status: MEMBERSHIP_STATUS.ACTIVE,
              validFrom: now,
              validUntil,
              memberNumber: generateMemberNumber(),
              reviewedAt: now,
              reviewedByUserId: admin.id,
            })
            .where(eq(membershipTable.id, membershipId));
        }
        await db
          .update(membershipPaymentTable)
          .set({
            status: PAYMENT_PROOF_STATUS.APPROVED,
            reviewedAt: now,
            reviewerUserId: admin.id,
            reviewerNote: data.reviewerNote ?? null,
          })
          .where(inArray(membershipPaymentTable.membershipId, ids));
        return { affectedCount: ids.length, affectedIds: ids };
      }

      if (data.action === "needs_correction") {
        await db
          .update(membershipTable)
          .set({
            status: MEMBERSHIP_STATUS.NEEDS_CORRECTION,
            rejectionReason: data.reviewerNote ?? null,
            reviewedAt: now,
            reviewedByUserId: admin.id,
          })
          .where(inArray(membershipTable.id, ids));
        await db
          .update(membershipPaymentTable)
          .set({
            status: PAYMENT_PROOF_STATUS.REJECTED,
            reviewedAt: now,
            reviewerUserId: admin.id,
            reviewerNote: data.reviewerNote ?? null,
          })
          .where(inArray(membershipPaymentTable.membershipId, ids));
        return { affectedCount: ids.length, affectedIds: ids };
      }

      if (data.action === "reject" || data.action === "reject_final") {
        await db
          .update(membershipTable)
          .set({
            status: MEMBERSHIP_STATUS.REJECTED,
            rejectionReason: data.reviewerNote ?? null,
            reviewedAt: now,
            reviewedByUserId: admin.id,
          })
          .where(inArray(membershipTable.id, ids));
        await db
          .update(membershipPaymentTable)
          .set({
            status: PAYMENT_PROOF_STATUS.REJECTED,
            reviewedAt: now,
            reviewerUserId: admin.id,
            reviewerNote: data.reviewerNote ?? null,
          })
          .where(inArray(membershipPaymentTable.membershipId, ids));
        return { affectedCount: ids.length, affectedIds: ids };
      }

      if (data.action === "set_pending_review") {
        await db
          .update(membershipTable)
          .set({ status: MEMBERSHIP_STATUS.PENDING_REVIEW })
          .where(inArray(membershipTable.id, ids));
        return { affectedCount: ids.length, affectedIds: ids };
      }

      await db
        .update(membershipTable)
        .set({ status: MEMBERSHIP_STATUS.PENDING_PAYMENT })
        .where(inArray(membershipTable.id, ids));
      return { affectedCount: ids.length, affectedIds: ids };
    },
  );

export const createMembershipAdminFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(membershipAdminCreateInputSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipAdminCreateInput;
      context: DbAuthContext;
    }) => {
      const membershipId = crypto.randomUUID();
      const now = new Date();
      const validFrom = data.status === MEMBERSHIP_STATUS.ACTIVE ? now : null;
      const validUntil =
        data.status === MEMBERSHIP_STATUS.ACTIVE
          ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
          : null;

      const { db } = context;
      await db.insert(membershipTable).values({
        id: membershipId,
        userId: data.userId,
        tierId: data.tierId ?? null,
        status: data.status ?? MEMBERSHIP_STATUS.PENDING_PAYMENT,
        appliedAt: now,
        validFrom,
        validUntil,
        memberNumber:
          data.status === MEMBERSHIP_STATUS.ACTIVE ? generateMemberNumber() : null,
        profession: data.profession,
        phone: data.phone,
        address: data.address,
        province: data.province,
        institutionName: data.institutionName,
        institutionType: data.institutionType,
        contactPerson: data.contactPerson,
        notes: data.notes ?? null,
      });

      return { membershipId };
    },
  );

export const updateMembershipAdminFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(membershipAdminUpdateInputSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipAdminUpdateInput;
      context: DbAuthContext;
    }) => {
      const { db, user: admin } = context;
      const [existing] = await db
        .select({ id: membershipTable.id })
        .from(membershipTable)
        .where(eq(membershipTable.id, data.membershipId))
        .limit(1);
      if (!existing) throw new Error("Membership not found");

      const now = new Date();
      await db
        .update(membershipTable)
        .set({
          status: data.status,
          tierId: data.tierId,
          notes: data.notes,
          rejectionReason: data.rejectionReason,
          profession: data.profession,
          phone: data.phone,
          address: data.address,
          province: data.province,
          institutionName: data.institutionName,
          institutionType: data.institutionType,
          contactPerson: data.contactPerson,
          reviewedAt: data.status ? now : undefined,
          reviewedByUserId: data.status ? admin.id : undefined,
        })
        .where(eq(membershipTable.id, data.membershipId));

      return { ok: true };
    },
  );

export const deleteMembershipAdminFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(
    z
      .object({
        membershipId: z.string().trim().min(1),
      })
      .strict(),
  )
  .handler(
    async ({
      data,
      context,
    }: {
      data: { membershipId: string };
      context: DbAuthContext;
    }) => {
      const { db, user: admin } = context;
      const [existing] = await db
        .select({ id: membershipTable.id })
        .from(membershipTable)
        .where(eq(membershipTable.id, data.membershipId))
        .limit(1);
      if (!existing) throw new Error("Membership not found");

      await db
        .update(membershipTable)
        .set({
          status: MEMBERSHIP_STATUS.CANCELLED,
          revokedAt: new Date(),
          deletedAt: new Date(),
          reviewedAt: new Date(),
          reviewedByUserId: admin.id,
        })
        .where(eq(membershipTable.id, data.membershipId));
      return { ok: true };
    },
  );

export const revokeMembershipAdminFn = createServerFn({ method: "POST" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(membershipAdminRevokeInputSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipAdminRevokeInput;
      context: DbAuthContext;
    }): Promise<{ success: true; membershipId: string }> => {
      const { db, user: admin } = context;
      const [existing] = await db
        .select({ id: membershipTable.id })
        .from(membershipTable)
        .where(eq(membershipTable.id, data.membershipId))
        .limit(1);
      if (!existing) throw new Error("Membership not found");

      const now = new Date();
      await db
        .update(membershipTable)
        .set({
          status: MEMBERSHIP_STATUS.CANCELLED,
          revokedAt: now,
          reviewedAt: now,
          reviewedByUserId: admin.id,
        })
        .where(eq(membershipTable.id, data.membershipId));

      return { success: true, membershipId: data.membershipId };
    },
  );

export const searchMembershipAdminUsersFn = createServerFn({ method: "GET" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(membershipAdminUserSearchSchema)
  .handler(
    async ({
      data,
      context,
    }: {
      data: MembershipAdminUserSearchInput;
      context: DbAuthContext;
    }): Promise<{ data: MembershipAdminUserOption[] }> => {
      const { db } = context;
      const limit = data.limit ?? 20;
      const search = data.search?.toLowerCase();
      const rows = await db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
        })
        .from(userTable)
        .where(
          search
            ? or(
                like(sql`lower(${userTable.name})`, `%${search}%`),
                like(sql`lower(${userTable.email})`, `%${search}%`),
              )
            : undefined,
        )
        .orderBy(asc(userTable.name))
        .limit(limit);
      return { data: rows };
    },
  );

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

export const listPendingMembershipReviewsFn = createServerFn({ method: "GET" })
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .handler(
    async ({
      context,
    }: {
      context: DbAuthContext;
    }): Promise<{ items: PendingReviewItem[] }> => {
      const { db } = context;
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
  .middleware([
    dbMiddleware,
    sessionMiddleware,
    requireAuthMiddleware,
    requireAdminMiddleware,
  ])
  .inputValidator(
    z.object({
      membershipId: z.string().min(1),
      decision: z.enum(["approve", "needs_correction", "reject_final", "reject"]),
      reviewerNote: z.string().optional(),
    }),
  )
  .handler(
    async ({
      data,
      context,
    }: {
      data: {
        membershipId: string;
        decision: "approve" | "needs_correction" | "reject_final" | "reject";
        reviewerNote?: string | undefined;
      };
      context: DbAuthContext;
    }) => {
      const { db, user: admin } = context;
      const [m] = await db
        .select({
          id: membershipTable.id,
          status: membershipTable.status,
        })
        .from(membershipTable)
        .where(eq(membershipTable.id, data.membershipId))
        .limit(1);
      if (!m) throw new Error("Membership not found");
      if (
        m.status !== MEMBERSHIP_STATUS.PENDING_REVIEW &&
        m.status !== MEMBERSHIP_STATUS.NEEDS_CORRECTION
      ) {
        throw new Error("This membership is not in a reviewable state");
      }

      const now = new Date();
      if (data.decision === "needs_correction") {
        await db
          .update(membershipTable)
          .set({
            status: MEMBERSHIP_STATUS.NEEDS_CORRECTION,
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

      if (data.decision === "reject" || data.decision === "reject_final") {
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
    },
  );

export const verifyMembershipByTokenFn = createServerFn({ method: "GET" })
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      token: z.string().min(1),
      mode: z.enum(["verify", "checkin"]).optional(),
    }),
  )
  .handler(
    async ({
      data,
      context,
    }: {
      data: { token: string; mode?: "verify" | "checkin" };
      context: DbContext;
    }) => {
      const payload = await verifyMembershipToken(data.token);
      if (!payload) return { ok: false, reason: "Invalid token" };

      const membershipId = String(payload.membershipId ?? "");
      if (!membershipId) return { ok: false, reason: "Invalid payload" };

      const { db } = context;
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
    },
  );

export const getMyMembershipFn = createServerFn({ method: "GET" })
  .middleware([dbMiddleware, sessionMiddleware, requireAuthMiddleware])
  .handler(
    async ({
      context,
    }: {
      context: DbAuthContext;
    }): Promise<{ membership: MyMembership; isActive: boolean }> => {
      const {
        db,
        user: { id: userId },
      } = context;
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
        validUntil: row.validUntil
          ? new Date(row.validUntil).toISOString()
          : null,
        revokedAt: row.revokedAt ? new Date(row.revokedAt).toISOString() : null,
        appliedAt: new Date(row.appliedAt).toISOString(),
      } satisfies NonNullable<MyMembership>;

      const active = isActiveMembership({
        status: membership.status,
        validUntil: membership.validUntil
          ? new Date(membership.validUntil)
          : null,
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
