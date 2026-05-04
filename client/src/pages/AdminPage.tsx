import * as React from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Globe2,
  LayoutDashboard,
  Loader2,
  Lock,
  Moon,
  PieChart,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AdminApi } from "@/lib/api/admin";
import type {
  AdminDream,
  AdminOverview,
  AdminTrendMetric,
  AdminUser,
} from "@/lib/api/admin";
import type { UserRole } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusCard from "@/components/ui/StatusCard";

type TabKey = "analytics" | "dreams" | "users";
type DreamFilter = "all" | "shared" | "private";
type UserFilter = "all" | UserRole;

const copy = {
  he: {
    title: "מסך אדמין",
    eyebrow: "ניהול מערכת",
    subtitle:
      "CRM תפעולי לניהול חלומות, משתמשים והרשאות, עם מגמות ברורות במקום רשימות עמוסות.",
    refresh: "רענון",
    loading: "טוען נתוני אדמין...",
    errorTitle: "לא הצלחנו לטעון את מסך האדמין",
    retry: "נסה שוב",
    tabs: {
      analytics: "מגמות",
      dreams: "חלומות",
      users: "משתמשים",
    },
    totals: {
      users: "משתמשים",
      dreams: "חלומות",
      visits: "כניסות לאתר",
      shared: "משותפים",
    },
    metrics: {
      newUsers: "משתמשים חדשים",
      newDreams: "חלומות חדשים",
      visits: "כניסות חדשות",
      period: "{{days}} ימים",
      previous: "מול תקופה קודמת",
      new: "חדש",
    },
    chart: {
      title: "מגמות לפי יום",
      subtitle: "משתמשים, חלומות וכניסות ב־30 הימים האחרונים",
      users: "משתמשים",
      dreams: "חלומות",
      visits: "כניסות",
      empty: "אין עדיין מספיק נתונים לגרף.",
    },
    donut: {
      title: "חלוקת חלומות",
      shared: "משותפים",
      private: "פרטיים",
    },
    categories: {
      title: "נושאי חלום מובילים",
      empty: "אין עדיין מספיק נתונים לקטגוריות.",
    },
    dreams: {
      title: "ניהול חלומות",
      subtitle: "הצגה מדורגת של חלומות עם חיפוש, סטטוס ומחיקה מבוקרת.",
      searchPlaceholder: "חיפוש לפי כותרת, חלום, פירוש או סמל...",
      search: "חפש",
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
      unknownOwner: "משתמש לא ידוע",
    },
    users: {
      title: "ניהול משתמשים",
      subtitle: "רשימת משתמשים מפוג׳נטת עם אפשרות להפוך משתמש לאדמין או להחזיר למשתמש רגיל.",
      searchPlaceholder: "חיפוש לפי שם או אימייל...",
      search: "חפש",
      clear: "נקה",
      all: "הכל",
      admin: "אדמינים",
      user: "משתמשים",
      name: "שם",
      email: "אימייל",
      role: "הרשאה",
      joined: "הצטרף",
      status: "סטטוס",
      actions: "פעולות",
      active: "פעיל",
      inactive: "לא פעיל",
      makeAdmin: "הפוך לאדמין",
      makeUser: "הפוך למשתמש",
      roleConfirm: "לעדכן את ההרשאה של המשתמש?",
      roleSuccess: "הרשאת המשתמש עודכנה",
      roleError: "עדכון הרשאה נכשל",
      empty: "אין משתמשים להצגה.",
    },
    pagination: {
      first: "ראשון",
      prev: "הקודם",
      next: "הבא",
      last: "אחרון",
      summary: "{{from}}-{{to}} מתוך {{total}}",
      page: "עמוד {{page}} מתוך {{pages}}",
    },
  },
  en: {
    title: "Admin dashboard",
    eyebrow: "System management",
    subtitle:
      "An operational CRM for dreams, users, and roles, with clear trends instead of overloaded lists.",
    refresh: "Refresh",
    loading: "Loading admin data...",
    errorTitle: "Could not load the admin dashboard",
    retry: "Try again",
    tabs: {
      analytics: "Trends",
      dreams: "Dreams",
      users: "Users",
    },
    totals: {
      users: "Users",
      dreams: "Dreams",
      visits: "Site visits",
      shared: "Shared",
    },
    metrics: {
      newUsers: "New users",
      newDreams: "New dreams",
      visits: "New visits",
      period: "{{days}} days",
      previous: "vs previous period",
      new: "new",
    },
    chart: {
      title: "Daily trends",
      subtitle: "Users, dreams, and visits over the last 30 days",
      users: "Users",
      dreams: "Dreams",
      visits: "Visits",
      empty: "Not enough data for the chart yet.",
    },
    donut: {
      title: "Dream split",
      shared: "Shared",
      private: "Private",
    },
    categories: {
      title: "Top dream themes",
      empty: "Not enough category data yet.",
    },
    dreams: {
      title: "Dream management",
      subtitle: "Paged dream moderation with search, status, and controlled deletion.",
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
      unknownOwner: "Unknown user",
    },
    users: {
      title: "User management",
      subtitle: "Paged user list with the ability to promote admins or return them to regular users.",
      searchPlaceholder: "Search by name or email...",
      search: "Search",
      clear: "Clear",
      all: "All",
      admin: "Admins",
      user: "Users",
      name: "Name",
      email: "Email",
      role: "Role",
      joined: "Joined",
      status: "Status",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      makeAdmin: "Make admin",
      makeUser: "Make user",
      roleConfirm: "Update this user's role?",
      roleSuccess: "User role updated",
      roleError: "Role update failed",
      empty: "No users to show.",
    },
    pagination: {
      first: "First",
      prev: "Previous",
      next: "Next",
      last: "Last",
      summary: "{{from}}-{{to}} of {{total}}",
      page: "Page {{page}} of {{pages}}",
    },
  },
};

