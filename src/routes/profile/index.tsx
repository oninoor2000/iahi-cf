import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/query/keys";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
  getMyProfileFn,
  updateMyProfileFn,
  uploadAvatarFn,
} from "@/server/api/profile.functions";

export const Route = createFileRoute("/profile/")({
  component: ProfilePersonalInfoPage,
});

function ProfilePersonalInfoPage() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const initial =
    session?.user?.name?.trim().slice(0, 1).toUpperCase() ??
    session?.user?.email?.slice(0, 1).toUpperCase() ??
    "?";

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: getMyProfileFn,
    enabled: Boolean(session?.user),
  });
  const saveMutation = useMutation({
    mutationFn: (data: { name: string; bio: string }) =>
      updateMyProfileFn({ data }),
    onSuccess: async () => {
      toast.success("Profile updated");
      await authClient.getSession({ query: { disableCookieCache: true } });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    },
  });
  const uploadMutation = useMutation({
    mutationFn: (fd: FormData) => uploadAvatarFn({ data: fd }),
    onSuccess: async (data) => {
      setForm((prev) => ({ ...prev, image: data.imageUrl }));
      toast.success("Photo updated");
      await authClient.getSession({ query: { disableCookieCache: true } });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    },
  });

  const [form, setForm] = React.useState<{
    name: string;
    bio: string;
    image: string | null;
    email: string;
  }>({
    name: session?.user?.name ?? "",
    bio: "",
    image: session?.user?.image ?? null,
    email: session?.user?.email ?? "",
  });

  React.useEffect(() => {
    if (!profileQuery.data?.profile) return;
    setForm({
      name: profileQuery.data.profile.name ?? "",
      bio: profileQuery.data.profile.bio ?? "",
      image: profileQuery.data.profile.image ?? null,
      email: profileQuery.data.profile.email ?? "",
    });
  }, [profileQuery.data?.profile]);

  React.useEffect(() => {
    if (profileQuery.error) {
      toast.error(
        profileQuery.error instanceof Error
          ? profileQuery.error.message
          : "Failed to load",
      );
    }
  }, [profileQuery.error]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    await saveMutation.mutateAsync({ name: form.name, bio: form.bio });
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    await uploadMutation.mutateAsync(fd);
    e.target.value = "";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
            <div className="space-y-2">
              <Label>Profile photo</Label>
              <div className="flex items-center gap-3">
                <Avatar className="size-14 rounded-full">
                  {form.image ? <AvatarImage src={form.image} alt="" /> : null}
                  <AvatarFallback className="text-sm">{initial}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={onAvatarChange}
                    disabled={uploadMutation.isPending}
                    className="block w-full text-xs file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF, or WebP. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  disabled={profileQuery.isPending}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Brief description for your profile"
                  disabled={profileQuery.isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={form.email} disabled aria-disabled />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="submit"
              disabled={saveMutation.isPending || profileQuery.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
