import { user as userTable } from "@/db/auth.schema";
import { auth } from "@/lib/auth";
import { getFrequentR2Binding } from "@/server/api/env.server";
import type { DbAuthContext } from "@/server/api/function-context";
import { dbMiddleware } from "@/server/middleware/db-middleware";
import { requireAuthMiddleware } from "@/server/middleware/auth-middleware";
import { sessionMiddleware } from "@/server/middleware/session-middleware";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  bio: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export type MyProfile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  image: string | null;
};

export const getMyProfileFn = createServerFn({ method: "GET" })
  .middleware([dbMiddleware, sessionMiddleware, requireAuthMiddleware])
  .handler(
    async ({
      context,
    }: {
      context: DbAuthContext;
    }): Promise<{ profile: MyProfile }> => {
      const {
        db,
        user: { id: userId },
      } = context;
      const [row] = await db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          bio: userTable.bio,
          image: userTable.image,
        })
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1);
      if (!row) throw new Error("Not found");
      return { profile: row };
    },
  );

export const updateMyProfileFn = createServerFn({ method: "POST" })
  .middleware([dbMiddleware, sessionMiddleware, requireAuthMiddleware])
  .inputValidator((data: UpdateProfileInput) => updateProfileSchema.parse(data))
  .handler(
    async ({
      data,
      context,
    }: {
      data: UpdateProfileData;
      context: DbAuthContext;
    }): Promise<{ ok: true }> => {
      const {
        db,
        user: { id: userId },
      } = context;
      await db
        .update(userTable)
        .set({ name: data.name, bio: data.bio })
        .where(eq(userTable.id, userId));
      return { ok: true };
    },
  );

export const uploadAvatarFn = createServerFn({ method: "POST" })
  .middleware([dbMiddleware, sessionMiddleware, requireAuthMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error('Missing field "file"');
    return { file };
  })
  .handler(
    async ({
      data,
      context,
    }: {
      data: { file: File };
      context: DbAuthContext;
    }): Promise<{ ok: true; imageUrl: string }> => {
      const {
        db,
        user: { id: userId },
      } = context;
      const file = data.file;

      if (file.size <= 0) throw new Error("Empty file");
      if (file.size > 2 * 1024 * 1024) throw new Error("Max 2MB");

      const mime = (file.type ?? "").toLowerCase();
      const ext =
        mime === "image/png"
          ? "png"
          : mime === "image/jpeg"
            ? "jpg"
            : mime === "image/webp"
              ? "webp"
              : mime === "image/gif"
                ? "gif"
                : "bin";

      const now = Date.now();
      const objectKey = `avatars/${userId}/${now}.${ext}`;
      const bytes = new Uint8Array(await file.arrayBuffer());

      const r2 = getFrequentR2Binding();
      await r2.put(objectKey, bytes, {
        httpMetadata: { contentType: file.type || "application/octet-stream" },
        customMetadata: { originalFilename: file.name, userId },
      });

      const imageUrl = `/api/assets/${encodeURIComponent(objectKey)}`;
      await db
        .update(userTable)
        .set({ image: imageUrl })
        .where(eq(userTable.id, userId));

      return { ok: true, imageUrl };
    },
  );

export const changePasswordFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      currentPassword: z.string().min(1).max(200),
      newPassword: z.string().min(8).max(200),
      revokeOtherSessions: z.boolean().optional().default(true),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const request = getRequest();
    await auth.api.changePassword({
      headers: request.headers,
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions,
      },
    });
    return { ok: true };
  });
