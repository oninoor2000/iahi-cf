import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth.schema";

export const PUBLICATION_VISIBILITY = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type PublicationVisibility =
  (typeof PUBLICATION_VISIBILITY)[keyof typeof PUBLICATION_VISIBILITY];

export const publication = sqliteTable(
  "publication",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    /** Short plain text (or allowed HTML) for cards, lists, meta; full layout in `bodyJson` when using TipTap. */
    summary: text("summary").notNull(),
    /** JSON array of strings for featured bullets; can be synced from or separate from the editor. */
    takeawaysJson: text("takeaways_json").notNull(),
    /** TipTap `JSONContent` (stringified). Primary article body for `/publications/:slug`. */
    bodyJson: text("body_json"),
    authors: text("authors").notNull(),
    venue: text("venue").notNull(),
    coverImageUrl: text("cover_image_url").notNull(),
    coverImageAlt: text("cover_image_alt").notNull(),
    linkUrl: text("link_url"),
    readMoreLabel: text("read_more_label"),
    publicationType: text("publication_type"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    doi: text("doi"),
    isbn: text("isbn"),
    /** R2 object key when PDF is self-hosted. */
    pdfObjectKey: text("pdf_object_key"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    visibility: text("visibility")
      .notNull()
      .default(PUBLICATION_VISIBILITY.PUBLISHED),
    sortOrder: integer("sort_order").notNull().default(0),
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
    index("publication_visibility_featured_idx").on(
      table.visibility,
      table.featured,
    ),
    index("publication_published_at_idx").on(table.publishedAt),
    index("publication_visibility_published_at_idx").on(
      table.visibility,
      table.publishedAt,
    ),
    index("publication_visibility_sortorder_idx").on(
      table.visibility,
      table.sortOrder,
    ),
    index("publication_doi_idx").on(table.doi),
  ],
);

export const publicationRelations = relations(publication, ({ one }) => ({
  createdBy: one(user, {
    fields: [publication.createdByUserId],
    references: [user.id],
    relationName: "publication_created_by_user",
  }),
  updatedBy: one(user, {
    fields: [publication.updatedByUserId],
    references: [user.id],
    relationName: "publication_updated_by_user",
  }),
}));
