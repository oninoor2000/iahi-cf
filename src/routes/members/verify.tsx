import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryKeys } from "@/query/keys";
import { verifyMembershipByTokenFn } from "@/server/membership.functions";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/members/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    mode: search.mode === "checkin" ? "checkin" : "verify",
  }),
  component: VerifyMembershipPage,
});

function VerifyMembershipPage() {
  const { token, mode } = Route.useSearch();
  const verifyQuery = useQuery({
    queryKey: queryKeys.membership.verify(token),
    queryFn: () =>
      verifyMembershipByTokenFn({
        data: { token, mode: mode as "verify" | "checkin" | undefined },
      }),
    enabled: Boolean(token),
  });

  const data = verifyQuery.data;
  const ok = Boolean(data?.ok);

  return (
    <main className="page-wrap mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Membership verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant={ok ? "default" : "destructive"}>
            {ok ? "Valid member" : "Invalid / inactive"}
          </Badge>

          {token ? null : (
            <Alert variant="destructive">
              <AlertTitle>Missing token</AlertTitle>
              <AlertDescription>
                QR token is required for verification.
              </AlertDescription>
            </Alert>
          )}

          {verifyQuery.isPending ? (
            <p className="text-sm text-muted-foreground">
              Checking membership...
            </p>
          ) : (
            <div className="space-y-1 text-sm">
              <p>Mode: {mode}</p>
              <p>Status: {data?.status ?? "unknown"}</p>
              <p>Member No: {data?.memberNumber ?? "—"}</p>
              {data?.reason ? (
                <p className="text-destructive">{data.reason}</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
