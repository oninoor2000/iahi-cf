import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/profile/preferences")({
  component: ProfilePreferencesPage,
});

function ProfilePreferencesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Configure how you use the app.
        </p>
      </CardContent>
    </Card>
  );
}

