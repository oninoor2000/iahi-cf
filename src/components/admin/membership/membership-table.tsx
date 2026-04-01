import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  MembershipAdminListFilterInput,
  MembershipAdminListItem,
} from "@/server/api/membership.functions";
import {
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { INDONESIA_PROVINCE_OPTIONS } from "@/lib/indonesia-provinces";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import {
  membershipTableColumns,
  type MembershipTableActions,
} from "./membership-table-columns";

type MembershipTableProps = MembershipTableActions & {
  data: MembershipAdminListItem[];
  isLoading: boolean;
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: MembershipAdminListFilterInput;
  onFiltersChange: (next: MembershipAdminListFilterInput) => void;
  onCreate: () => void;
  onBulkAction: (payload: {
    action:
      | "approve"
      | "needs_correction"
      | "reject_final"
      | "delete"
      | "set_pending_review"
      | "set_pending_payment"
      | "set_active";
    selectedIds: string[];
  }) => void;
  onBulkCopyIds: (selectedIds: string[]) => void;
  onBulkExportCsv: (selectedIds: string[]) => void;
};

export function MembershipTable({
  data,
  isLoading,
  totalRows,
  page,
  pageSize,
  totalPages,
  filters,
  onFiltersChange,
  onCreate,
  onEdit,
  onDelete,
  onRevoke,
  onApprove,
  onNeedsCorrection,
  onRejectFinal,
  onView,
  onCopyId,
  onOpenProof,
  onBulkAction,
  onBulkCopyIds,
  onBulkExportCsv,
}: MembershipTableProps) {
  const [search, setSearch] = React.useState(filters.search ?? "");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [draftFilters, setDraftFilters] = React.useState<MembershipAdminListFilterInput>(filters);

  React.useEffect(() => {
    setSearch(filters.search ?? "");
  }, [filters.search]);

  React.useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (search.trim() === (filters.search ?? "")) return;
      onFiltersChange({
        ...filters,
        page: 1,
        search: search.trim() || undefined,
      });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [filters, onFiltersChange, search]);

  const sorting = React.useMemo<SortingState>(() => {
    if (!filters.sortBy) return [];
    return [
      {
        id: filters.sortBy === "userName" ? "userName" : filters.sortBy,
        desc: (filters.sortOrder ?? "desc") === "desc",
      },
    ];
  }, [filters.sortBy, filters.sortOrder]);

  const columns = React.useMemo(
    () =>
      membershipTableColumns({
        onEdit,
        onDelete,
        onRevoke,
        onApprove,
        onNeedsCorrection,
        onRejectFinal,
        onView,
        onCopyId,
        onOpenProof,
      }),
    [
      onApprove,
      onCopyId,
      onDelete,
      onEdit,
      onNeedsCorrection,
      onOpenProof,
      onRejectFinal,
      onRevoke,
      onView,
    ],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(sorting)
          : ((updater as SortingState) ?? []);
      const first = next[0];
      onFiltersChange({
        ...filters,
        page: 1,
        sortBy: (first?.id as MembershipAdminListFilterInput["sortBy"]) ?? "appliedAt",
        sortOrder: first?.desc ? "desc" : "asc",
      });
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
  });

  const selectedIds = React.useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original.id),
    [table, rowSelection],
  );
  const hasBulkSelection = selectedIds.length > 0;
  const selectedCount = selectedIds.length;

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.status) count += 1;
    if (filters.institutionType) count += 1;
    if (filters.province) count += 1;
    if (typeof filters.hasPaymentProof === "boolean") count += 1;
    if (filters.includeDeleted) count += 1;
    if (filters.appliedFrom || filters.appliedTo) count += 1;
    return count;
  }, [
    filters.appliedFrom,
    filters.appliedTo,
    filters.hasPaymentProof,
    filters.includeDeleted,
    filters.institutionType,
    filters.province,
    filters.status,
  ]);

  const resetFilters = React.useCallback(() => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize ?? 10,
      sortBy: filters.sortBy ?? "appliedAt",
      sortOrder: filters.sortOrder ?? "desc",
    });
  }, [filters.pageSize, filters.sortBy, filters.sortOrder, onFiltersChange]);

  const applyDialogFilters = React.useCallback(() => {
    onFiltersChange({
      ...filters,
      ...draftFilters,
      page: 1,
    });
    setIsFilterOpen(false);
  }, [draftFilters, filters, onFiltersChange]);

  const resetDialogFilters = React.useCallback(() => {
    const next: MembershipAdminListFilterInput = {
      ...draftFilters,
      status: undefined,
      institutionType: undefined,
      province: undefined,
      hasPaymentProof: undefined,
      includeDeleted: undefined,
      appliedFrom: undefined,
      appliedTo: undefined,
      page: 1,
    };
    setDraftFilters(next);
    onFiltersChange({
      ...filters,
      ...next,
      page: 1,
    });
  }, [draftFilters, filters, onFiltersChange]);

  return (
    <div className={`space-y-3 ${hasBulkSelection ? "pb-36 sm:pb-28" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input
          className="w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user/email/member number"
        />
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <Button variant="ghost" onClick={resetFilters}>
              Reset filters
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            Filters
            {activeFilterCount > 0 ? (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            ) : null}
          </Button>
          <Button onClick={onCreate}>Create membership</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              {Array.from({ length: Math.min(pageSize, 8) }, (_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: columns.length }, (_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[12rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-2 text-center text-xs text-muted-foreground"
                >
                  Memuat data…
                </TableCell>
              </TableRow>
            </>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No memberships found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          Showing page {page} of {totalPages} ({totalRows} records)
        </p>
        <Pagination className="mx-0 w-auto justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                size="default"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page <= 1) return;
                  onFiltersChange({ ...filters, page: page - 1 });
                }}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                size="default"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page >= totalPages) return;
                  onFiltersChange({ ...filters, page: page + 1 });
                }}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Input
            type="number"
            min={1}
            max={100}
            className="h-8 w-20"
            value={pageSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!Number.isFinite(value) || value < 1 || value > 100) return;
              onFiltersChange({ ...filters, page: 1, pageSize: value });
            }}
          />
        </div>
      </div>

      {hasBulkSelection ? (
        <div className="fixed right-3 bottom-3 left-3 z-40 flex items-center justify-between gap-2 overflow-hidden rounded-md border bg-background/95 p-2 shadow-lg backdrop-blur sm:right-6 sm:bottom-4 sm:left-6 md:left-[calc(var(--sidebar-width)+1.5rem)] md:right-6">
          <p className="hidden text-xs text-muted-foreground sm:block">
            {selectedCount} row selected (current page)
          </p>
          <div className="flex w-full items-center gap-1 overflow-x-auto sm:w-auto sm:gap-2">
            <Button
              size="sm"
              className="h-8 shrink-0 px-2 sm:px-3"
              onClick={() =>
                onBulkAction({
                  action: "approve",
                  selectedIds,
                })
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 shrink-0 px-2 sm:px-3"
              onClick={() =>
                onBulkAction({
                  action: "needs_correction",
                  selectedIds,
                })
              }
            >
              Needs correction
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="outline" aria-label="More bulk actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    onBulkAction({
                      action: "set_pending_review",
                      selectedIds,
                    })
                  }
                >
                  Set pending review
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onBulkAction({
                      action: "set_pending_payment",
                      selectedIds,
                    })
                  }
                >
                  Set pending payment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onBulkAction({
                      action: "set_active",
                      selectedIds,
                    })
                  }
                >
                  Set active
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    onBulkAction({
                      action: "reject_final",
                      selectedIds,
                    })
                  }
                  variant="destructive"
                >
                  Reject final
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onBulkCopyIds(selectedIds)}
                >
                  Copy IDs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkExportCsv(selectedIds)}>
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    onBulkAction({
                      action: "delete",
                      selectedIds,
                    })
                  }
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 px-2 sm:px-3"
              onClick={() => {
                setRowSelection({});
                table.toggleAllRowsSelected(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Table filters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={draftFilters.status ?? "all"}
                onValueChange={(value) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    status: value === "all" ? undefined : (value as typeof prev.status),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="pending_payment">Pending payment</SelectItem>
                  <SelectItem value="pending_review">Pending review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="needs_correction">Needs correction</SelectItem>
                  <SelectItem value="rejected">Rejected final</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Institution type</Label>
              <Select
                value={draftFilters.institutionType ?? "all"}
                onValueChange={(value) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    institutionType:
                      value === "all" ? undefined : (value as typeof prev.institutionType),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="individu">individu</SelectItem>
                  <SelectItem value="institusi">institusi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Province</Label>
              <Select
                value={draftFilters.province ?? "all"}
                onValueChange={(value) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    province:
                      value === "all"
                        ? undefined
                        : (value as NonNullable<
                            MembershipAdminListFilterInput["province"]
                          >),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All provinces</SelectItem>
                  {INDONESIA_PROVINCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Has payment proof</Label>
              <Select
                value={
                  typeof draftFilters.hasPaymentProof === "boolean"
                    ? String(draftFilters.hasPaymentProof)
                    : "all"
                }
                onValueChange={(value) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    hasPaymentProof:
                      value === "all" ? undefined : value === "true",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="filter-include-deleted"
                checked={Boolean(draftFilters.includeDeleted)}
                onCheckedChange={(checked) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    includeDeleted: Boolean(checked) || undefined,
                  }))
                }
              />
              <Label htmlFor="filter-include-deleted">
                Include deleted requests
              </Label>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-applied-from">Applied from</Label>
              <Input
                id="filter-applied-from"
                type="date"
                value={draftFilters.appliedFrom?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    appliedFrom: e.target.value
                      ? new Date(`${e.target.value}T00:00:00.000Z`).toISOString()
                      : undefined,
                  }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-applied-to">Applied to</Label>
              <Input
                id="filter-applied-to"
                type="date"
                value={draftFilters.appliedTo?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    appliedTo: e.target.value
                      ? new Date(`${e.target.value}T23:59:59.999Z`).toISOString()
                      : undefined,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Visible columns</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
              {table
                .getAllLeafColumns()
                .filter((column) => column.id !== "actions")
                .map((column) => {
                  const label =
                    (column.columnDef.meta as { label?: string } | undefined)
                      ?.label ?? column.id;
                  return (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(Boolean(checked))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialogFilters}>
              Reset all
            </Button>
            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyDialogFilters}>Apply filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
