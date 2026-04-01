import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin users | IAHI" },
      {
        name: "description",
        content: "IAHI admin users and member list management.",
      },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman ini disiapkan untuk daftar user/member dan aksi manajemen user.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users management (MVP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>- List user/member akan ditampilkan di iterasi berikutnya.</p>
          <p>- Filter, role assignment, dan detail akun akan ditambahkan bertahap.</p>
        </CardContent>
      </Card>
    </section>
  );
}
