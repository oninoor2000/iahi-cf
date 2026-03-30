import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SearchIcon } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

import { AgendaEventCard } from "@/components/agenda/agenda-event-card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AGENDA_EVENTS,
  agendaCategoryLabel,
  agendaFormatLabel,
  agendaYearsFromEvents,
  type AgendaCategory,
  type AgendaFormat,
} from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

const ALL = "all" as const;

type FilterOption = { value: string; label: string };

function AgendaFilterCombobox({
  id,
  labelText,
  options,
  value,
  onValueChange,
  placeholder,
  /** When true, typing filters the list (default Base UI list behavior). */
  searchable,
  /** Minimum width on `md` and up (Tailwind class). */
  minWidthClassMd,
}: {
  id: string;
  labelText: string;
  options: readonly FilterOption[];
  value: string;
  onValueChange: (next: string) => void;
  placeholder: string;
  searchable: boolean;
  minWidthClassMd: string;
}) {
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 md:w-auto lg:shrink-0">
      <Label htmlFor={id}>{labelText}</Label>
      <Combobox
        items={options}
        value={selected}
        onValueChange={(v) => {
          if (v == null) return;
          if (typeof v === "object" && v !== null && "value" in v) {
            onValueChange((v as FilterOption).value);
          }
        }}
        isItemEqualToValue={(a, b) => a.value === b.value}
        filter={searchable ? undefined : null}
        autoHighlight={searchable ? true : false}
      >
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          showClear={false}
          className={cn("h-10 min-h-10 w-full md:w-auto", minWidthClassMd)}
        />
        <ComboboxContent>
          <ComboboxList>
            {(item: FilterOption) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No matches.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

type YearFilter = typeof ALL | number;
type FormatFilter = typeof ALL | AgendaFormat;
type CategoryFilter = typeof ALL | AgendaCategory;

function filterEvents(
  query: string,
  year: YearFilter,
  format: FormatFilter,
  category: CategoryFilter,
) {
  const q = query.trim().toLowerCase();
  return AGENDA_EVENTS.filter((event) => {
    if (q.length > 0) {
      const haystack =
        `${event.title} ${event.stat} ${event.subtext}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (year !== ALL && event.year !== year) return false;
    if (format !== ALL && event.format !== format) return false;
    if (category !== ALL && event.category !== category) return false;
    return true;
  });
}

export function AgendaListPage() {
  const reduceMotion = useReducedMotion();
  const hash = useRouterState({
    select: (s) => s.location.hash,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>(ALL);
  const [formatFilter, setFormatFilter] = useState<FormatFilter>(ALL);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(ALL);

  const years = useMemo(() => agendaYearsFromEvents(AGENDA_EVENTS), []);

  const yearOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL, label: "All years" },
      ...years.map((y) => ({ value: String(y), label: String(y) })),
    ],
    [years],
  );

  const formatOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL, label: "All formats" },
      ...(Object.keys(agendaFormatLabel) as AgendaFormat[]).map((f) => ({
        value: f,
        label: agendaFormatLabel[f],
      })),
    ],
    [],
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL, label: "All types" },
      ...(Object.keys(agendaCategoryLabel) as AgendaCategory[]).map((c) => ({
        value: c,
        label: agendaCategoryLabel[c],
      })),
    ],
    [],
  );

  const filteredEvents = useMemo(() => {
    const year: YearFilter =
      yearFilter === ALL ? ALL : Number.parseInt(yearFilter, 10);
    const y = Number.isNaN(year) ? ALL : year;
    return filterEvents(searchQuery, y, formatFilter, categoryFilter);
  }, [searchQuery, yearFilter, formatFilter, categoryFilter]);

  const filteredKey = useMemo(
    () => filteredEvents.map((e) => e.slug).join(","),
    [filteredEvents],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [hash, reduceMotion, filteredKey]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    yearFilter !== ALL ||
    formatFilter !== ALL ||
    categoryFilter !== ALL;

  function clearFilters() {
    setSearchQuery("");
    setYearFilter(ALL);
    setFormatFilter(ALL);
    setCategoryFilter(ALL);
  }

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 lg:px-0">
        <header className="max-w-3xl">
          <h1 className="font-open-sans text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Agenda
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Upcoming and past events, seminars, workshops, and forums organized
            or supported by IAHI—your reference for schedules, locations, and
            how to take part.
          </p>
        </header>

        <div
          className="mt-10 flex flex-col gap-6 border border-border bg-card/30 p-4 sm:p-6 lg:flex-row lg:flex-nowrap lg:items-end lg:gap-x-4"
          aria-label="Search and filter events"
        >
          <div className="min-w-0 w-full lg:flex-1 lg:min-w-0">
            <Label htmlFor="agenda-search" className="mb-2 block">
              Search
            </Label>
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="agenda-search"
                type="search"
                placeholder="Title, date, or location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="h-10 min-h-10 pl-9 text-sm md:text-sm"
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 md:flex-row md:flex-wrap md:gap-6 lg:w-auto lg:flex-nowrap lg:gap-x-4">
            <AgendaFilterCombobox
              id="agenda-filter-year"
              labelText="Year"
              options={yearOptions}
              value={yearFilter}
              onValueChange={setYearFilter}
              placeholder="Search or choose year…"
              searchable
              minWidthClassMd="md:min-w-34"
            />
            <AgendaFilterCombobox
              id="agenda-filter-format"
              labelText="Format"
              options={formatOptions}
              value={formatFilter}
              onValueChange={(v) => setFormatFilter(v as FormatFilter)}
              placeholder="Choose format…"
              searchable={false}
              minWidthClassMd="md:min-w-40"
            />
            <AgendaFilterCombobox
              id="agenda-filter-category"
              labelText="Type"
              options={categoryOptions}
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
              placeholder="Choose type…"
              searchable={false}
              minWidthClassMd="md:min-w-42"
            />
          </div>

          {hasActiveFilters ? (
            <div className="w-full shrink-0 sm:ml-auto sm:w-auto lg:ml-auto lg:w-auto">
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="mt-12 rounded-none border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No events match your search and filters.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try different keywords or reset the filters.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex h-10 min-h-10 items-center justify-center border border-input bg-background px-4 text-xs font-medium transition-colors hover:bg-muted/80"
              >
                Clear all
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filteredEvents.map((event) => (
              <AgendaEventCard key={event.slug} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
