import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ProcessingStatus } from "@/components/dashboard/widgets";
import { EmployeeCell, EmptyRow, FilterSelect, MiniStat, SearchInput, StatusPill, TableCard, statusTone, tbodyRow, td, th, theadRow } from "@/components/hr/common";
import { PayslipDialog } from "@/components/hr/PayslipDialog";
import { departments, getPayroll, payrollMonths, type PayrollRow } from "@/lib/hr-data";
import { formatINR, formatINRCompact } from "@/lib/format";

export const Route = createFileRoute("/hr/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll Runs — PayFlow" },
      { name: "description", content: "Process monthly payroll: gross, deductions, net pay and status per employee." },
      { property: "og:title", content: "Payroll Runs — PayFlow" },
      { property: "og:description", content: "Process monthly payroll: gross, deductions, net pay and status per employee." },
    ],
  }),
  component: PayrollPage,
});

function PayrollPage() {
  const [month, setMonth] = useState(payrollMonths[0]!.value);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<PayrollRow | null>(null);
  const meta = payrollMonths.find((m) => m.value === month)!;
  const all = useMemo(() => getPayroll(month), [month]);
  const rows = all.filter((r) => (dept === "all" || r.employee.dept === dept) && (status === "all" || r.status === status) &&
    (q === "" || `${r.employee.name} ${r.employee.id}`.toLowerCase().includes(q.toLowerCase())));
  const sum = (k: "gross" | "deductions" | "net") => all.reduce((a, r) => a + r.breakdown[k], 0);
  const inReview = meta.status === "In review";

  return (
    <AppShell role="hr">
      <PageHeader title="Payroll" description={`${meta.label} · ${all.length} employees`}
        actions={<>
          <FilterSelect value={month} onChange={setMonth} options={payrollMonths} />
          {inReview
            ? <Button size="sm" onClick={() => toast.success("Sent for approval", { description: `${meta.label} payroll routed to CFO` })}><Send className="h-4 w-4" /> Submit for approval</Button>
            : <Button size="sm" variant="outline" disabled><CheckCircle2 className="h-4 w-4" /> Paid</Button>}
        </>} />

      <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid grid-cols-2 gap-4">
          <MiniStat label="Gross payroll" value={formatINRCompact(sum("gross"))} sub="Before deductions" tone="primary" />
          <MiniStat label="Total deductions" value={formatINRCompact(sum("deductions"))} sub="PF · PT · TDS · other" tone="warning" />
          <MiniStat label="Net payout" value={formatINRCompact(sum("net"))} sub="To be disbursed" tone="success" />
          <MiniStat label="Run status" value={<StatusPill tone={statusTone[meta.status]}>{meta.status}</StatusPill>} sub={inReview ? `${all.filter((r) => r.status === "On Hold").length} on hold · ${all.filter((r) => r.status === "Pending").length} pending` : "Disbursed on last working day"} />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 text-sm font-semibold">Processing status</div>
          {inReview ? <ProcessingStatus /> : <div className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> All steps completed</div>}
        </div>
      </div>

      <TableCard
        toolbar={<>
          <SearchInput value={q} onChange={setQ} placeholder="Search employee…" />
          <FilterSelect value={dept} onChange={setDept} options={[{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
          <FilterSelect value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, ...["Paid", "Processed", "Pending", "On Hold"].map((d) => ({ value: d, label: d }))]} />
        </>}
        footer={<div className="flex justify-between"><span>{rows.length} employees</span><span className="font-medium text-foreground tabular">Net total {formatINR(rows.reduce((a, r) => a + r.breakdown.net, 0))}</span></div>}>
        <table className="w-full text-sm">
          <thead><tr className={theadRow}>
            <th className={th}>Employee</th><th className={th}>Paid days</th><th className={`${th} text-right`}>Gross</th><th className={`${th} text-right`}>Deductions</th>
            <th className={`${th} text-right`}>Net salary</th><th className={th}>Status</th><th className={th} />
          </tr></thead>
          <tbody>
            {rows.length === 0 && <EmptyRow cols={7} text="No payroll records match." />}
            {rows.map((r) => (
              <tr key={r.employee.id} className={tbodyRow}>
                <td className={td}><EmployeeCell e={{ ...r.employee, designation: r.employee.dept }} /></td>
                <td className={`${td} tabular ${r.paidDays < r.workingDays ? "text-warning" : "text-muted-foreground"}`}>{r.paidDays}/{r.workingDays}</td>
                <td className={`${td} text-right font-medium tabular`}>{formatINR(r.breakdown.gross)}</td>
                <td className={`${td} text-right text-destructive tabular`}>− {formatINR(r.breakdown.deductions)}</td>
                <td className={`${td} text-right font-semibold text-success tabular`}>{formatINR(r.breakdown.net)}</td>
                <td className={td}><StatusPill tone={statusTone[r.status]}>{r.status}</StatusPill></td>
                <td className={`${td} text-right`}><Button variant="ghost" size="sm" className="h-8 text-primary" onClick={() => setView(r)}><Eye className="h-4 w-4" /> Details</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <PayslipDialog row={view} onOpenChange={(o) => !o && setView(null)} />
    </AppShell>
  );
}
