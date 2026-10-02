import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Panel } from "@/components/dashboard/widgets";
import { MiniStat } from "@/components/hr/common";
import { employeeAlerts, employeeLedger } from "@/lib/intel-data";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const t = "Financial Dashboard — PayFlow";
const d = "Your salary history, gross vs net, deductions, PF and tax over the last 12 months.";
export const Route = createFileRoute("/employee/financial")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: FinancialPage,
});

const tip = { borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 };
const k = (v: number) => `₹${(v / 1000).toFixed(0)}K`;
const fmt = (v: number) => formatINR(v);
const dot = { warning: "bg-warning", info: "bg-primary", success: "bg-success" };
const bg = { warning: "bg-warning-soft", info: "bg-primary-soft", success: "bg-success-soft" };

function FinancialPage() {
  const L = employeeLedger;
  const sum = (key: "gross" | "net" | "pf" | "tax" | "deductions") => L.reduce((a, r) => a + r[key], 0);
  const cur = L[L.length - 1]!;
  const pie = [
    { name: "Income tax (TDS)", value: cur.tax, color: "var(--chart-1)" },
    { name: "Provident fund", value: cur.pf, color: "var(--chart-3)" },
    { name: "Other", value: cur.other, color: "var(--chart-4)" },
    { name: "Professional tax", value: cur.pt, color: "var(--chart-5)" },
  ];

  return (
    <AppShell role="employee">
      <PageHeader title="Financial dashboard" description="Your earnings and deductions, Oct 2025 – Sep 2026." />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Gross earned (12 mo)" value={formatINR(sum("gross"))} tone="primary" />
        <MiniStat label="Net received (12 mo)" value={formatINR(sum("net"))} tone="success" />
        <MiniStat label="PF contributed" value={formatINR(sum("pf"))} sub={`+ ${formatINR(sum("pf"))} employer share`} tone="primary" />
        <MiniStat label="Tax paid (TDS)" value={formatINR(sum("tax"))} sub={`${((sum("tax") / sum("gross")) * 100).toFixed(1)}% of gross`} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Gross vs net salary" subtitle="Monthly" className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={L} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={k} width={52} />
                <Tooltip contentStyle={tip} cursor={{ fill: "var(--muted)" }} formatter={fmt} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="gross" name="Gross" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Deductions breakdown" subtitle="September 2026">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={tip} formatter={fmt} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {pie.map((p) => (
              <li key={p.name} className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />{p.name}</span><span className="font-medium tabular">{formatINR(p.value)}</span></li>
            ))}
            <li className="flex justify-between border-t pt-1.5 font-semibold"><span>Total</span><span className="tabular">{formatINR(cur.deductions)}</span></li>
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Monthly salary trend" subtitle="Net take-home">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={L} margin={{ left: 0, right: 8, top: 8 }}>
                <defs><linearGradient id="nt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" tickFormatter={k} width={48} domain={["auto", "auto"]} />
                <Tooltip contentStyle={tip} formatter={fmt} />
                <Area type="monotone" dataKey="net" name="Net" stroke="var(--chart-3)" strokeWidth={2.25} fill="url(#nt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Tax history" subtitle="TDS per month">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={L} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" tickFormatter={k} width={48} domain={["auto", "auto"]} />
                <Tooltip contentStyle={tip} formatter={fmt} />
                <Line type="monotone" dataKey="tax" name="TDS" stroke="var(--chart-1)" strokeWidth={2.25} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Payroll alerts">
          <ul className="space-y-2.5">
            {employeeAlerts.map((a) => (
              <li key={a.title} className={cn("flex gap-3 rounded-lg p-3", bg[a.severity])}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot[a.severity])} />
                <div className="min-w-0"><div className="text-sm font-medium">{a.title}</div><div className="text-xs text-muted-foreground">{a.desc}</div></div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Salary history" subtitle="All amounts from issued payslips" className="mt-4">
        <div className="-mx-5 -mb-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-y bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {["Month", "Gross", "PF", "TDS", "PT + other", "Deductions", "Net"].map((h, i) => <th key={h} className={cn("px-4 py-2.5", i > 0 && "text-right")}>{h}</th>)}
            </tr></thead>
            <tbody>
              {L.slice().reverse().map((r) => (
                <tr key={r.month} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">{r.month}</td>
                  <td className="px-4 py-2.5 text-right tabular">{formatINR(r.gross)}</td>
                  <td className="px-4 py-2.5 text-right tabular text-muted-foreground">{formatINR(r.pf)}</td>
                  <td className="px-4 py-2.5 text-right tabular text-muted-foreground">{formatINR(r.tax)}</td>
                  <td className="px-4 py-2.5 text-right tabular text-muted-foreground">{formatINR(r.pt + r.other)}</td>
                  <td className="px-4 py-2.5 text-right tabular text-destructive">− {formatINR(r.deductions)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-success tabular">{formatINR(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
