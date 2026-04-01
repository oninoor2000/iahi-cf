import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfilePreferencesSection() {
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
