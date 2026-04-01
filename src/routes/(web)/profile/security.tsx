import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import { changePasswordFn } from "@/server/api/profile.functions";

export const Route = createFileRoute("/(web)/profile/security")({
  component: ProfileSecurityPage,
});

function ProfileSecurityPage() {
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password confirmation does not match");
      return;
    }
    setSaving(true);
    try {
      await changePasswordFn({
        data: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          revokeOtherSessions: true,
        },
      });
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div className="flex items-center justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
