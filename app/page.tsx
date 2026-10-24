
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Gauge,
  Globe2,
  Menu,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: Activity,
    title: "Uptime monitoring",
    description:
      "Know when a website becomes unavailable. Identify interruptions and understand availability across the sites you manage.",
  },
  {
    number: "02",
    icon: Gauge,
    title: "Performance tracking",
    description:
      "Measure response times and spot performance changes before they become a problem for your visitors.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Issue detection",
    description:
      "Bring website health checks and emerging problems into one organized workspace.",
  },
];

const responseBars = [42, 36, 48, 43, 58, 49, 38, 45, 34, 52, 41, 46, 33, 39, 30, 42, 35, 31, 37, 28, 34, 26, 32, 25];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  function handleGetStarted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = url.trim();

    if (!value) {
      setError("Enter a website URL to get started.");
      return;
    }

    setError("");

    window.location.href = `/login?callbackUrl=${encodeURIComponent(
      `/dashboard?url=${encodeURIComponent(value)}`,
    )}`;
  }

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#172033]">
      {/* Fixed navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#2459e8] text-white">
              <Activity size={21} strokeWidth={2.5} />
            </span>
            <span className="text-[19px] font-bold tracking-[-0.8px]">
              SiteFixer
              <span className="text-[#2459e8]">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-[13px] font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-blue-700">
              Features
            </a>
            <a href="#workflow" className="transition hover:text-blue-700">
              How it works
            </a>
            <a href="#about" className="transition hover:text-blue-700">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2459e8] px-4 text-[13px] font-semibold text-white shadow-sm shadow-blue-600/15 transition hover:bg-[#1948c8]"
            >
              Get started
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-[1240px] flex-col gap-1">
              {[
                ["Features", "#features"],
                ["How it works", "#workflow"],
                ["About", "#about"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pt-40 lg:pb-28 lg:pt-44">
        <div className="pointer-events-none absolute right-[-150px] top-20 -z-0 h-[420px] w-[420px] rounded-full bg-blue-100/50 blur-[100px]" />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              WEBSITE MONITORING, SIMPLIFIED
            </div>

            <h1 className="mt-7 max-w-[580px] text-[43px] font-semibold leading-[1.09] tracking-[-2.8px] text-[#152039] sm:text-[56px] lg:text-[65px]">
              Your websites deserve
              <span className="block text-[#2459e8]">
                proactive care.
              </span>
            </h1>

            <p className="mt-6 max-w-[490px] text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
              Monitor uptime, understand performance, and catch website
              issues earlier. One focused workspace for the websites you
              build, manage, and maintain.
            </p>

            <form onSubmit={handleGetStarted} className="mt-8 max-w-[510px]">
              <label
                htmlFor="website-url"
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                Start with your website
              </label>

              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.05)] focus-within:border-blue-300 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
                  <Globe2 size={19} className="shrink-0 text-slate-400" />
                  <input
                    id="website-url"
                    type="text"
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value);
                      setError("");
                    }}
                    placeholder="https://yourwebsite.com"
                    className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    aria-describedby={error ? "url-error" : undefined}
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2459e8] px-5 text-sm font-semibold text-white transition hover:bg-[#1948c8]"
                >
                  Get started
                  <ArrowRight size={16} />
                </button>
              </div>

              {error ? (
                <p id="url-error" role="alert" className="mt-2 text-xs text-red-600">
                  {error}
                </p>
              ) : (
                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                  Sign in before running checks. Only monitor websites you
                  own or are authorized to manage.
                </p>
              )}
            </form>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <Check size={15} className="text-emerald-600" />
                One organized workspace
              </span>
              <span className="flex items-center gap-2">
                <Check size={15} className="text-emerald-600" />
                Actionable health checks
              </span>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative min-w-0 lg:pl-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Activity size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Website overview
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Product preview
                    </p>
                  </div>
                </div>

                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500">
                  DEMO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5">
                <div className="rounded-xl border border-slate-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-slate-500">
                      Availability
                    </p>
                    <Activity size={15} className="text-blue-600" />
                  </div>
                  <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Uptime
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Monitoring metric
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-slate-500">
                      Performance
                    </p>
                    <Zap size={15} className="text-amber-500" />
                  </div>
                  <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Response
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Speed measurement
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-slate-200/80 p-4 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-slate-500">
                      Website health
                    </p>
                    <ShieldCheck size={15} className="text-emerald-600" />
                  </div>
                  <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Health
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Issue detection
                  </p>
                </div>
              </div>

              <div className="mx-4 mb-4 rounded-xl border border-slate-200/80 p-4 sm:mx-5 sm:mb-5 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Response time
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Illustrative chart · no live measurements
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Clock3 size={13} /> Sample data
                  </span>
                </div>

                <div className="mt-7 flex h-28 items-end gap-[5px] border-b border-slate-100">
                  {responseBars.map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-[3px] bg-blue-500/80 transition-colors hover:bg-blue-700"
                      style={{ height: `${height * 2.2}px` }}
                    />
                  ))}
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                  <span>Earlier</span>
                  <span>Recent</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                  <CircleAlert size={16} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Monitoring insights
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Review availability, speed, and website issues.
                  </p>
                </div>
                <ArrowUpRight size={16} className="ml-auto text-slate-400" />
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-4 -right-3 -z-10 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Compact trust strip */}
      <section className="border-y border-slate-200 bg-white px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm font-medium text-slate-600">
            Built for the people responsible for keeping websites running.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-2">
              <Globe2 size={15} className="text-blue-600" />
              Freelancers
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-blue-600" />
              Agencies
            </span>
            <span className="flex items-center gap-2">
              <Gauge size={15} className="text-blue-600" />
              Website teams
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="max-w-[620px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
              The essentials
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-1.4px] text-[#172033] sm:text-[42px]">
              Website health, without the guesswork.
            </h2>
            <p className="mt-5 max-w-[540px] text-sm leading-7 text-slate-600 sm:text-base">
              Get a clearer view of the issues that matter, so you can spend
              less time chasing problems and more time improving your websites.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(({ number, icon: Icon, title, description }) => (
              <article
                key={number}
                className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon size={21} />
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {number}
                  </span>
                </div>
                <h3 className="mt-7 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                  Designed for clarity
                  <ChevronRight size={15} className="transition group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="scroll-mt-24 border-y border-slate-200 bg-white px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
              A simpler workflow
            </p>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-[-1.4px] text-[#172033] sm:text-[42px]">
              From website URL to actionable insight.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
              Keep your monitoring workflow straightforward. Start with a
              website, run checks securely, and review results in one place.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              Get started with SiteFixer <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                number: "01",
                title: "Create your workspace",
                description:
                  "Sign in securely before accessing monitoring features.",
              },
              {
                number: "02",
                title: "Add a website you manage",
                description:
                  "Register an authorized public website for health checks.",
              },
              {
                number: "03",
                title: "Review website health",
                description:
                  "Use monitoring results to understand availability and performance.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="flex gap-4 rounded-xl border border-slate-200 bg-[#fafbfc] p-5 sm:gap-5 sm:p-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-xs font-bold text-blue-700">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section id="about" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1240px] overflow-hidden rounded-2xl bg-[#14264b] px-7 py-12 sm:px-12 sm:py-14 lg:px-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-blue-300">
                Take control of website health
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-1px] text-white sm:text-[40px]">
                Make maintenance more proactive.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Bring website checks and maintenance insights into a
                workspace designed to keep you informed.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#14264b] transition hover:bg-blue-50 md:self-center"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Activity size={15} />
            </span>
            SiteFixer<span className="text-blue-600">.</span>
          </Link>

          <p className="text-xs text-slate-500">
            Website monitoring and maintenance, made clearer.
          </p>

          <p className="text-xs text-slate-400">
          © 2026 SiteFixer
          </p>
        </div>
      </footer>
    </main>
  );
}
