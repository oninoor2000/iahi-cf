import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileContactSection() {
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