type Text = typeof copy.he;

export default function AdminPage() {
  const { i18n } = useTranslation();
  const text = i18n.language?.startsWith("he") ? copy.he : copy.en;
  const qc = useQueryClient();

  const [tab, setTab] = React.useState<TabKey>("analytics");
  const [dreamPage, setDreamPage] = React.useState(1);
  const [dreamQuery, setDreamQuery] = React.useState("");
  const [dreamSearch, setDreamSearch] = React.useState("");
  const [dreamFilter, setDreamFilter] = React.useState<DreamFilter>("all");
  const [userPage, setUserPage] = React.useState(1);
  const [userQuery, setUserQuery] = React.useState("");
  const [userSearch, setUserSearch] = React.useState("");
  const [userFilter, setUserFilter] = React.useState<UserFilter>("all");

  const pageSize = 8;
  const isShared =
    dreamFilter === "all" ? undefined : dreamFilter === "shared";
  const role = userFilter === "all" ? undefined : userFilter;

  const overviewQuery = useQuery({
    queryKey: ["admin-overview", 30],
    queryFn: () => AdminApi.getOverview(30),
    staleTime: 30000,
  });

  const dreamsQuery = useQuery({
    queryKey: ["admin-dreams", dreamPage, pageSize, dreamSearch, dreamFilter],
    enabled: tab === "dreams",
    queryFn: () =>
      AdminApi.listDreams({
        page: dreamPage,
        limit: pageSize,
        search: dreamSearch || undefined,
        isShared,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", userPage, pageSize, userSearch, userFilter],
    enabled: tab === "users",
    queryFn: () =>
      AdminApi.listUsers({
        page: userPage,
        limit: pageSize,
        search: userSearch || undefined,
        role,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const deleteDreamMutation = useMutation({
    mutationFn: (id: string) => AdminApi.deleteDream(id),
    onSuccess: () => {
      toast.success(text.dreams.deleteSuccess);
      qc.invalidateQueries({ queryKey: ["admin-dreams"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error(text.dreams.deleteError),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      AdminApi.updateUserRole(id, role),
    onSuccess: () => {
      toast.success(text.users.roleSuccess);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error(text.users.roleError),
  });

  const overview = overviewQuery.data;

  const refreshActive = () => {
    overviewQuery.refetch();
    if (tab === "dreams") dreamsQuery.refetch();
    if (tab === "users") usersQuery.refetch();
  };

  const onDeleteDream = (dream: AdminDream) => {
    if (!window.confirm(text.dreams.deleteConfirm)) return;
    deleteDreamMutation.mutate(dream._id);
  };

  const onUpdateRole = (user: AdminUser) => {
    if (!window.confirm(text.users.roleConfirm)) return;
    updateRoleMutation.mutate({
      id: user._id,
      role: user.role === "admin" ? "user" : "admin",
    });
  };

  return (
    <main dir={i18n.dir()} className="mx-auto max-w-7xl px-4 pb-20">
      <section className="mb-5 border-b border-black/10 py-6 dark:border-white/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-200">
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
            onClick={refreshActive}
            disabled={
              overviewQuery.isFetching ||
              dreamsQuery.isFetching ||
              usersQuery.isFetching
            }
          >
            {(overviewQuery.isFetching ||
              dreamsQuery.isFetching ||
              usersQuery.isFetching) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {text.refresh}
          </Button>
        </div>
      </section>

      <nav className="mb-6 grid grid-cols-3 gap-2 rounded-lg border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[0.05] md:inline-grid md:min-w-[420px]">
        {(["analytics", "dreams", "users"] as TabKey[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={[
              "inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-extrabold transition-colors",
              tab === item
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-black/5 dark:text-white/65 dark:hover:bg-white/10",
            ].join(" ")}
          >
            {item === "analytics" && <BarChart3 className="h-4 w-4" />}
            {item === "dreams" && <Moon className="h-4 w-4" />}
            {item === "users" && <UserCog className="h-4 w-4" />}
            {text.tabs[item]}
          </button>
        ))}
      </nav>

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
          <MetricStrip overview={overview} text={text} />
          {tab === "analytics" && <AnalyticsPanel overview={overview} text={text} />}
          {tab === "dreams" && (
            <DreamsPanel
              text={text}
              pageSize={pageSize}
              query={dreamQuery}
              setQuery={setDreamQuery}
              search={dreamSearch}
              setSearch={setDreamSearch}
              filter={dreamFilter}
              setFilter={setDreamFilter}
              page={dreamPage}
              setPage={setDreamPage}
              data={dreamsQuery.data}
              isLoading={dreamsQuery.isLoading}
              isFetching={dreamsQuery.isFetching}
              error={dreamsQuery.error}
              refetch={() => dreamsQuery.refetch()}
              deletingId={deleteDreamMutation.variables}
              deleting={deleteDreamMutation.isPending}
              onDelete={onDeleteDream}
            />
          )}
          {tab === "users" && (
            <UsersPanel
              text={text}
              pageSize={pageSize}
              query={userQuery}
              setQuery={setUserQuery}
              search={userSearch}
              setSearch={setUserSearch}
              filter={userFilter}
              setFilter={setUserFilter}
              page={userPage}
              setPage={setUserPage}
              data={usersQuery.data}
              isLoading={usersQuery.isLoading}
              isFetching={usersQuery.isFetching}
              error={usersQuery.error}
              refetch={() => usersQuery.refetch()}
              changingId={updateRoleMutation.variables?.id}
              changing={updateRoleMutation.isPending}
              onUpdateRole={onUpdateRole}
            />
          )}
        </>
      )}
    </main>
  );
}

function MetricStrip({ overview, text }: { overview: AdminOverview; text: Text }) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        icon={Users}
        label={text.totals.users}
        value={overview.totals.users}
        metric={overview.metrics.newUsers}
        metricLabel={text.metrics.newUsers}
        text={text}
        tone="emerald"
      />
      <MetricTile
        icon={Moon}
        label={text.totals.dreams}
        value={overview.totals.dreams}
        metric={overview.metrics.newDreams}
        metricLabel={text.metrics.newDreams}
        text={text}
        tone="amber"
      />
      <MetricTile
        icon={Eye}
        label={text.totals.visits}
        value={overview.totals.visits}
        metric={overview.metrics.siteVisits}
        metricLabel={text.metrics.visits}
        text={text}
        tone="sky"
      />
      <div className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-600 dark:text-white/65">
            {text.totals.shared}
          </div>
          <Globe2 className="h-5 w-5 text-violet-600 dark:text-violet-300" />
        </div>
        <div className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white">
          {formatNumber(overview.totals.sharedDreams)}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-white/55">
          <Lock className="h-4 w-4" />
          {text.donut.private}:{" "}
          <span className="font-bold text-slate-800 dark:text-white/80">
            {formatNumber(overview.totals.privateDreams)}
          </span>
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  metric,
  metricLabel,
  text,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  metric: AdminTrendMetric;
  metricLabel: string;
  text: Text;
  tone: "emerald" | "amber" | "sky";
}) {
  const toneClass = {
    emerald: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-200",
    amber: "text-amber-700 bg-amber-500/10 dark:text-amber-200",
    sky: "text-sky-700 bg-sky-500/10 dark:text-sky-200",
  }[tone];

  return (
    <div className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-600 dark:text-white/65">
          {label}
        </div>
        <span className={`rounded-md p-2 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white">
        {formatNumber(value)}
      </div>
      <div className="mt-2 text-sm text-slate-600 dark:text-white/60">
        <span className="font-bold text-slate-900 dark:text-white">
          {metricLabel}: {formatNumber(metric.current)}
        </span>{" "}
        · {formatDelta(metric, text.metrics.new)} {text.metrics.previous}
      </div>
    </div>
  );
}

function AnalyticsPanel({ overview, text }: { overview: AdminOverview; text: Text }) {
  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <LineChartPanel overview={overview} text={text} />
      <div className="space-y-5">
        <DonutPanel overview={overview} text={text} />
        <CategoryPanel overview={overview} text={text} />
      </div>
    </section>
  );
}

function LineChartPanel({ overview, text }: { overview: AdminOverview; text: Text }) {
  const width = 760;
  const height = 280;
  const padding = 34;
  const rows = overview.series;
  const max = Math.max(
    1,
    ...rows.flatMap((row) => [row.users, row.dreams, row.visits])
  );

  const points = (key: "users" | "dreams" | "visits") =>
    rows
      .map((row, index) => {
        const x =
          rows.length <= 1
            ? width / 2
            : padding + (index / (rows.length - 1)) * (width - padding * 2);
        const y =
          height -
          padding -
          (Number(row[key] || 0) / max) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <section className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950 dark:text-white">
            <BarChart3 className="h-5 w-5 text-sky-600 dark:text-sky-300" />
            {text.chart.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/55">
            {text.chart.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <LegendDot className="bg-emerald-500" label={text.chart.users} />
          <LegendDot className="bg-amber-500" label={text.chart.dreams} />
          <LegendDot className="bg-sky-500" label={text.chart.visits} />
        </div>
      </div>

      {rows.length === 0 ? (
        <StatusCard tone="empty" title={text.chart.empty} compact />
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[280px] min-w-[720px] w-full"
            role="img"
            aria-label={text.chart.title}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - padding - ratio * (height - padding * 2);
              return (
                <g key={ratio}>
                  <line
                    x1={padding}
                    x2={width - padding}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-white/10"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[11px] dark:fill-white/40"
                  >
                    {Math.round(max * ratio)}
                  </text>
                </g>
              );
            })}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points("users")}
            />
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points("dreams")}
            />
            <polyline
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points("visits")}
            />
            {rows.map((row, index) => {
              if (index % Math.ceil(Math.max(1, rows.length / 8)) !== 0) {
                return null;
              }
              const x =
                rows.length <= 1
                  ? width / 2
                  : padding + (index / (rows.length - 1)) * (width - padding * 2);
              return (
                <text
                  key={row.day}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px] dark:fill-white/40"
                >
                  {row.day.slice(5)}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 py-1 text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/65">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function DonutPanel({ overview, text }: { overview: AdminOverview; text: Text }) {
  const shared = overview.totals.sharedDreams;
  const privateCount = overview.totals.privateDreams;
  const total = Math.max(1, shared + privateCount);
  const sharedPercent = Math.round((shared / total) * 100);

  return (
    <section className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950 dark:text-white">
        <PieChart className="h-5 w-5 text-violet-600 dark:text-violet-300" />
        {text.donut.title}
      </h2>
      <div className="mt-5 flex items-center justify-center">
        <div
          className="grid h-44 w-44 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#10b981 0 ${sharedPercent}%, #64748b ${sharedPercent}% 100%)`,
          }}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center shadow-inner dark:bg-slate-950">
            <div>
              <div className="text-2xl font-extrabold text-slate-950 dark:text-white">
                {sharedPercent}%
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-white/55">
                {text.donut.shared}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <SplitStat
          label={text.donut.shared}
          value={shared}
          className="bg-emerald-500"
        />
        <SplitStat
          label={text.donut.private}
          value={privateCount}
          className="bg-slate-500"
        />
      </div>
    </section>
  );
}

function SplitStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-white/55">
        <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
        {label}
      </div>
      <div className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">
        {formatNumber(value)}
      </div>
    </div>
  );
}

function CategoryPanel({ overview, text }: { overview: AdminOverview; text: Text }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
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
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-black/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]"
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

function DreamsPanel({
  text,
  pageSize,
  query,
  setQuery,
  setSearch,
  filter,
  setFilter,
  page,
  setPage,
  data,
  isLoading,
  isFetching,
  error,
  refetch,
  deletingId,
  deleting,
  onDelete,
}: {
  text: Text;
  pageSize: number;
  query: string;
  setQuery: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  filter: DreamFilter;
  setFilter: (value: DreamFilter) => void;
  page: number;
  setPage: (value: number | ((current: number) => number)) => void;
  data?: Awaited<ReturnType<typeof AdminApi.listDreams>>;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
  deletingId?: string;
  deleting: boolean;
  onDelete: (dream: AdminDream) => void;
}) {
  const dreams = data?.dreams ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const submitSearch = () => {
    setPage(1);
    setSearch(query.trim());
  };

  const clearSearch = () => {
    setPage(1);
    setQuery("");
    setSearch("");
  };

  return (
    <section className="space-y-4">
      <PanelHeader
        title={text.dreams.title}
        subtitle={text.dreams.subtitle}
        total={total}
        page={page}
        pages={pages}
        text={text}
      />

      <Toolbar
        query={query}
        setQuery={setQuery}
        onSearch={submitSearch}
        onClear={clearSearch}
        placeholder={text.dreams.searchPlaceholder}
        searchLabel={text.dreams.search}
        clearLabel={text.dreams.clear}
        isFetching={isFetching}
      >
        <SegmentedFilter
          value={filter}
          options={[
            ["all", text.dreams.all],
            ["shared", text.dreams.shared],
            ["private", text.dreams.private],
          ]}
          onChange={(next) => {
            setFilter(next as DreamFilter);
            setPage(1);
          }}
        />
      </Toolbar>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <StatusCard
          tone="error"
          title={text.errorTitle}
          actionLabel={text.retry}
          onAction={refetch}
        />
      ) : dreams.length === 0 ? (
        <StatusCard tone="empty" title={text.dreams.empty} />
      ) : (
        <DreamsTable
          dreams={dreams}
          text={text}
          onDelete={onDelete}
          deletingId={deletingId}
          deleting={deleting}
        />
      )}

      <PageControls
        page={page}
        pages={pages}
        total={total}
        limit={pageSize}
        onPage={setPage}
        text={text}
      />
    </section>
  );
}

function UsersPanel({
  text,
  pageSize,
  query,
  setQuery,
  setSearch,
  filter,
  setFilter,
  page,
  setPage,
  data,
  isLoading,
  isFetching,
  error,
  refetch,
  changingId,
  changing,
  onUpdateRole,
}: {
  text: Text;
  pageSize: number;
  query: string;
  setQuery: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  filter: UserFilter;
  setFilter: (value: UserFilter) => void;
  page: number;
  setPage: (value: number | ((current: number) => number)) => void;
  data?: Awaited<ReturnType<typeof AdminApi.listUsers>>;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
  changingId?: string;
  changing: boolean;
  onUpdateRole: (user: AdminUser) => void;
}) {
  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const submitSearch = () => {
    setPage(1);
    setSearch(query.trim());
  };

  const clearSearch = () => {
    setPage(1);
    setQuery("");
    setSearch("");
  };

  return (
    <section className="space-y-4">
      <PanelHeader
        title={text.users.title}
        subtitle={text.users.subtitle}
        total={total}
        page={page}
        pages={pages}
        text={text}
      />

      <Toolbar
        query={query}
        setQuery={setQuery}
        onSearch={submitSearch}
        onClear={clearSearch}
        placeholder={text.users.searchPlaceholder}
        searchLabel={text.users.search}
        clearLabel={text.users.clear}
        isFetching={isFetching}
      >
        <SegmentedFilter
          value={filter}
          options={[
            ["all", text.users.all],
            ["admin", text.users.admin],
            ["user", text.users.user],
          ]}
          onChange={(next) => {
            setFilter(next as UserFilter);
            setPage(1);
          }}
        />
      </Toolbar>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <StatusCard
          tone="error"
          title={text.errorTitle}
          actionLabel={text.retry}
          onAction={refetch}
        />
      ) : users.length === 0 ? (
        <StatusCard tone="empty" title={text.users.empty} />
      ) : (
        <UsersTable
          users={users}
          text={text}
          changingId={changingId}
          changing={changing}
          onUpdateRole={onUpdateRole}
        />
      )}

      <PageControls
        page={page}
        pages={pages}
        total={total}
        limit={pageSize}
        onPage={setPage}
        text={text}
      />
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  total,
  page,
  pages,
  text,
}: {
  title: string;
  subtitle: string;
  total: number;
  page: number;
  pages: number;
  text: Text;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
          {subtitle}
        </p>
      </div>
      <div className="text-sm font-semibold text-slate-500 dark:text-white/55">
        {formatNumber(total)} ·{" "}
        {text.pagination.page
          .replace("{{page}}", String(page))
          .replace("{{pages}}", String(pages))}
      </div>
    </div>
  );
}

function Toolbar({
  query,
  setQuery,
  onSearch,
  onClear,
  placeholder,
  searchLabel,
  clearLabel,
  isFetching,
  children,
}: {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  placeholder: string;
  searchLabel: string;
  clearLabel: string;
  isFetching: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05] xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500 dark:text-white/55" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch();
            if (event.key === "Escape") onClear();
          }}
          placeholder={placeholder}
          className="h-11 rounded-lg border-black/10 bg-white pr-10 dark:border-white/10 dark:bg-white/[0.08]"
        />
        {query && (
          <button
            type="button"
            onClick={onClear}
            className="absolute left-2 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
            aria-label={clearLabel}
            title={clearLabel}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
      <Button
        variant="primary"
        onClick={onSearch}
        disabled={isFetching}
        className="gap-2 text-white"
      >
        {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
        {searchLabel}
      </Button>
    </div>
  );
}

function SegmentedFilter({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid rounded-lg border border-black/10 bg-white p-1 dark:border-white/10 dark:bg-white/[0.06] sm:inline-grid sm:auto-cols-fr sm:grid-flow-col">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={[
            "h-9 rounded-md px-3 text-sm font-semibold transition-colors",
            value === key
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-black/5 dark:text-white/65 dark:hover:bg-white/10",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
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
  text: Text;
  onDelete: (dream: AdminDream) => void;
  deletingId?: string;
  deleting: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <table className="min-w-[940px] w-full border-collapse text-sm">
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
                  <StatusBadge shared={dream.isShared} text={text} />
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

function UsersTable({
  users,
  text,
  changingId,
  changing,
  onUpdateRole,
}: {
  users: AdminUser[];
  text: Text;
  changingId?: string;
  changing: boolean;
  onUpdateRole: (user: AdminUser) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <table className="min-w-[940px] w-full border-collapse text-sm">
        <thead className="border-b border-black/10 bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
          <tr>
            <th className="px-4 py-3 text-right">{text.users.name}</th>
            <th className="px-4 py-3 text-right">{text.users.email}</th>
            <th className="px-4 py-3 text-right">{text.users.role}</th>
            <th className="px-4 py-3 text-right">{text.users.status}</th>
            <th className="px-4 py-3 text-right">{text.users.joined}</th>
            <th className="px-4 py-3 text-right">{text.users.actions}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const name =
              [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
              user.email;
            const isChanging = changing && changingId === user._id;
            return (
              <tr
                key={user._id}
                className="border-b border-black/5 last:border-b-0 hover:bg-black/[0.02] dark:border-white/5 dark:hover:bg-white/[0.04]"
              >
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-extrabold text-white dark:bg-white dark:text-slate-950">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-950 dark:text-white">
                        {name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/55">
                        {user._id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-slate-700 dark:text-white/70">
                  {user.email}
                </td>
                <td className="px-4 py-3 align-top">
                  <RoleBadge role={user.role} text={text} />
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-1 text-xs font-bold",
                      user.isActive === false
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-200"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
                    ].join(" ")}
                  >
                    {user.isActive === false
                      ? text.users.inactive
                      : text.users.active}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-slate-600 dark:text-white/60">
                  {formatDate(String(user.createdAt || ""))}
                </td>
                <td className="px-4 py-3 align-top">
                  <button
                    type="button"
                    onClick={() => onUpdateRole(user)}
                    disabled={isChanging}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-200 dark:hover:bg-emerald-900/20"
                  >
                    {isChanging ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.role === "admin" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <Crown className="h-4 w-4" />
                    )}
                    {user.role === "admin"
                      ? text.users.makeUser
                      : text.users.makeAdmin}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ shared, text }: { shared: boolean; text: Text }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
        shared
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
          : "bg-slate-500/10 text-slate-700 dark:text-white/70",
      ].join(" ")}
    >
      {shared ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
      {shared ? text.dreams.shared : text.dreams.private}
    </span>
  );
}

function RoleBadge({ role, text }: { role: UserRole; text: Text }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
        role === "admin"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-200"
          : "bg-sky-500/10 text-sky-700 dark:text-sky-200",
      ].join(" ")}
    >
      {role === "admin" ? <Crown className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
      {role === "admin" ? text.users.admin : text.users.user}
    </span>
  );
}

