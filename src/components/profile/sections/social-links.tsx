import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileSocialLinksSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social links</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Add links to your social profiles.
        </p>
      </CardContent>
    </Card>
  );
}
