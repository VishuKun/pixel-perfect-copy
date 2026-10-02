import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { BadgeIndianRupee, Clock, Landmark, Receipt, Users, Wallet } from "lucide-react";
import { Panel, StatCard } from "@/components/dashboard/widgets";
import { FilterSelect, tbodyRow, td, th, theadRow } from "@/components/hr/common";
import { departments } from "@/lib/hr-data";
import { deptBreakdown, seriesFor } from "@/lib/intel-data";
import { formatINR, formatINRCompact, formatNumber } from "@/lib/format";

const tip = { borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 };
const lakh = (v: number) => `₹${(v / 1e5).toFixed(0)}L`;
const pct = (a: number, b: number) => Math.round(((a - b) / b) * 1000) / 10;

export function AnalyticsView() {
  const [dept, setDept] = useState("all");
  const [period, setPeriod] = useState("12");
  const [metric, setMetric] = useState<"gross" | "deductions" | "tax">("gross");
  const p = Number(period);
  const s = useMemo(() => seriesFor(dept, p), [dept, p]);
  const last = s[s.length - 1]!, first = s[0]!, prev = s[s.length - 2]!;
  const breakdown = useMemo(() => deptBreakdown(p), [p]);
  const sum = (k: "tax" | "deductions" | "overtime") => s.reduce((a, r) => a + r[k], 0);

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <FilterSelect value={period} onChange={setPeriod} options={[{ value: "3", label: "Last 3 months" }, { value: "6", label: "Last 6 months" }, { value: "12", label: "Last 12 months" }]} />
        <FilterSelect value={dept} onChange={setDept} options={[{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Monthly payroll (Sep)" value={formatINRCompact(last.gross)} delta={pct(last.gross, prev.gross)} icon={Wallet} accent="primary" foot="vs previous month" />
        <StatCard label="Average salary" value={formatINR(Math.round(last.gross / last.headcount))} delta={pct(last.gross / last.headcount, first.gross / first.headcount)} icon={BadgeIndianRupee} accent="success" foot={`over ${p} months`} />
        <StatCard label="Headcount" value={formatNumber(last.headcount)} delta={pct(last.headcount, first.headcount)} icon={Users} accent="primary" foot={`+${last.headcount - first.headcount} in period`} />
        <StatCard label="Total deductions" value={formatINRCompact(sum("deductions"))} icon={Receipt} accent="warning" foot={`PF, PT, TDS & other · ${p} mo`} />
        <StatCard label="Tax contribution (TDS)" value={formatINRCompact(sum("tax"))} icon={Landmark} accent="warning" foot={`${((sum("tax") / s.reduce((a, r) => a + r.gross, 0)) * 100).toFixed(1)}% of gross`} />
        <StatCard label="Overtime cost" value={formatINRCompact(sum("overtime"))} delta={pct(last.overtime, prev.overtime)} deltaGood={false} icon={Clock} accent="critical" foot="Sep vs Aug" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Monthly payroll trend" subtitle="₹ per month" className="lg:col-span-2"
          action={<FilterSelect value={metric} onChange={(v) => setMetric(v as typeof metric)} className="sm:w-36" options={[{ value: "gross", label: "Gross" }, { value: "deductions", label: "Deductions" }, { value: "tax", label: "Tax (TDS)" }]} />}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s} margin={{ left: -4, right: 8, top: 8 }}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={lakh} width={56} domain={["auto", "auto"]} />
                <Tooltip contentStyle={tip} formatter={(v: number) => formatINRCompact(v)} />
                <Area type="monotone" dataKey={metric} stroke="var(--chart-1)" strokeWidth={2.25} fill="url(#ag)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Headcount trend" subtitle="Employees on payroll">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
                <Tooltip contentStyle={tip} />
                <Line type="monotone" dataKey="headcount" stroke="var(--chart-3)" strokeWidth={2.25} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Overtime vs tax" subtitle="Monthly cost, ₹">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s} margin={{ left: -4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={lakh} width={56} />
                <Tooltip contentStyle={tip} cursor={{ fill: "var(--muted)" }} formatter={(v: number) => formatINRCompact(v)} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="tax" name="Tax (TDS)" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overtime" name="Overtime" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Department-wise payroll" subtitle="September 2026">
          <div className="-mx-5 -mb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className={`${theadRow} border-t`}><th className={th}>Department</th><th className={`${th} text-right`}>Payroll</th><th className={`${th} text-right`}>Headcount</th><th className={`${th} text-right`}>Avg salary</th><th className={`${th} text-right`}>Overtime</th></tr></thead>
              <tbody>
                {breakdown.map((d) => {
                  const total = breakdown.reduce((a, x) => a + x.gross, 0);
                  return (
                    <tr key={d.dept} className={`${tbodyRow} ${dept === d.dept ? "bg-primary-soft" : ""}`}>
                      <td className={td}>
                        <div className="font-medium">{d.dept}</div>
                        <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${(d.gross / total) * 100 * 2.4}%` }} /></div>
                      </td>
                      <td className={`${td} whitespace-nowrap text-right font-medium tabular`}>{formatINRCompact(d.gross)}</td>
                      <td className={`${td} text-right tabular text-muted-foreground`}>{d.headcount}</td>
                      <td className={`${td} text-right tabular`}>{formatINR(Math.round(d.avg))}</td>
                      <td className={`${td} text-right tabular text-muted-foreground`}>{formatINRCompact(d.overtime)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
