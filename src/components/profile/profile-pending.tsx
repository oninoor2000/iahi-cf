import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSectionPending() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
          <Skeleton className="size-14 rounded-full" />
          <div className="grid gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <Skeleton className="ml-auto h-9 w-32" />
      </CardContent>
    </Card>
  );
}

export function ProfileMembershipPending() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-5 w-20" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-[280px] w-full max-w-[520px] rounded-xl" />
      </CardContent>
    </Card>
  );
}
