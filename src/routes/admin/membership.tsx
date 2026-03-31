import { MembershipTable } from "@/components/admin/membership/membership-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MEMBERSHIP_STATUS } from "@/db/membership.schema";
import {
  INDONESIA_PROVINCES,
  INDONESIA_PROVINCE_OPTIONS,
  type IndonesiaProvince,
} from "@/lib/indonesia-provinces";
import { queryKeys } from "@/query/keys";
import {
  membershipAdminListQuery,
  membershipAdminUsersQuery,
} from "@/query/membership.query";
import {
  bulkActionMembershipAdminFn,
  createMembershipAdminFn,
  deleteMembershipAdminFn,
  membershipAdminCreateInputSchema,
  membershipAdminUpdateInputSchema,
  revokeMembershipAdminFn,
  type MembershipAdminListFilterInput,
  type MembershipAdminListItem,
  reviewMembershipFn,
  updateMembershipAdminFn,
} from "@/server/api/membership.functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/membership")({
  component: AdminMembershipPage,
  pendingComponent: AdminMembershipPending,
});

type MembershipFormMode = "create" | "edit";
type ReviewDecision =
  | "approve"
  | "needs_correction"
  | "reject_final"
  | "reject";
type DestructiveActionType =
  | "row_delete"
  | "row_revoke"
  | "row_review"
  | "bulk";

type PendingAction = {
  type: DestructiveActionType;
  title: string;
  description: string;
  requiresNote: boolean;
  noteTemplate?: string;
  confirmLabel: string;
  onConfirm: (note?: string) => Promise<void>;
};
type MembershipFormState = {
  membershipId?: string;
  userId: string;
  profession: string;
  phone: string;
  address: string;
  province: IndonesiaProvince | "";
  institutionName: string;
  institutionType: "individu" | "institusi";
  contactPerson: string;
  status: (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];
  notes: string;
  rejectionReason: string;
};

const emptyForm = (): MembershipFormState => ({
  userId: "",
  profession: "",
  phone: "",
  address: "",
  province: "",
  institutionName: "",
  institutionType: "individu",
  contactPerson: "",
  status: "pending_payment",
  notes: "",
  rejectionReason: "",
});

const CREATE_STATUS_OPTIONS = [
  MEMBERSHIP_STATUS.PENDING_PAYMENT,
  MEMBERSHIP_STATUS.PENDING_REVIEW,
  MEMBERSHIP_STATUS.ACTIVE,
  MEMBERSHIP_STATUS.NEEDS_CORRECTION,
  MEMBERSHIP_STATUS.REJECTED,
] as const;

const EDIT_STATUS_OPTIONS = [
  MEMBERSHIP_STATUS.PENDING_PAYMENT,
  MEMBERSHIP_STATUS.PENDING_REVIEW,
  MEMBERSHIP_STATUS.ACTIVE,
  MEMBERSHIP_STATUS.NEEDS_CORRECTION,
  MEMBERSHIP_STATUS.REJECTED,
  MEMBERSHIP_STATUS.EXPIRED,
  MEMBERSHIP_STATUS.CANCELLED,
] as const;

function parseProvince(value: string): IndonesiaProvince | "" {
  return (INDONESIA_PROVINCES as readonly string[]).includes(value)
    ? (value as IndonesiaProvince)
    : "";
}

function AdminMembershipPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<MembershipAdminListFilterInput>({
    page: 1,
    pageSize: 10,
    sortBy: "appliedAt",
    sortOrder: "desc",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isProofOpen, setIsProofOpen] = React.useState(false);
  const [mode, setMode] = React.useState<MembershipFormMode>("create");
  const [userSearch, setUserSearch] = React.useState("");
  const [form, setForm] = React.useState<MembershipFormState>(emptyForm);
  const [selectedMembership, setSelectedMembership] =
    React.useState<MembershipAdminListItem | null>(null);
  const [selectedProof, setSelectedProof] = React.useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(
    null,
  );
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false);
  const [actionNote, setActionNote] = React.useState("");
  const [isSubmittingAction, setIsSubmittingAction] = React.useState(false);
  const isTransitioningToNoteRef = React.useRef(false);

  const listQuery = useQuery(membershipAdminListQuery(filters));
  const usersQuery = useQuery(membershipAdminUsersQuery(userSearch));

  const handleFiltersChange = React.useCallback(
    (next: MembershipAdminListFilterInput) => {
      setFilters(next);
    },
    [],
  );

  const reviewMutation = useMutation({
    mutationFn: (payload: {
      membershipId: string;
      decision: ReviewDecision;
      reviewerNote?: string;
    }) => reviewMembershipFn({ data: payload }),
    onSuccess: async () => {
      toast.success("Review submitted");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.membership.all,
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Review failed");
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createMembershipAdminFn({
        data: membershipAdminCreateInputSchema.parse({
          userId: form.userId,
          profession: form.profession,
          phone: form.phone,
          address: form.address,
          province: form.province,
          institutionName: form.institutionName,
          institutionType: form.institutionType,
          contactPerson: form.contactPerson,
          status: form.status,
          notes: form.notes || null,
        }),
      }),
    onSuccess: async () => {
      toast.success("Membership created");
      setIsDialogOpen(false);
      setForm(emptyForm());
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership.all });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Create failed"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateMembershipAdminFn({
        data: membershipAdminUpdateInputSchema.parse({
          membershipId: form.membershipId,
          profession: form.profession,
          phone: form.phone,
          address: form.address,
          province: form.province,
          institutionName: form.institutionName,
          institutionType: form.institutionType,
          contactPerson: form.contactPerson,
          status: form.status,
          notes: form.notes || null,
          rejectionReason: form.rejectionReason || null,
        }),
      }),
    onSuccess: async () => {
      toast.success("Membership updated");
      setIsDialogOpen(false);
      setForm(emptyForm());
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership.all });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (membershipId: string) => deleteMembershipAdminFn({ data: { membershipId } }),
    onSuccess: async () => {
      toast.success("Membership deleted");
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership.all });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const revokeMutation = useMutation({
    mutationFn: (membershipId: string) => revokeMembershipAdminFn({ data: { membershipId } }),
    onSuccess: async () => {
      toast.success("Membership revoked");
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership.all });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Revoke failed"),
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: Parameters<typeof bulkActionMembershipAdminFn>[0]["data"]) =>
      bulkActionMembershipAdminFn({ data: payload }),
    onSuccess: async (res) => {
      toast.success(`Bulk action applied to ${res.affectedCount} memberships`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership.all });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Bulk action failed"),
  });

  const openCreateDialog = React.useCallback(() => {
    setMode("create");
    setForm(emptyForm());
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = React.useCallback((row: MembershipAdminListItem) => {
    setMode("edit");
    setForm({
      membershipId: row.id,
      userId: row.userId,
      profession: row.profession ?? "",
      phone: row.phone ?? "",
      address: row.address ?? "",
      province: parseProvince(row.province ?? ""),
      institutionName: row.institutionName ?? "",
      institutionType:
        row.institutionType === "institusi" ? "institusi" : "individu",
      contactPerson: row.contactPerson ?? "",
      status: row.status,
      notes: row.notes ?? "",
      rejectionReason: row.rejectionReason ?? "",
    });
    setIsDialogOpen(true);
  }, []);

  const resetPendingAction = React.useCallback(() => {
    setPendingAction(null);
    setActionNote("");
    setIsNoteDialogOpen(false);
    setIsSubmittingAction(false);
    isTransitioningToNoteRef.current = false;
  }, []);

  const requestActionConfirmation = React.useCallback((action: PendingAction) => {
    setPendingAction(action);
    setActionNote(action.noteTemplate ?? "");
  }, []);

  const openNoteDialogForPendingAction = React.useCallback(() => {
    if (!pendingAction) return;
    isTransitioningToNoteRef.current = true;
    setIsNoteDialogOpen(true);
  }, [pendingAction]);

  const executePendingAction = React.useCallback(async () => {
    if (!pendingAction) return;
    setIsSubmittingAction(true);
    let isSuccess = false;
    try {
      await pendingAction.onConfirm(pendingAction.requiresNote ? actionNote : undefined);
      isSuccess = true;
    } catch {
      // Error toast is handled by each mutation onError handler.
    } finally {
      setIsSubmittingAction(false);
      if (!isSuccess) return;
      resetPendingAction();
    }
  }, [actionNote, pendingAction, resetPendingAction]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Membership Review
        </h1>
        <Button variant="outline" asChild>
          <Link to="/admin/dashboard">Back to dashboard</Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage membership requests with full CRUD and review decisions.
      </p>

      <MembershipTable
        data={listQuery.data?.data ?? []}
        totalRows={listQuery.data?.total ?? 0}
        page={filters.page ?? listQuery.data?.page ?? 1}
        pageSize={filters.pageSize ?? listQuery.data?.pageSize ?? 10}
        totalPages={listQuery.data?.totalPages ?? 1}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={listQuery.isFetching}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onDelete={(row) => {
          requestActionConfirmation({
            type: "row_delete",
            title: "Delete membership?",
            description: `Membership ${row.id} for ${row.userName} will be deleted.`,
            requiresNote: false,
            confirmLabel: "Delete",
            onConfirm: async () => {
              await deleteMutation.mutateAsync(row.id);
            },
          });
        }}
        onRevoke={(row) => {
          requestActionConfirmation({
            type: "row_revoke",
            title: "Revoke membership?",
            description: `Membership ${row.id} for ${row.userName} will be set as cancelled.`,
            requiresNote: false,
            confirmLabel: "Revoke",
            onConfirm: async () => {
              await revokeMutation.mutateAsync(row.id);
            },
          });
        }}
        onApprove={(row) => {
          requestActionConfirmation({
            type: "row_review",
            title: "Approve membership?",
            description: `Approve membership ${row.id} for ${row.userName}.`,
            requiresNote: true,
            noteTemplate: "Approved",
            confirmLabel: "Approve",
            onConfirm: async (note) => {
              await reviewMutation.mutateAsync({
                membershipId: row.id,
                decision: "approve" satisfies ReviewDecision,
                reviewerNote: note || undefined,
              });
            },
          });
        }}
        onNeedsCorrection={(row) => {
          requestActionConfirmation({
            type: "row_review",
            title: "Request correction?",
            description: `User can revise membership ${row.id} and resubmit for review.`,
            requiresNote: true,
            confirmLabel: "Needs correction",
            onConfirm: async (note) => {
              await reviewMutation.mutateAsync({
                membershipId: row.id,
                decision: "needs_correction" satisfies ReviewDecision,
                reviewerNote: note || undefined,
              });
            },
          });
        }}
        onRejectFinal={(row) => {
          requestActionConfirmation({
            type: "row_review",
            title: "Reject final?",
            description: `Membership ${row.id} for ${row.userName} will be marked as final rejected.`,
            requiresNote: true,
            confirmLabel: "Reject final",
            onConfirm: async (note) => {
              await reviewMutation.mutateAsync({
                membershipId: row.id,
                decision: "reject_final" satisfies ReviewDecision,
                reviewerNote: note || undefined,
              });
            },
          });
        }}
        onView={(row) => {
          setSelectedMembership(row);
          setIsDetailOpen(true);
        }}
        onCopyId={(row) => {
          void navigator.clipboard.writeText(row.id).then(
            () => toast.success("Membership ID copied"),
            () => toast.error("Failed to copy membership ID"),
          );
        }}
        onOpenProof={(row) => {
          if (!row.paymentProofUrl) {
            toast.error("No payment proof available");
            return;
          }
          const filename = row.paymentProofFilename ?? "proof";
          const isLikelyImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename);
          if (!isLikelyImage) {
            window.open(row.paymentProofUrl, "_blank", "noopener,noreferrer");
            return;
          }
          setSelectedProof({ url: row.paymentProofUrl, filename });
          setIsProofOpen(true);
        }}
        onBulkAction={({ action, selectedIds }) => {
          if (selectedIds.length === 0) {
            toast.error("Select at least one row");
            return;
          }
          const bulkMeta =
            action === "needs_correction"
              ? {
                  title: "Set selected rows to needs correction?",
                  description: `${selectedIds.length} memberships will move to needs_correction and users can resubmit.`,
                }
              : action === "reject_final"
                ? {
                    title: "Reject final for selected rows?",
                    description: `${selectedIds.length} memberships will be marked as final rejected.`,
                  }
                : action === "delete"
                  ? {
                      title: "Delete selected memberships?",
                      description: `Delete action will be applied to ${selectedIds.length} selected memberships.`,
                    }
                : {
                    title: "Apply bulk action?",
                    description: `Action "${action}" will be applied to ${selectedIds.length} selected memberships.`,
                  };
          requestActionConfirmation({
            type: "bulk",
            title: bulkMeta.title,
            description: bulkMeta.description,
            requiresNote:
              action === "approve" ||
              action === "needs_correction" ||
              action === "reject_final",
            noteTemplate: action === "approve" ? "Approved" : undefined,
            confirmLabel: "Continue",
            onConfirm: async (note) => {
              await bulkMutation.mutateAsync({
                action,
                reviewerNote: note || undefined,
                target: { mode: "selected_ids", ids: selectedIds },
              });
            },
          });
        }}
        onBulkCopyIds={(selectedIds) => {
          if (!selectedIds.length) {
            toast.error("No IDs to copy");
            return;
          }
          void navigator.clipboard.writeText(selectedIds.join("\n")).then(
            () => toast.success(`${selectedIds.length} IDs copied`),
            () => toast.error("Failed to copy IDs"),
          );
        }}
        onBulkExportCsv={(selectedIds) => {
          if (!selectedIds.length) {
            toast.error("No IDs to export");
            return;
          }
          const csv = `membershipId\n${selectedIds.map((id) => `"${id}"`).join("\n")}`;
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `membership-selection-${Date.now()}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success(`${selectedIds.length} rows exported`);
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create membership" : "Edit membership"}
            </DialogTitle>
            <DialogDescription>
              Fill the membership fields below. All values are validated by the
              shared membership schema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {mode === "create" ? (
              <>
                <Label htmlFor="admin-membership-user-search">Search user</Label>
                <Input
                  id="admin-membership-user-search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Type user name or email"
                />
                <Label htmlFor="admin-membership-user">User</Label>
                <Select
                  value={form.userId}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, userId: value }))
                  }
                >
                  <SelectTrigger id="admin-membership-user" className="w-full">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {(usersQuery.data?.data ?? []).map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} - {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="membership-profession">Profession</Label>
                <Input
                  id="membership-profession"
                  value={form.profession}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, profession: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="membership-phone">Phone</Label>
                <Input
                  id="membership-phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="membership-province">Province</Label>
                <Select
                  value={form.province}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, province: parseProvince(value) }))
                  }
                >
                  <SelectTrigger id="membership-province" className="w-full">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDONESIA_PROVINCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="membership-contact">Contact person</Label>
                <Input
                  id="membership-contact"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, contactPerson: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="membership-institution">Institution name</Label>
                <Input
                  id="membership-institution"
                  value={form.institutionName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      institutionName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="membership-institution-type">
                  Institution type
                </Label>
                <Select
                  value={form.institutionType}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      institutionType: value === "institusi" ? "institusi" : "individu",
                    }))
                  }
                >
                  <SelectTrigger id="membership-institution-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individu">Individu</SelectItem>
                    <SelectItem value="institusi">Institusi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label htmlFor="membership-address">Address</Label>
                <Input
                  id="membership-address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="membership-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as MembershipFormState["status"],
                    }))
                  }
                >
                  <SelectTrigger id="membership-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(mode === "create"
                      ? CREATE_STATUS_OPTIONS
                      : EDIT_STATUS_OPTIONS
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="membership-rejection-reason">
                  Rejection reason
                </Label>
                <Input
                  id="membership-rejection-reason"
                  value={form.rejectionReason}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rejectionReason: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label htmlFor="membership-notes">Notes</Label>
                <Input
                  id="membership-notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setForm(emptyForm());
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                mode === "create"
                  ? void createMutation.mutateAsync()
                  : void updateMutation.mutateAsync()
              }
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {mode === "create" ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Membership detail</DialogTitle>
            <DialogDescription>
              Read-only details for selected membership record.
            </DialogDescription>
          </DialogHeader>
          {selectedMembership ? (
            <div className="grid gap-1.5 text-xs">
              <div>
                <span className="text-muted-foreground">ID:</span>{" "}
                {selectedMembership.id}
              </div>
              <div>
                <span className="text-muted-foreground">User:</span>{" "}
                {selectedMembership.userName} ({selectedMembership.userEmail})
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                {selectedMembership.status}
              </div>
              <div>
                <span className="text-muted-foreground">Profession:</span>{" "}
                {selectedMembership.profession ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {selectedMembership.phone ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Address:</span>{" "}
                {selectedMembership.address ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Province:</span>{" "}
                {selectedMembership.province ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Institution:</span>{" "}
                {selectedMembership.institutionName ?? "—"} (
                {selectedMembership.institutionType ?? "—"})
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>{" "}
                {selectedMembership.contactPerson ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Applied At:</span>{" "}
                {new Date(selectedMembership.appliedAt).toLocaleString("id-ID")}
              </div>
              {selectedMembership.paymentProofUrl ? (
                <a
                  className="underline"
                  href={selectedMembership.paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View proof: {selectedMembership.paymentProofFilename ?? "file"}
                </a>
              ) : (
                <div>
                  <span className="text-muted-foreground">Payment proof:</span> —
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProofOpen} onOpenChange={setIsProofOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment proof preview</DialogTitle>
            <DialogDescription>
              Quick preview to validate transfer proof clearly.
            </DialogDescription>
          </DialogHeader>
          {selectedProof ? (
            <div className="space-y-3">
              <img
                src={selectedProof.url}
                alt={selectedProof.filename}
                className="max-h-[70vh] w-full object-contain"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{selectedProof.filename}</span>
                <a
                  href={selectedProof.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Open original
                </a>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingAction) && !isNoteDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmittingAction) {
            if (isTransitioningToNoteRef.current) {
              isTransitioningToNoteRef.current = false;
              return;
            }
            resetPendingAction();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              size="default"
              variant="outline"
              disabled={isSubmittingAction}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              size="default"
              disabled={isSubmittingAction}
              variant={
                pendingAction?.type === "row_delete" ||
                pendingAction?.type === "row_revoke" ||
                (pendingAction?.type === "bulk" &&
                  pendingAction?.description.toLowerCase().includes("delete"))
                  ? "destructive"
                  : "default"
              }
              onClick={(event) => {
                if (!pendingAction) return;
                if (pendingAction.requiresNote) {
                  openNoteDialogForPendingAction();
                  return;
                }
                // Prevent Radix AlertDialog default auto-close for direct actions.
                event.preventDefault();
                void executePendingAction();
              }}
            >
              {isSubmittingAction
                ? "Processing..."
                : (pendingAction?.confirmLabel ?? "Continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isNoteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (isSubmittingAction) return;
            resetPendingAction();
            return;
          }
          setIsNoteDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add reviewer note</DialogTitle>
            <DialogDescription>
              Note is optional. You can edit or continue directly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="action-note">Note</Label>
            <Textarea
              id="action-note"
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Type note or reason (optional)"
              rows={4}
              disabled={isSubmittingAction}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSubmittingAction}
              onClick={() => {
                resetPendingAction();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                void executePendingAction();
              }}
              disabled={isSubmittingAction}
            >
              {isSubmittingAction ? "Processing..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AdminMembershipPending() {
  return (
    <section>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </section>
  );
}
