import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

export const MEMBERSHIP_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PENDING_REVIEW: "pending_review",
  ACTIVE: "active",
  REJECTED: "rejected",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

export const PAYMENT_PROOF_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type PaymentProofStatus =
  (typeof PAYMENT_PROOF_STATUS)[keyof typeof PAYMENT_PROOF_STATUS];

export const membershipTier = sqliteTable(
  "membership_tier",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    /** Amount in whole currency units (e.g. IDR). */
    feeAmount: integer("fee_amount").notNull(),
    currency: text("currency").notNull().default("IDR"),
    durationMonths: integer("duration_months"),
    validityDays: integer("validity_days"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("membership_tier_is_active_idx").on(table.isActive)],
);

export const membership = sqliteTable(
  "membership",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tierId: text("tier_id").references(() => membershipTier.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default(MEMBERSHIP_STATUS.PENDING_PAYMENT),
    appliedAt: integer("applied_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    validFrom: integer("valid_from", { mode: "timestamp_ms" }),
    validUntil: integer("valid_until", { mode: "timestamp_ms" }),
    memberNumber: text("member_number").unique(),
    rejectionReason: text("rejection_reason"),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    reviewedByUserId: text("reviewed_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    /** Snapshot applicant details at consent / application time */
    profession: text("profession"),
    phone: text("phone"),
    address: text("address"),
    province: text("province"),
    institutionName: text("institution_name"),
    institutionType: text("institution_type"),
    contactPerson: text("contact_person"),
    cardVersion: integer("card_version").notNull().default(1),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("membership_user_id_idx").on(table.userId),
    index("membership_status_valid_until_idx").on(table.status, table.validUntil),
    index("membership_tier_id_idx").on(table.tierId),
  ],
);

export const membershipPayment = sqliteTable(
  "membership_payment",
  {
    id: text("id").primaryKey(),
    membershipId: text("membership_id")
      .notNull()
      .references(() => membership.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("IDR"),
    /** R2 object key for transfer proof image/PDF. */
    proofObjectKey: text("proof_object_key"),
    originalFilename: text("original_filename"),
    mimeType: text("mime_type"),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    payerNote: text("payer_note"),
    status: text("status")
      .notNull()
      .default(PAYMENT_PROOF_STATUS.PENDING),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    reviewerUserId: text("reviewer_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    reviewerNote: text("reviewer_note"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("membership_payment_membership_id_idx").on(table.membershipId),
    index("membership_payment_status_idx").on(table.status),
    index("membership_payment_submitted_at_idx").on(table.submittedAt),
  ],
);

export const membershipTierRelations = relations(membershipTier, ({ many }) => ({
  memberships: many(membership),
}));

export const membershipRelations = relations(membership, ({ one, many }) => ({
  user: one(user, {
    fields: [membership.userId],
    references: [user.id],
    relationName: "membership_subject_user",
  }),
  reviewedByUser: one(user, {
    fields: [membership.reviewedByUserId],
    references: [user.id],
    relationName: "membership_reviewed_by_user",
  }),
  tier: one(membershipTier, {
    fields: [membership.tierId],
    references: [membershipTier.id],
  }),
  payments: many(membershipPayment),
}));

export const membershipPaymentRelations = relations(
  membershipPayment,
  ({ one }) => ({
    membership: one(membership, {
      fields: [membershipPayment.membershipId],
      references: [membership.id],
    }),
    reviewer: one(user, {
      fields: [membershipPayment.reviewerUserId],
      references: [user.id],
      relationName: "membership_payment_reviewer_user",
    }),
  }),
);
