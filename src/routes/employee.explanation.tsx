import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Panel } from "@/components/dashboard/widgets";
import { explanation, type Line } from "@/lib/intel-data";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const t = "Why did my salary change? — PayFlow";
const d = "Month-over-month breakdown of your salary showing exactly what increased or decreased.";
export const Route = createFileRoute("/employee/explanation")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: ExplanationPage,
});

/** Effect on net pay: earnings raise it, deductions lower it. */
const impact = (l: Line) => (l.kind === "earning" ? l.curr - l.prev : -(l.curr - l.prev));

function ExplanationPage() {
  const { lines, prevMonth, currMonth } = explanation;
  const earn = lines.filter((l) => l.kind === "earning");
  const ded = lines.filter((l) => l.kind === "deduction");
  const tot = (ls: Line[], k: "prev" | "curr") => ls.reduce((a, l) => a + l[k], 0);
  const grossP = tot(earn, "prev"), grossC = tot(earn, "curr");
  const netP = grossP - tot(ded, "prev"), netC = grossC - tot(ded, "curr");
  const diff = netC - netP;
  const drivers = lines.filter((l) => impact(l) !== 0).sort((a, b) => Math.abs(impact(b)) - Math.abs(impact(a)));
  const maxAbs = Math.max(...drivers.map((l) => Math.abs(impact(l))));
  const up = diff >= 0;

  return (
    <AppShell role="employee">
      <PageHeader title="Why did my salary change?" description={`${currMonth} compared with ${prevMonth}`} />

      <div className={cn("mb-4 flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center", up ? "bg-success-soft" : "bg-destructive-soft")}>
        <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-card", up ? "text-success" : "text-destructive")}>
          {up ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-muted-foreground">Your net pay {up ? "increased" : "decreased"} by</div>
          <div className={cn("text-3xl font-bold tracking-tight tabular", up ? "text-success" : "text-destructive")}>{up ? "+" : "−"}{formatINR(Math.abs(diff))}</div>
          <div className="mt-1 text-sm">
            Mainly due to <b>{drivers.filter((l) => impact(l) > 0).slice(0, 2).map((l) => l.label.toLowerCase()).join(" and ")}</b>, partly offset by <b>{drivers.filter((l) => impact(l) < 0).slice(0, 2).map((l) => l.label.toLowerCase()).join(" and ")}</b>.
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div><div className="text-xs text-muted-foreground">{prevMonth}</div><div className="font-semibold tabular">{formatINR(netP)}</div></div>
          <div><div className="text-xs text-muted-foreground">{currMonth}</div><div className="font-semibold tabular">{formatINR(netC)}</div></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Line-by-line comparison" subtitle="Rows that changed are highlighted">
          <div className="-mx-5 -mb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-y bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5">Component</th><th className="px-3 py-2.5 text-right">{prevMonth.split(" ")[0]}</th><th className="px-3 py-2.5 text-right">{currMonth.split(" ")[0]}</th><th className="px-5 py-2.5 text-right">Effect on net</th>
              </tr></thead>
              <tbody>
                <Section label="Earnings" />
                {earn.map((l) => <Row key={l.key} l={l} />)}
                <Total label="Gross salary" p={grossP} c={grossC} />
                <Section label="Deductions" />
                {ded.map((l) => <Row key={l.key} l={l} />)}
                <Total label="Net salary" p={netP} c={netC} strong />
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="What caused the change" subtitle="Ranked by impact on your take-home">
          <ul className="space-y-4">
            {drivers.map((l) => {
              const v = impact(l);
              return (
                <li key={l.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{l.label}</span>
                    <span className={cn("font-semibold tabular", v > 0 ? "text-success" : "text-destructive")}>{v > 0 ? "+" : "−"}{formatINR(Math.abs(v))}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", v > 0 ? "bg-success" : "bg-destructive")} style={{ width: `${(Math.abs(v) / maxAbs) * 100}%` }} /></div>
                  {l.reason && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{l.reason}</p>}
                </li>
              );
            })}
          </ul>
          <div className="mt-5 rounded-lg bg-muted p-3 text-xs text-muted-foreground">Basic, HRA, allowances, PF and professional tax did not change. Questions? Raise a payroll query from your payslip.</div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Section({ label }: { label: string }) {
  return <tr><td colSpan={4} className="px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</td></tr>;
}

function Row({ l }: { l: Line }) {
  const v = impact(l);
  const money = (n: number) => (n < 0 ? `− ${formatINR(-n)}` : formatINR(n));
  return (
    <tr className={cn("border-b", v > 0 && "bg-success-soft/60", v < 0 && "bg-destructive-soft/60")}>
      <td className="px-5 py-2.5">{l.label}</td>
      <td className="px-3 py-2.5 text-right text-muted-foreground tabular">{money(l.prev)}</td>
      <td className="px-3 py-2.5 text-right font-medium tabular">{money(l.curr)}</td>
      <td className="px-5 py-2.5 text-right">
        {v === 0 ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" />No change</span> : (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold tabular", v > 0 ? "text-success" : "text-destructive")}>
            {v > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{formatINR(Math.abs(v))}
          </span>
        )}
      </td>
    </tr>
  );
}

function Total({ label, p, c, strong }: { label: string; p: number; c: number; strong?: boolean }) {
  const d = c - p;
  return (
    <tr className={cn("border-b font-semibold", strong && "bg-muted/60")}>
      <td className="px-5 py-3">{label}</td>
      <td className="px-3 py-3 text-right tabular">{formatINR(p)}</td>
      <td className="px-3 py-3 text-right tabular">{formatINR(c)}</td>
      <td className={cn("px-5 py-3 text-right tabular", d >= 0 ? "text-success" : "text-destructive")}>{d >= 0 ? "+" : "−"}{formatINR(Math.abs(d))}</td>
    </tr>
  );
}
