import * as React from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  Eye,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  Moon,
  Lock,
  Globe2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AdminApi, type AdminDream, type AdminTrendMetric } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusCard from "@/components/ui/StatusCard";

const copy = {
  he: {
    eyebrow: "ניהול מערכת",
    title: "מסך אדמין",
    subtitle:
      "שליטה מלאה על חלומות, מחיקה מבוקרת ומדדים חיים על משתמשים, חלומות וכניסות לאתר.",
    refresh: "רענון",
    loading: "טוען נתוני אדמין...",
    errorTitle: "לא הצלחנו לטעון את מסך האדמין",
    retry: "נסה שוב",
    totals: {
      users: "משתמשים",
      dreams: "חלומות",
      visits: "כניסות לאתר",
      shared: "חלומות משותפים",
    },
    metrics: {
      newUsers: "משתמשים חדשים",
      newDreams: "חלומות חדשים",
      visits: "כניסות חדשות",
      privateDreams: "חלומות פרטיים",
      period: "{{days}} ימים אחרונים",
      previous: "מול התקופה הקודמת",
      new: "חדש",
    },
    chart: {
      title: "מגמות יומיות",
      users: "משתמשים",
      dreams: "חלומות",
      visits: "כניסות",
    },
    categories: {
      title: "נושאים מובילים",
      empty: "אין עדיין מספיק נתונים לקטגוריות.",
    },
    dreams: {
      title: "כל החלומות במערכת",
      subtitle: "כולל חלומות פרטיים. מחיקה כאן היא פעולה סופית.",
      searchPlaceholder: "חפש לפי כותרת, חלום, פירוש או סמל...",
      search: "חיפוש",
      clear: "נקה",
      all: "הכל",
      shared: "משותפים",
      private: "פרטיים",
      owner: "משתמש",
      status: "סטטוס",
      created: "נוצר",
      actions: "פעולות",
      open: "פתח",
      delete: "מחק",
      deleteConfirm: "למחוק את החלום הזה לצמיתות?",
      deleteSuccess: "החלום נמחק",
      deleteError: "מחיקה נכשלה",
      empty: "אין חלומות להצגה.",
      page: "עמוד {{page}} מתוך {{pages}}",
      prev: "הקודם",
      next: "הבא",
      unknownOwner: "משתמש לא ידוע",
    },
  },
  en: {
    eyebrow: "System management",
    title: "Admin dashboard",
    subtitle:
      "Full control over dreams, moderated deletion, and live metrics for users, dreams, and site visits.",
    refresh: "Refresh",
    loading: "Loading admin data...",
    errorTitle: "Could not load the admin dashboard",
    retry: "Try again",
    totals: {
      users: "Users",
      dreams: "Dreams",
      visits: "Site visits",
      shared: "Shared dreams",
    },
    metrics: {
      newUsers: "New users",
      newDreams: "New dreams",
      visits: "New visits",
      privateDreams: "Private dreams",
      period: "Last {{days}} days",
      previous: "vs previous period",
      new: "new",
    },
    chart: {
      title: "Daily trends",
      users: "Users",
      dreams: "Dreams",
      visits: "Visits",
    },
    categories: {
      title: "Top themes",
      empty: "Not enough category data yet.",
    },
    dreams: {
      title: "All dreams in the system",
      subtitle: "Includes private dreams. Deleting here is final.",
      searchPlaceholder: "Search title, dream, interpretation, or symbol...",
      search: "Search",
      clear: "Clear",
      all: "All",
      shared: "Shared",
      private: "Private",
      owner: "User",
      status: "Status",
      created: "Created",
      actions: "Actions",
      open: "Open",
      delete: "Delete",
      deleteConfirm: "Delete this dream permanently?",
      deleteSuccess: "Dream deleted",
      deleteError: "Delete failed",
      empty: "No dreams to show.",
      page: "Page {{page}} of {{pages}}",
      prev: "Previous",
      next: "Next",
      unknownOwner: "Unknown user",
    },
  },
};

type Filter = "all" | "shared" | "private";

