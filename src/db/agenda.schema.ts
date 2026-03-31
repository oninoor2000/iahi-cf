import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

/** Matches `AgendaFormat` in `@/lib/agenda-data`. */
export const AGENDA_FORMATS = {
  IN_PERSON: "in-person",
  HYBRID: "hybrid",
  ONLINE: "online",
} as const;

export type AgendaFormat = (typeof AGENDA_FORMATS)[keyof typeof AGENDA_FORMATS];

/** Matches `AgendaCategory` in `@/lib/agenda-data`. */
export const AGENDA_CATEGORIES = {
  CONFERENCE: "conference",
  WORKSHOP: "workshop",
  FORUM: "forum",
  MEETUP: "meetup",
  MEETING: "meeting",
} as const;

export type AgendaCategory =
  (typeof AGENDA_CATEGORIES)[keyof typeof AGENDA_CATEGORIES];

export const AGENDA_VISIBILITY = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type AgendaVisibility =
  (typeof AGENDA_VISIBILITY)[keyof typeof AGENDA_VISIBILITY];

export const agendaEvent = sqliteTable(
  "agenda_event",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    /** Free-form date line for cards (e.g. "Aug 9–13, 2025"). */
    statText: text("stat_text").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    subtext: text("subtext").notNull(),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull(),
    linkUrl: text("link_url"),
    ctaLabel: text("cta_label"),
    year: integer("year").notNull(),
    format: text("format").notNull(),
    category: text("category").notNull(),
    visibility: text("visibility")
      .notNull()
      .default(AGENDA_VISIBILITY.PUBLISHED),
    sortOrder: integer("sort_order").notNull().default(0),
    timezone: text("timezone"),
    venueName: text("venue_name"),
    city: text("city"),
    country: text("country"),
    registrationUrl: text("registration_url"),
    /**
     * TipTap `JSONContent` (stringified). Detail / long-form; list cards use title, subtext, stat.
     */
    bodyJson: text("body_json"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedByUserId: text("updated_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("agenda_event_visibility_year_idx").on(
      table.visibility,
      table.year,
    ),
    index("agenda_event_starts_at_idx").on(table.startsAt),
    index("agenda_event_visibility_sort_order_idx").on(
      table.visibility,
      table.sortOrder,
    ),
    index("agenda_event_category_year_idx").on(table.category, table.year),
    index("agenda_event_format_year_idx").on(table.format, table.year),
  ],
);

export const agendaEventRelations = relations(agendaEvent, ({ one }) => ({
  createdBy: one(user, {
    fields: [agendaEvent.createdByUserId],
    references: [user.id],
    relationName: "agenda_event_created_by_user",
  }),
  updatedBy: one(user, {
    fields: [agendaEvent.updatedByUserId],
    references: [user.id],
    relationName: "agenda_event_updated_by_user",
  }),
}));
