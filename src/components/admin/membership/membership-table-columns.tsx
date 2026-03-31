import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MembershipAdminListItem } from "@/server/api/membership.functions";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react";

function SortButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 px-1.5"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="ml-1 size-3.5" />
    </Button>
  );
}

function statusVariant(
  status: MembershipAdminListItem["status"],
): "default" | "destructive" | "secondary" | "outline" {
  if (status === "active") return "default";
  if (status === "pending_review") return "secondary";
  if (status === "needs_correction") return "outline";
  if (status === "rejected") return "destructive";
  if (status === "cancelled") return "destructive";
  if (status === "expired") return "outline";
  if (status === "pending_payment") return "outline";
  return "outline";
}

function statusLabel(status: MembershipAdminListItem["status"]): string {
  if (status === "pending_payment") return "Pending payment";
  if (status === "pending_review") return "Pending review";
  if (status === "needs_correction") return "Needs correction";
  if (status === "active") return "Active";
  if (status === "rejected") return "Rejected final";
  if (status === "cancelled") return "Cancelled";
  if (status === "expired") return "Expired";
  return status;
}

export type MembershipTableActions = {
  onEdit: (row: MembershipAdminListItem) => void;
  onDelete: (row: MembershipAdminListItem) => void;
  onRevoke: (row: MembershipAdminListItem) => void;
  onApprove: (row: MembershipAdminListItem) => void;
  onNeedsCorrection: (row: MembershipAdminListItem) => void;
  onRejectFinal: (row: MembershipAdminListItem) => void;
  onView: (row: MembershipAdminListItem) => void;
  onCopyId: (row: MembershipAdminListItem) => void;
  onOpenProof: (row: MembershipAdminListItem) => void;
};

export function membershipTableColumns(
  actions: MembershipTableActions,
): ColumnDef<MembershipAdminListItem>[] {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
          aria-label="Select all rows in page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label={`Select membership ${row.original.id}`}
        />
      ),
    },
    {
      accessorKey: "userName",
      meta: { label: "User" },
      header: ({ column }) => (
        <SortButton label="User" onClick={() => column.toggleSorting()} />
      ),
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium">{row.original.userName}</p>
          <p className="text-[11px] text-muted-foreground">
            {row.original.userEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      meta: { label: "Status" },
      header: ({ column }) => (
        <SortButton label="Status" onClick={() => column.toggleSorting()} />
      ),
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>
          {statusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "memberNumber",
      meta: { label: "Member No." },
      header: "Member No.",
      cell: ({ row }) => row.original.memberNumber ?? "—",
    },
    {
      accessorKey: "appliedAt",
      meta: { label: "Applied Date" },
      header: ({ column }) => (
        <SortButton label="Applied" onClick={() => column.toggleSorting()} />
      ),
      cell: ({ row }) =>
        new Date(row.original.appliedAt).toLocaleDateString("id-ID"),
    },
    {
      accessorKey: "profession",
      meta: { label: "Profession" },
      header: "Profession",
      cell: ({ row }) => row.original.profession ?? "—",
    },
    {
      accessorKey: "deletedAt",
      meta: { label: "Deleted At" },
      header: "Deleted At",
      cell: ({ row }) =>
        row.original.deletedAt
          ? new Date(row.original.deletedAt).toLocaleDateString("id-ID")
          : "—",
    },
    {
      id: "actions",
      meta: { label: "Actions" },
      header: "Actions",
      cell: ({ row }) => {
        const canReview =
          row.original.status === "pending_review" ||
          row.original.status === "needs_correction";
        const canRevoke = row.original.status !== "cancelled";
        return (
          <div className="flex items-center gap-1">
            {row.original.paymentProofUrl ? (
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="View payment proof"
                onClick={() => actions.onOpenProof(row.original)}
              >
                <Eye className="size-4" />
              </Button>
            ) : null}
            {canReview ? (
              <Button size="sm" onClick={() => actions.onApprove(row.original)}>
                Approve
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                Approve
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="outline" aria-label="More actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => actions.onView(row.original)}>
                  View detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.onCopyId(row.original)}>
                  Copy membership ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canReview}
                  onClick={() => actions.onNeedsCorrection(row.original)}
                >
                  Needs correction
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canReview}
                  variant="destructive"
                  onClick={() => actions.onRejectFinal(row.original)}
                >
                  Reject final
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canRevoke}
                  variant="destructive"
                  onClick={() => actions.onRevoke(row.original)}
                >
                  Revoke
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => actions.onDelete(row.original)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
