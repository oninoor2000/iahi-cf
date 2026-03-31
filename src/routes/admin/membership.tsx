import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { USER_ROLES } from "@/db/auth.schema";
import { queryKeys } from "@/query/keys";
import {
  listPendingMembershipReviewsFn,
  reviewMembershipFn,
} from "@/server/membership.functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/membership")({
  component: AdminMembershipPage,
});

function institutionTypeLabel(value: string | null): string {
  if (value === "individu") return "Individu";
  if (value === "institusi") return "Institusi";
  return value ?? "—";
}

function AdminMembershipPage() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === USER_ROLES.ADMIN;
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const pendingQuery = useQuery({
    queryKey: queryKeys.membership.reviews(),
    queryFn: listPendingMembershipReviewsFn,
    enabled: isAdmin,
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: {
      membershipId: string;
      decision: "approve" | "reject";
      reviewerNote?: string;
    }) => reviewMembershipFn({ data: payload }),
    onSuccess: async () => {
      toast.success("Review submitted");
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Review failed"),
  });

  if (!isAdmin) {
    return (
      <main className="page-wrap mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Membership Review</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have access to this page.
        </p>
      </main>
    );
  }

  return (
    <main className="page-wrap mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Membership Review</h1>
        <Button variant="outline" asChild>
          <Link to="/admin/dashboard">Back to dashboard</Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Review payment proof and approve or reject membership applications.
      </p>

      <div className="mt-6 space-y-4">
        {pendingQuery.data?.items?.length ? (
          pendingQuery.data.items.map((item) => {
            const id = String(item.id);
            const payment = item.payment as
              | { originalFilename?: string; proofUrl?: string }
              | null;
            return (
              <Card key={id}>
                <CardHeader>
                  <CardTitle className="text-base">Membership {id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Applicant: {String(item.userName)} ({String(item.userEmail)})
                  </p>
                  <div className="grid gap-1 rounded-md border border-border/60 bg-muted/20 p-2 text-[11px] text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Profesi</span>:{" "}
                      {item.profession ?? "—"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Telepon</span>:{" "}
                      {item.phone ?? "—"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Alamat</span>:{" "}
                      {item.address ?? "—"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Provinsi</span>:{" "}
                      {item.province ?? "—"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Institusi</span>:{" "}
                      {item.institutionName ?? "—"} ({institutionTypeLabel(item.institutionType)})
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Kontak</span>:{" "}
                      {item.contactPerson ?? "—"}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Status: {String(item.status)}
                  </p>
                  {payment?.proofUrl ? (
                    <a
                      className="text-xs underline"
                      href={payment.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View proof: {payment.originalFilename ?? "file"}
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">No proof attached</p>
                  )}
                  <Textarea
                    value={notes[id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [id]: e.target.value }))
                    }
                    placeholder="Reviewer note"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        void reviewMutation.mutateAsync({
                          membershipId: id,
                          decision: "approve",
                          reviewerNote: notes[id],
                        })
                      }
                      disabled={reviewMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        void reviewMutation.mutateAsync({
                          membershipId: id,
                          decision: "reject",
                          reviewerNote: notes[id],
                        })
                      }
                      disabled={reviewMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            No pending membership reviews.
          </p>
        )}
      </div>
    </main>
  );
}

