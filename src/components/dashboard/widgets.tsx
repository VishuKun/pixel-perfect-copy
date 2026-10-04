import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Check, Loader2, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { activity, alerts, anomalies, departmentPayroll, payrollTrend, processingSteps, type Severity } from "@/lib/mock-data";

export function Panel({ title, subtitle, action, children, className }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

const tone = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  critical: "bg-destructive-soft text-destructive",
};

export function StatCard({ label, value, delta, deltaGood = true, icon: Icon, accent, foot }: {
  label: string; value: string; delta?: number; deltaGood?: boolean; icon: LucideIcon; accent: keyof typeof tone; foot: string;
}) {
  const up = (delta ?? 0) >= 0;
  const positive = up === deltaGood;
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn("grid h-9 w-9 place-items-center rounded-lg", tone[accent])}><Icon className="h-[18px] w-[18px]" /></span>
      </div>
      <div className="mt-3 text-[26px] font-bold tracking-tight tabular">{value}</div>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold", positive ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive")}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        <span className="text-muted-foreground">{foot}</span>
      </div>
    </div>
  );
}

const tooltipStyle = { borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, boxShadow: "0 4px 16px -8px rgb(0 0 0 / 0.15)" };

export function PayrollTrendChart() {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={payrollTrend} margin={{ left: -12, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="gross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${v}L`} domain={[30, 50]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [`₹${v} L`, n === "gross" ? "Gross" : "Net pay"]} />
          <Area type="monotone" dataKey="gross" stroke="var(--chart-1)" strokeWidth={2.25} fill="url(#gross)" />
          <Area type="monotone" dataKey="net" stroke="var(--chart-3)" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentChart() {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={departmentPayroll} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${v}L`} />
          <YAxis type="category" dataKey="dept" tickLine={false} axisLine={false} fontSize={12} width={84} stroke="var(--muted-foreground)" />
          <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v} L`, "Payroll"]} />
          <Bar dataKey="amount" fill="var(--chart-1)" radius={[0, 6, 6, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const sevStyle: Record<Severity, string> = {
  critical: "bg-destructive-soft text-destructive",
  warning: "bg-warning-soft text-warning",
  info: "bg-primary-soft text-primary",
};

export function SeverityBadge({ s }: { s: Severity }) {
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize", sevStyle[s])}>{s}</span>;
}

export function AnomaliesTable() {
  return (
    <div className="-mx-5 -mb-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-2.5">Employee</th>
            <th className="px-3 py-2.5">Issue</th>
            <th className="px-3 py-2.5 text-right">Impact</th>
            <th className="px-3 py-2.5">Severity</th>
            <th className="px-5 py-2.5 text-right">Detected</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a) => (
            <tr key={a.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="px-5 py-3">
                <div className="font-medium">{a.employee}</div>
                <div className="text-xs text-muted-foreground">{a.empId} · {a.dept}</div>
              </td>
              <td className="max-w-[280px] px-3 py-3 text-muted-foreground">{a.issue}</td>
              <td className="px-3 py-3 text-right font-medium tabular">{a.amount ? formatINR(a.amount) : "—"}</td>
              <td className="px-3 py-3"><SeverityBadge s={a.severity} /></td>
              <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-muted-foreground">{a.detected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProcessingStatus() {
  return (
    <ol className="space-y-4">
      {processingSteps.map((s, i) => (
        <li key={s.label} className="relative flex gap-3">
          {i < processingSteps.length - 1 && (
            <span className={cn("absolute left-[11px] top-7 h-[calc(100%-4px)] w-px", s.status === "done" ? "bg-primary" : "bg-border")} />
          )}
          <span className={cn("relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
            s.status === "done" && "border-primary bg-primary text-primary-foreground",
            s.status === "active" && "border-primary bg-primary-soft text-primary",
            s.status === "pending" && "bg-card text-muted-foreground")}>
            {s.status === "done" ? <Check className="h-3.5 w-3.5" /> : s.status === "active" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
          </span>
          <div className="min-w-0 pb-0.5">
            <div className={cn("text-sm font-medium", s.status === "pending" && "text-muted-foreground")}>{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.meta}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

const dot: Record<Severity, string> = { critical: "bg-destructive", warning: "bg-warning", info: "bg-primary" };

export function AlertsList() {
  return (
    <ul className="space-y-2.5">
      {alerts.map((a) => (
        <li key={a.title} className={cn("flex gap-3 rounded-lg p-3", sevStyle[a.severity].split(" ")[0])}>
          <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot[a.severity])} />
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">{a.title}</div>
            <div className="text-xs text-muted-foreground">{a.desc}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ActivityFeed() {
  return (
    <ul className="space-y-4">
      {activity.map((a, i) => (
        <li key={i} className="flex gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{a.initials}</span>
          <div className="min-w-0 text-sm">
            <p className="leading-snug"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span></p>
            <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
