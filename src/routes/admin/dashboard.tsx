import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | IAHI" },
      {
        name: "description",
        content: "IAHI administration dashboard.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan alat administrasi IAHI.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Membership approvals</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tinjau pendaftaran member dan konfirmasi pembayaran.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Kelola user dan data member (MVP).
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