function PageControls({
  page,
  pages,
  total,
  limit,
  onPage,
  text,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPage: (value: number | ((current: number) => number)) => void;
  text: Text;
}) {
  if (pages <= 1 && total <= limit) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  const items = paginationItems(page, pages);

  return (
    <nav className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white/60 px-3 py-3 dark:border-white/10 dark:bg-white/[0.04] md:flex-row md:items-center md:justify-between">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/55">
        {text.pagination.summary
          .replace("{{from}}", String(from))
          .replace("{{to}}", String(to))
          .replace("{{total}}", String(total))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <PageButton disabled={page <= 1} onClick={() => onPage(1)}>
          {text.pagination.first}
        </PageButton>
        <PageButton
          disabled={page <= 1}
          onClick={() => onPage((current) => Math.max(1, current - 1))}
          ariaLabel={text.pagination.prev}
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="grid h-9 w-9 place-items-center text-slate-400"
            >
              ...
            </span>
          ) : (
            <PageButton
              key={item}
              active={item === page}
              onClick={() => onPage(item)}
            >
              {item}
            </PageButton>
          )
        )}
        <PageButton
          disabled={page >= pages}
          onClick={() => onPage((current) => Math.min(pages, current + 1))}
          ariaLabel={text.pagination.next}
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>
        <PageButton disabled={page >= pages} onClick={() => onPage(pages)}>
          {text.pagination.last}
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-bold transition-colors",
        active
          ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
          : "border-black/10 bg-white text-slate-700 hover:bg-black/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/10",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function paginationItems(page: number, pages: number) {
  const visible = new Set<number>([1, pages, page, page - 1, page + 1]);
  if (page <= 3) {
    visible.add(2);
    visible.add(3);
  }
  if (page >= pages - 2) {
    visible.add(pages - 1);
    visible.add(pages - 2);
  }

  const nums = Array.from(visible)
    .filter((item) => item >= 1 && item <= pages)
    .sort((a, b) => a - b);

  const out: Array<number | "ellipsis"> = [];
  for (const n of nums) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && n - prev > 1) {
      out.push("ellipsis");
    }
    out.push(n);
  }
  return out;
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.05]">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse border-b border-black/5 last:border-b-0 dark:border-white/5"
        />
      ))}
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
