import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/contact")({
  component: ProfileContactPage,
});

function ProfileContactPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Manage your account contact details.
        </p>
      </CardContent>
    </Card>
  );
}

