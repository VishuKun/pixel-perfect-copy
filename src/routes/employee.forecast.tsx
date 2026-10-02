import { createFileRoute } from "@tanstack/react-router";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Info } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Panel } from "@/components/dashboard/widgets";
import { MiniStat } from "@/components/hr/common";
import { salaryHistory } from "@/lib/intel-data";
import { formatINR } from "@/lib/format";

const t = "Salary Forecast — PayFlow";
const d = "Estimated range for your upcoming salary based on your pay history. Estimates only, not guaranteed.";
export const Route = createFileRoute("/employee/forecast")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: ForecastPage,
});

// Transparent mock model
const baseNet = 149900;          // regular monthly net (no bonus/OT)
const otAvg = 6400;              // 6-mo average overtime (net of tax ≈ 80%)
const otVar = 5600;              // observed OT swing
const taxRegimeShift = -1200;    // TDS true-up expected in Q3
const lopRisk = 2970;            // ~0.5 day avg LOP over 12 months
const r = (n: number) => Math.round(n / 100) * 100;

const forecastMonths = ["Oct 26", "Nov 26", "Dec 26"];
const forecast = forecastMonths.map((m, i) => {
  const mid = baseNet + otAvg * 0.8 + taxRegimeShift * (i > 0 ? 1 : 0) - lopRisk * 0.5 + (i === 2 ? 4000 : 0);
  return { month: m, low: r(mid - otVar * 0.8 - lopRisk), mid: r(mid), high: r(mid + otVar * 0.8) };
});

const chart = [
  ...salaryHistory.map((h, i) => ({ month: h.month, actual: h.net, ...(i === salaryHistory.length - 1 ? { mid: h.net, band: [h.net, h.net] as [number, number] } : {}) })),
  ...forecast.map((f) => ({ month: f.month, mid: f.mid, band: [f.low, f.high] as [number, number] })),
];

const factors = [
  { label: "Regular net salary", value: baseNet, note: "Basic + HRA + allowances − PF, PT, TDS. Fixed unless your structure changes.", tone: "neutral" },
  { label: "Average overtime", value: otAvg * 0.8, note: `6-month average of ${formatINR(otAvg)}, after ~20% tax. Varies ±${formatINR(otVar)}.`, tone: "up" },
  { label: "TDS true-up (Nov onward)", value: taxRegimeShift, note: "Projected annual tax spread over remaining months increases monthly TDS slightly.", tone: "down" },
  { label: "Loss-of-pay risk", value: -lopRisk * 0.5, note: "Based on 6 LOP days over 12 months (~0.5 day/month).", tone: "down" },
  { label: "Year-end festive allowance (Dec)", value: 4000, note: "Paid every December in the last 2 years. Not contractual.", tone: "up" },
  { label: "Not included", value: null, note: "Quarterly bonuses, appraisals, promotions or structure revisions.", tone: "neutral" },
] as const;

function ForecastPage() {
  const current = salaryHistory[salaryHistory.length - 1]!;
  const avg = Math.round(salaryHistory.reduce((a, h) => a + h.net, 0) / salaryHistory.length);
  const next = forecast[0]!;

  return (
    <AppShell role="employee">
      <PageHeader title="Salary forecast" description="An estimate of your next three months' take-home, based on your pay history." />

      <div className="mb-4 flex gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p><b>This is an estimate, not a guarantee.</b> Figures are projected from your past payslips and current salary structure. Actual pay depends on attendance, overtime, tax declarations and company decisions.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Current net (Sep)" value={formatINR(current.net)} sub="Includes ₹15,000 bonus" tone="primary" />
        <MiniStat label="12-month average" value={formatINR(avg)} sub="Oct 25 – Sep 26" tone="neutral" />
        <MiniStat label="Estimated October" value={<span className="text-xl">{formatINR(next.low)} – {formatINR(next.high)}</span>} sub={`Most likely ~${formatINR(next.mid)}`} tone="success" />
        <MiniStat label="Confidence" value="Moderate" sub="Overtime is the main source of variance" tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Historical trend & estimate" subtitle="Monthly net pay · shaded band is the estimated range">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={60} domain={[110000, 180000]} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 }}
                  formatter={(v: number | [number, number], n) => [Array.isArray(v) ? `${formatINR(v[0])} – ${formatINR(v[1])}` : formatINR(v), n === "band" ? "Estimated range" : n === "mid" ? "Most likely" : "Actual"]} />
                <Area dataKey="band" stroke="none" fill="var(--chart-3)" fillOpacity={0.15} />
                <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2.25} dot={{ r: 3 }} />
                <Line dataKey="mid" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-chart-1" />Actual</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-chart-3" />Most likely</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-chart-3/20" />Estimated range</span>
          </div>
        </Panel>

        <Panel title="How the estimate is calculated" subtitle="October 2026, most likely value">
          <ul className="divide-y text-sm">
            {factors.map((f) => (
              <li key={f.label} className="py-2.5">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{f.label}</span>
                  {f.value !== null && <span className={`font-semibold tabular ${f.tone === "up" ? "text-success" : f.tone === "down" ? "text-destructive" : ""}`}>{f.value > 0 && f.tone !== "neutral" ? "+" : f.value < 0 ? "−" : ""}{formatINR(Math.abs(Math.round(f.value)))}</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.note}</p>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between rounded-lg bg-muted px-3 py-2 text-sm font-semibold"><span>Estimate (Oct)</span><span className="tabular">≈ {formatINR(next.mid)}</span></div>
        </Panel>
      </div>

      <Panel title="Salary history & projection" className="mt-4">
        <div className="-mx-5 -mb-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-y bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><th className="px-5 py-2.5">Month</th><th className="px-3 py-2.5">Type</th><th className="px-5 py-2.5 text-right">Net pay</th></tr></thead>
            <tbody>
              {forecast.slice().reverse().map((f) => (
                <tr key={f.month} className="border-b bg-success-soft/40"><td className="px-5 py-2.5 font-medium">{f.month}</td><td className="px-3 py-2.5 text-xs text-muted-foreground">Estimate</td><td className="px-5 py-2.5 text-right tabular">{formatINR(f.low)} – {formatINR(f.high)}</td></tr>
              ))}
              {salaryHistory.slice().reverse().slice(0, 6).map((h) => (
                <tr key={h.month} className="border-b last:border-0"><td className="px-5 py-2.5 font-medium">{h.month}</td><td className="px-3 py-2.5 text-xs text-muted-foreground">Actual</td><td className="px-5 py-2.5 text-right font-medium tabular">{formatINR(h.net)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