export default function AdminPage() {
  const { i18n } = useTranslation();
  const text = i18n.language?.startsWith("he") ? copy.he : copy.en;
  const qc = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const limit = 12;

  const isShared =
    filter === "all" ? undefined : filter === "shared" ? true : false;

  const overviewQuery = useQuery({
    queryKey: ["admin-overview", 30],
    queryFn: () => AdminApi.getOverview(30),
    staleTime: 30000,
  });

  const dreamsQuery = useQuery({
    queryKey: ["admin-dreams", page, limit, search, filter],
    queryFn: () =>
      AdminApi.listDreams({
        page,
        limit,
        search: search || undefined,
        isShared,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminApi.deleteDream(id),
    onSuccess: () => {
      toast.success(text.dreams.deleteSuccess);
      qc.invalidateQueries({ queryKey: ["admin-dreams"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error(text.dreams.deleteError),
  });

  const overview = overviewQuery.data;
  const dreams = dreamsQuery.data?.dreams ?? [];
  const total = dreamsQuery.data?.total ?? 0;
  const pages = dreamsQuery.data?.pages ?? 1;

  const onSearch = () => {
    setPage(1);
    setSearch(query.trim());
  };

  const onClear = () => {
    setPage(1);
    setQuery("");
    setSearch("");
  };

  const onDelete = (dream: AdminDream) => {
    if (!window.confirm(text.dreams.deleteConfirm)) return;
    deleteMutation.mutate(dream._id);
  };

  return (
    <main dir={i18n.dir()} className="mx-auto max-w-7xl px-4 pb-20">
      <section className="mb-6 border-b border-black/10 py-6 dark:border-white/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              {text.eyebrow}
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-950 dark:text-white md:text-4xl">
              {text.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/65 md:text-base">
              {text.subtitle}
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              overviewQuery.refetch();
              dreamsQuery.refetch();
            }}
            disabled={overviewQuery.isFetching || dreamsQuery.isFetching}
          >
            {(overviewQuery.isFetching || dreamsQuery.isFetching) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {text.refresh}
          </Button>
        </div>
      </section>

      {overviewQuery.isLoading ? (
        <StatusCard tone="loading" title={text.loading} />
      ) : overviewQuery.error || !overview ? (
        <StatusCard
          tone="error"
          title={text.errorTitle}
          actionLabel={text.retry}
          onAction={() => overviewQuery.refetch()}
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TotalCard
              icon={Users}
              label={text.totals.users}
              value={overview.totals.users}
              metric={overview.metrics.newUsers}
              metricLabel={text.metrics.newUsers}
              period={text.metrics.period.replace("{{days}}", String(overview.windowDays))}
              previousLabel={text.metrics.previous}
              newLabel={text.metrics.new}
              tone="emerald"
            />
            <TotalCard
              icon={Moon}
              label={text.totals.dreams}
              value={overview.totals.dreams}
              metric={overview.metrics.newDreams}
              metricLabel={text.metrics.newDreams}
              period={text.metrics.period.replace("{{days}}", String(overview.windowDays))}
              previousLabel={text.metrics.previous}
              newLabel={text.metrics.new}
              tone="amber"
            />
            <TotalCard
              icon={Eye}
              label={text.totals.visits}
              value={overview.totals.visits}
              metric={overview.metrics.siteVisits}
              metricLabel={text.metrics.visits}
              period={text.metrics.period.replace("{{days}}", String(overview.windowDays))}
              previousLabel={text.metrics.previous}
              newLabel={text.metrics.new}
              tone="sky"
            />
            <div className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-600 dark:text-white/65">
                  {text.totals.shared}
                </div>
                <Globe2 className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              </div>
              <div className="text-3xl font-extrabold text-slate-950 dark:text-white">
                {formatNumber(overview.totals.sharedDreams)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-white/55">
                <Lock className="h-4 w-4" />
                {text.metrics.privateDreams}:{" "}
                <span className="font-bold text-slate-800 dark:text-white/80">
                  {formatNumber(overview.totals.privateDreams)}
                </span>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <TrendPanel overview={overview} text={text} />
            <CategoryPanel overview={overview} text={text} />
          </section>
        </>
      )}

      <section className="mt-8 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
              {text.dreams.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
              {text.dreams.subtitle}
            </p>
          </div>
          <div className="text-sm text-slate-500 dark:text-white/55">
            {formatNumber(total)} · {text.dreams.page
              .replace("{{page}}", String(page))
              .replace("{{pages}}", String(pages))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05] lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-2xl">
            <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500 dark:text-white/55" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSearch();
                if (event.key === "Escape") onClear();
              }}
              placeholder={text.dreams.searchPlaceholder}
              className="h-11 rounded-lg border-black/10 bg-white pr-10 dark:border-white/10 dark:bg-white/[0.08]"
            />
            {query && (
              <button
                type="button"
                onClick={onClear}
                className="absolute left-2 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                aria-label={text.dreams.clear}
                title={text.dreams.clear}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 rounded-lg border border-black/10 bg-white p-1 dark:border-white/10 dark:bg-white/[0.06]">
              {(["all", "shared", "private"] as Filter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setFilter(item);
                    setPage(1);
                  }}
                  className={[
                    "h-9 rounded-md px-3 text-sm font-semibold transition-colors",
                    filter === item
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-black/5 dark:text-white/65 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  {text.dreams[item]}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={onSearch}
              disabled={dreamsQuery.isFetching}
              className="gap-2 text-white"
            >
              {dreamsQuery.isFetching && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {text.dreams.search}
            </Button>
          </div>
        </div>

        {dreamsQuery.isLoading ? (
          <div className="h-80 animate-pulse rounded-lg border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.05]" />
        ) : dreamsQuery.error ? (
          <StatusCard
            tone="error"
            title={text.errorTitle}
            actionLabel={text.retry}
            onAction={() => dreamsQuery.refetch()}
          />
        ) : dreams.length === 0 ? (
          <StatusCard tone="empty" title={text.dreams.empty} />
        ) : (
          <DreamsTable
            dreams={dreams}
            text={text}
            onDelete={onDelete}
            deletingId={deleteMutation.variables}
            deleting={deleteMutation.isPending}
          />
        )}

        {pages > 1 && (
          <nav className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {text.dreams.prev}
            </Button>
            <span className="text-sm font-semibold text-slate-600 dark:text-white/65">
              {text.dreams.page
                .replace("{{page}}", String(page))
                .replace("{{pages}}", String(pages))}
            </span>
            <Button
              variant="outline"
              disabled={page >= pages}
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
            >
              {text.dreams.next}
            </Button>
          </nav>
        )}
      </section>
    </main>
  );
}

function TotalCard({
  icon: Icon,
  label,
  value,
  metric,
  metricLabel,
  period,
  previousLabel,
  newLabel,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  metric: AdminTrendMetric;
  metricLabel: string;
  period: string;
  previousLabel: string;
  newLabel: string;
  tone: "emerald" | "amber" | "sky";
}) {
  const toneClass = {
    emerald: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-200",
    amber: "text-amber-700 bg-amber-500/10 dark:text-amber-200",
    sky: "text-sky-700 bg-sky-500/10 dark:text-sky-200",
  }[tone];

  return (
    <div className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-600 dark:text-white/65">
          {label}
        </div>
        <span className={`rounded-md p-2 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="text-3xl font-extrabold text-slate-950 dark:text-white">
        {formatNumber(value)}
      </div>
      <div className="mt-3 rounded-md bg-black/[0.03] px-3 py-2 text-sm dark:bg-white/[0.05]">
        <div className="font-bold text-slate-800 dark:text-white/85">
          {metricLabel}: {formatNumber(metric.current)}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-white/55">
          <span>{period}</span>
          <span>·</span>
          <span>
            {formatDelta(metric, newLabel)} {previousLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function TrendPanel({
  overview,
  text,
}: {
  overview: NonNullable<Awaited<ReturnType<typeof AdminApi.getOverview>>>;
  text: typeof copy.he;
}) {
  const max = Math.max(
    1,
    ...overview.series.map((row) =>
      Math.max(row.users, row.dreams, row.visits)
    )
  );

  return (
    <section className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950 dark:text-white">
          <BarChart3 className="h-5 w-5 text-sky-600 dark:text-sky-300" />
          {text.chart.title}
        </h2>
        <CalendarDays className="h-5 w-5 text-slate-400 dark:text-white/45" />
      </div>

      <div className="space-y-3">
        {overview.series.map((row) => (
          <div
            key={row.day}
            className="grid grid-cols-[86px_minmax(0,1fr)] items-center gap-3"
          >
            <div className="text-xs font-semibold text-slate-500 dark:text-white/55">
              {row.day.slice(5)}
            </div>
            <div className="grid gap-1">
              <SeriesBar
                value={row.users}
                max={max}
                label={text.chart.users}
                className="bg-emerald-500"
              />
              <SeriesBar
                value={row.dreams}
                max={max}
                label={text.chart.dreams}
                className="bg-amber-500"
              />
              <SeriesBar
                value={row.visits}
                max={max}
                label={text.chart.visits}
                className="bg-sky-500"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeriesBar({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full ${className}`}
          style={{ width: `${Math.max(3, (value / max) * 100)}%` }}
        />
      </div>
      <span className="w-20 text-xs text-slate-500 dark:text-white/55">
        {label}: {formatNumber(value)}
      </span>
    </div>
  );
}

function CategoryPanel({
  overview,
  text,
}: {
  overview: NonNullable<Awaited<ReturnType<typeof AdminApi.getOverview>>>;
  text: typeof copy.he;
}) {
  return (
    <section className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.06]">
      <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
        {text.categories.title}
      </h2>
      {overview.topCategories.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-white/55">
          {text.categories.empty}
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {overview.topCategories.map((row, index) => (
            <div
              key={row.category}
              className="flex items-center justify-between gap-3 rounded-md border border-black/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]"
            >
              <span className="min-w-0 truncate text-sm font-bold text-slate-800 dark:text-white/85">
                {index + 1}. {row.category}
              </span>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-bold text-violet-700 dark:text-violet-200">
                {formatNumber(row.count)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DreamsTable({
  dreams,
  text,
  onDelete,
  deletingId,
  deleting,
}: {
  dreams: AdminDream[];
  text: typeof copy.he;
  onDelete: (dream: AdminDream) => void;
  deletingId?: string;
  deleting: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <table className="min-w-[900px] w-full border-collapse text-sm">
        <thead className="border-b border-black/10 bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
          <tr>
            <th className="px-4 py-3 text-right">{text.dreams.title}</th>
            <th className="px-4 py-3 text-right">{text.dreams.owner}</th>
            <th className="px-4 py-3 text-right">{text.dreams.status}</th>
            <th className="px-4 py-3 text-right">{text.dreams.created}</th>
            <th className="px-4 py-3 text-right">{text.dreams.actions}</th>
          </tr>
        </thead>
        <tbody>
          {dreams.map((dream) => {
            const ownerName =
              [dream.user?.firstName, dream.user?.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || text.dreams.unknownOwner;
            const isDeleting = deleting && deletingId === dream._id;

            return (
              <tr
                key={dream._id}
                className="border-b border-black/5 last:border-b-0 hover:bg-black/[0.02] dark:border-white/5 dark:hover:bg-white/[0.04]"
              >
                <td className="max-w-[360px] px-4 py-3 align-top">
                  <Link
                    to={`/dreams/${dream._id}`}
                    className="font-extrabold text-slate-950 hover:text-amber-700 dark:text-white dark:hover:text-amber-200"
                  >
                    {dream.title || "Untitled"}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-white/55">
                    {dream.userInput}
                  </p>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="font-bold text-slate-800 dark:text-white/85">
                    {ownerName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/55">
                    {dream.user?.email || dream.userId}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
                      dream.isShared
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                        : "bg-slate-500/10 text-slate-700 dark:text-white/70",
                    ].join(" ")}
                  >
                    {dream.isShared ? (
                      <Globe2 className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    {dream.isShared ? text.dreams.shared : text.dreams.private}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-slate-600 dark:text-white/60">
                  {formatDate(dream.createdAt)}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dreams/${dream._id}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 px-3 text-sm font-semibold hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                    >
                      {text.dreams.open}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(dream)}
                      disabled={isDeleting}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-rose-500/30 px-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {text.dreams.delete}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value || 0);
}

function formatDelta(metric: AdminTrendMetric, newLabel: string) {
  if (metric.percentChange === null) return newLabel;
  const prefix = metric.delta > 0 ? "+" : "";
  return `${prefix}${metric.delta} (${prefix}${metric.percentChange}%)`;
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
