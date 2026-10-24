
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ExternalLink,
  Globe2,
  LoaderCircle,
  LogOut,
  Plus,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

type HealthResult = {
  url: string;
  status: "up" | "down";
  httpStatus: number | null;
  responseTimeMs: number;
  checkedAt: string;
  error: string | null;
};


type WebsiteItem = {
  id: string;
  name: string;
  url: string;
  status: "ACTIVE" | "PAUSED" | "PENDING";
  createdAt: string;
  checkRuns: {
    id: string;
    status: string;
    httpStatus: number | null;
    responseTimeMs: number | null;
    errorMessage: string | null;
    startedAt: string;
  }[];
};

type HistoryItem = {
    id: string;
    type: string;
    status: string;
    httpStatus: number | null;
    responseTimeMs: number | null;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
    website: {
      name: string;
      url: string;
    };
  };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [result, setResult] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      if (status !== "loading") {
        setHistoryLoading(false);
      }
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch("/api/websites/history", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load website history.");
        }

        const data = await response.json();

        if (!cancelled) {
          setHistory(data.history ?? []);
        }
      } catch {
        if (!cancelled) {
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [status]);


  useEffect(() => {
    if (status !== "authenticated") {
      if (status !== "loading") {
        setWebsitesLoading(false);
      }
      return;
    }

    let cancelled = false;

    async function loadWebsites() {
      try {
        const response = await fetch("/api/websites", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load websites.");
        }

        const data = await response.json();

        if (!cancelled) {
          setWebsites(data.websites ?? []);
        }
      } catch {
        if (!cancelled) {
          setWebsites([]);
        }
      } finally {
        if (!cancelled) {
          setWebsitesLoading(false);
        }
      }
    }

    void loadWebsites();

    return () => {
      cancelled = true;
    };
  }, [status]);


  async function runCheck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/websites/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Unable to check this website.");
        return;
      }

      setResult(data.result as HealthResult);

      const [historyResponse, websitesResponse] = await Promise.all([
        fetch("/api/websites/history", { cache: "no-store" }),
        fetch("/api/websites", { cache: "no-store" }),
      ]);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history ?? []);
      }

      if (websitesResponse.ok) {
        const websitesData = await websitesResponse.json();
        setWebsites(websitesData.websites ?? []);
      }


    } catch {
      setError("Unable to reach SiteFixer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-slate-600">
        <LoaderCircle className="mr-3 animate-spin" size={20} />
        Loading your workspace...
      </main>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] flex-col border-r border-slate-200 bg-white lg:flex">
        <Link href="/" className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Activity size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            SiteFixer<span className="text-blue-600">.</span>
          </span>
        </Link>

        <div className="px-4 py-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700">
            <Activity size={18} />
            Overview
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="truncate px-2 text-xs text-slate-500">
            {session.user.email}
          </div>
          <button
            type="button"
            onClick={() => router.push("/api/auth/signout")}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-xs text-slate-500">Workspace / Overview</p>
            <h1 className="mt-1 text-sm font-semibold">Website monitoring</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">
              Signed in as {session.user.name ?? session.user.email}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {(session.user.name ?? session.user.email ?? "U")
                .slice(0, 1)
                .toUpperCase()}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-[1150px] px-5 py-9 sm:px-8 sm:py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Your workspace
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Website overview
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Check availability and response times for a website you manage.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start text-sm font-medium text-slate-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} /> Back to homepage
            </Link>
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Globe2 size={20} />
              </span>
              <div>
                <h3 className="font-semibold">Check a website</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Enter a public website URL to run a one-time HTTP health check.
                </p>
              </div>
            </div>

            <form onSubmit={runCheck} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                required
                maxLength={2048}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                aria-label="Website URL"
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Zap size={17} />
                )}
                {loading ? "Checking..." : "Run health check"}
              </button>
            </form>

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              icon={<Globe2 size={18} />}
              label="Latest website"
              value={result ? new URL(result.url).hostname : "—"}
              description={result ? "Last submitted website" : "Run your first check"}
            />
            <MetricCard
              icon={<Activity size={18} />}
              label="Latest HTTP status"
              value={result?.httpStatus ? String(result.httpStatus) : "—"}
              description={
                result?.httpStatus
                  ? result.status === "up"
                    ? "Successful health response"
                    : "HTTP response needs attention"
                  : "Waiting for a health check"
              }
            />
            <MetricCard
              icon={<Clock3 size={18} />}
              label="Response time"
              value={result ? `${result.responseTimeMs} ms` : "—"}
              description={result ? "Latest measured request" : "No measurements yet"}
            />
          </section>


          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h3 className="font-semibold">Registered websites</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Websites saved in your workspace
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {websites.length} total
              </span>
            </div>

            {websitesLoading ? (
              <div className="px-6 py-10 text-sm text-slate-500">
                Loading websites...
              </div>
            ) : websites.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Globe2 className="mx-auto text-slate-400" size={24} />
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  No registered websites
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Run a health check above to register your first website.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {websites.map((website) => {
                  const latest = website.checkRuns[0];
                  const isUp = latest?.status === "SUCCESS";

                  return (
                    <div
                      key={website.id}
                      className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <Globe2 size={19} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {website.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {website.url}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Added {new Date(website.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pl-13 sm:pl-0">
                        <div className="text-xs text-slate-500">
                          <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                            Response
                          </span>
                          <span className="mt-1 block font-semibold text-slate-800">
                            {latest?.responseTimeMs != null
                              ? `${latest.responseTimeMs} ms`
                              : "No checks"}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500">
                          <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                            HTTP
                          </span>
                          <span className="mt-1 block font-semibold text-slate-800">
                            {latest?.httpStatus ?? "—"}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            latest
                              ? isUp
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                              : website.status === "PAUSED"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {latest
                            ? isUp
                              ? "Responding"
                              : "Check failed"
                            : website.status === "PAUSED"
                              ? "Paused"
                              : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h3 className="font-semibold">Latest check result</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Results from your current session
                </p>
              </div>
              <Activity size={18} className="text-slate-400" />
            </div>

            {!result ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Globe2 size={22} />
                </span>
                <h4 className="mt-4 text-sm font-semibold">No checks yet</h4>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Submit a website URL above to see its HTTP status and response time here.
                </p>
                <button
                  type="button"
                  onClick={() => document.querySelector<HTMLInputElement>('input[aria-label="Website URL"]')?.focus()}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  <Plus size={16} /> Add a website to check
                </button>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      result.status === "up"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {result.status === "up" ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {result.url}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Checked {new Date(result.checkedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${
                    result.status === "up"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      result.status === "up" ? "bg-emerald-500" : "bg-red-500"
                    }`} />
                    {result.status === "up" ? "Responding" : "Check failed"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                  <ResultValue label="HTTP status" value={result.httpStatus?.toString() ?? "No response"} />
                  <ResultValue label="Response time" value={`${result.responseTimeMs} ms`} />
                  <ResultValue label="Health" value={result.status === "up" ? "Up" : "Down"} />
                </div>

                {result.error && (
                  <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">
                    {result.error}
                  </p>
                )}

                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Open website <ExternalLink size={14} />
                </a>
              </div>
            )}
          </section>


        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
            <h3 className="font-semibold">Check history</h3>
            <p className="mt-1 text-xs text-slate-500">
                Your latest saved website checks
            </p>
            </div>
            <Activity size={18} className="text-slate-400" />
        </div>

        {historyLoading ? (
            <div className="flex items-center gap-3 px-6 py-10 text-sm text-slate-500">
            <LoaderCircle size={17} className="animate-spin" />
            Loading saved checks...
            </div>
        ) : history.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
            No saved checks yet. Run a health check to start your history.
            </p>
        ) : (
            <div className="divide-y divide-slate-100">
            {history.map((item) => {
                const isUp = item.status === "SUCCESS";

                return (
                <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                >
                    <div className="flex min-w-0 items-center gap-3">
                    <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isUp
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                        {isUp ? (
                        <CheckCircle2 size={18} />
                        ) : (
                        <XCircle size={18} />
                        )}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                        {item.website.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                        {item.website.url}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                        {new Date(item.startedAt).toLocaleString()}
                        </p>
                    </div>
                    </div>

                    <div className="flex items-center gap-4 pl-12 sm:pl-0">
                    <span className="text-xs text-slate-500">
                        HTTP {item.httpStatus ?? "—"}
                    </span>
                    <span className="text-xs text-slate-500">
                        {item.responseTimeMs == null
                        ? "—"
                        : `${item.responseTimeMs} ms`}
                    </span>
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isUp
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                        {isUp ? "Success" : "Failed"}
                    </span>
                    </div>
                </div>
                );
            })}
            </div>
        )}
        </section>


          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            One-time checks only. Results are not yet saved to your account or monitored automatically.
          </p>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-blue-600">{icon}</span>
        {label}
      </div>
      <p className="mt-4 truncate text-xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 truncate text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ResultValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
