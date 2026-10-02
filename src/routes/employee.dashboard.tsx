import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Download, FileText, Landmark, Plane, PiggyBank, Receipt, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Panel, StatCard } from "@/components/dashboard/widgets";
import { employeeAlerts, employeeLedger, explanation } from "@/lib/intel-data";
import { employees, getAttendance, leaveBalanceFor, summarizeAttendance } from "@/lib/hr-data";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const t = "My Dashboard — PayFlow";
const d = "Your salary, attendance, leave balance, payslips and payroll alerts at a glance.";
export const Route = createFileRoute("/employee/dashboard")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: EmployeeDashboard,
});

const meIndex = employees.findIndex((e) => e.name === "Rahul Verma");
export const alertCls = { warning: "bg-warning-soft", info: "bg-primary-soft", success: "bg-success-soft" };
export const alertDot = { warning: "bg-warning", info: "bg-primary", success: "bg-success" };

function EmployeeDashboard() {
  const cur = employeeLedger[employeeLedger.length - 1]!, prev = employeeLedger[employeeLedger.length - 2]!;
  const att = summarizeAttendance(getAttendance(meIndex, 2026, 8));
  const leave = leaveBalanceFor(meIndex).reduce((a, l) => a + l.total - l.used, 0);
  const diff = cur.net - prev.net;
  const ytdPf = employeeLedger.slice(-6).reduce((a, r) => a + r.pf, 0);
  const ytdTax = employeeLedger.slice(-6).reduce((a, r) => a + r.tax, 0);
  const drivers = explanation.lines.filter((l) => l.reason).slice(0, 3);

  return (
    <AppShell role="employee">
      <PageHeader title="Good evening, Rahul" description="Senior Software Engineer · Engineering · September 2026" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross salary (Sep)" value={formatINR(cur.gross)} delta={Math.round(((cur.gross - prev.gross) / prev.gross) * 1000) / 10} icon={Wallet} accent="primary" foot="vs August" />
        <StatCard label="Net salary (Sep)" value={formatINR(cur.net)} delta={Math.round((diff / prev.net) * 1000) / 10} icon={TrendingUp} accent="success" foot={`${diff >= 0 ? "+" : "−"}${formatINR(Math.abs(diff))} vs August`} />
        <StatCard label="Attendance" value={`${att.rate}%`} icon={CalendarCheck} accent="primary" foot={`${att.P} present · ${att.A} absent · ${att.L} leave`} />
        <StatCard label="Leave balance" value={`${leave} days`} icon={Plane} accent="warning" foot="Casual, sick, earned & comp off" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Latest payslip" subtitle="September 2026 · credited 30 Sep">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><FileText className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1"><div className="text-sm font-semibold">PS-202609-1444</div><div className="text-xs text-muted-foreground">HDFC Bank ••4649</div></div>
            <div className="text-right font-bold text-success tabular">{formatINR(cur.net)}</div>
          </div>
          <div className="mt-3 divide-y text-sm">
            {[["Gross", cur.gross], ["Deductions", -cur.deductions], ["Net pay", cur.net]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2"><span className="text-muted-foreground">{k}</span><span className={cn("font-medium tabular", (v as number) < 0 && "text-destructive")}>{(v as number) < 0 ? `− ${formatINR(-(v as number))}` : formatINR(v as number)}</span></div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild><Link to="/$role/$page" params={{ role: "employee", page: "payslips" }}>View all</Link></Button>
            <Button size="sm" className="flex-1" onClick={() => toast.success("Payslip downloaded", { description: "September 2026.pdf" })}><Download className="h-4 w-4" /> PDF</Button>
          </div>
        </Panel>

        <Panel title="Why did my salary change?" subtitle={`${diff >= 0 ? "Up" : "Down"} ${formatINR(Math.abs(diff))} from August`}
          action={<Link to="/employee/explanation" className="text-xs font-medium text-primary">Details</Link>}>
          <ul className="space-y-3">
            {drivers.map((l) => {
              const v = l.kind === "earning" ? l.curr - l.prev : l.prev - l.curr;
              return (
                <li key={l.key} className="flex gap-3 text-sm">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", v > 0 ? "bg-success" : "bg-destructive")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2"><span className="font-medium">{l.label}</span><span className={cn("font-semibold tabular", v > 0 ? "text-success" : "text-destructive")}>{v > 0 ? "+" : "−"}{formatINR(Math.abs(v))}</span></div>
                    <p className="text-xs text-muted-foreground">{l.reason}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Salary forecast" subtitle="Estimate for October 2026 · not guaranteed"
          action={<Link to="/employee/forecast" className="text-xs font-medium text-primary">Details</Link>}>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-xs text-muted-foreground">Estimated net range</div>
            <div className="mt-1 text-xl font-bold tabular">₹1,46,100 – ₹1,58,000</div>
            <div className="mt-1 text-xs text-muted-foreground">Most likely ~₹1,53,500</div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Lower than September because the quarterly bonus is not expected next month. Overtime is the main source of variance.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><PiggyBank className="h-3.5 w-3.5" />PF (6 mo)</div><div className="mt-1 font-semibold tabular">{formatINR(ytdPf)}</div><div className="text-[11px] text-muted-foreground">+ equal employer share</div></div>
            <div className="rounded-lg border p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Landmark className="h-3.5 w-3.5" />Tax paid (6 mo)</div><div className="mt-1 font-semibold tabular">{formatINR(ytdTax)}</div><div className="text-[11px] text-muted-foreground">TDS deducted</div></div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="This month at a glance" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-4">
            {[["PF contribution", cur.pf, PiggyBank], ["Income tax (TDS)", cur.tax, Landmark], ["Professional tax", cur.pt, Receipt], ["Other deductions", cur.other, Receipt]].map(([k, v, I]) => {
              const Icon = I as typeof Receipt;
              return <div key={k as string} className="rounded-lg border p-3"><Icon className="h-4 w-4 text-muted-foreground" /><div className="mt-2 text-xs text-muted-foreground">{k as string}</div><div className="font-semibold tabular">{formatINR(v as number)}</div></div>;
            })}
          </div>
          <Link to="/employee/financial" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open financial dashboard <ArrowRight className="h-4 w-4" /></Link>
        </Panel>
        <Panel title="Payroll alerts">
          <ul className="space-y-2.5">
            {employeeAlerts.map((a) => (
              <li key={a.title} className={cn("flex gap-3 rounded-lg p-3", alertCls[a.severity])}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", alertDot[a.severity])} />
                <div className="min-w-0"><div className="text-sm font-medium">{a.title}</div><div className="text-xs text-muted-foreground">{a.desc}</div></div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
