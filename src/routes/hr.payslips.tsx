import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { EmployeeCell, EmptyRow, FilterSelect, SearchInput, TableCard, tbodyRow, td, th, theadRow } from "@/components/hr/common";
import { PayslipDialog } from "@/components/hr/PayslipDialog";
import { employees, getPayroll, payrollMonths, type PayrollRow } from "@/lib/hr-data";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/hr/payslips")({
  head: () => ({
    meta: [
      { title: "Payslips — PayFlow" },
      { name: "description", content: "View, download and print monthly employee payslips." },
      { property: "og:title", content: "Payslips — PayFlow" },
      { property: "og:description", content: "View, download and print monthly employee payslips." },
    ],
  }),
  component: PayslipsPage,
});

const paidMonths = payrollMonths.filter((m) => m.status === "Paid");

function PayslipsPage() {
  const [month, setMonth] = useState("all");
  const [emp, setEmp] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<PayrollRow | null>(null);

  const all = useMemo(() => paidMonths.flatMap((m) => getPayroll(m.value).map((r) => ({ ...r, key: `${m.value}-${r.employee.id}`, monthValue: m.value }))), []);
  const rows = all.filter((r) => (month === "all" || r.monthValue === month) && (emp === "all" || r.employee.id === emp) &&
    (q === "" || `${r.employee.name} ${r.employee.id}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <AppShell role="hr">
      <PageHeader title="Payslips" description="Generated payslips for completed payroll runs."
        actions={<Button variant="outline" size="sm" onClick={() => toast.success("Bulk download started", { description: `${rows.length} payslips · ZIP` })}><Download className="h-4 w-4" /> Download all ({rows.length})</Button>} />

      <TableCard
        toolbar={<>
          <SearchInput value={q} onChange={setQ} placeholder="Search employee…" />
          <FilterSelect value={month} onChange={setMonth} options={[{ value: "all", label: "All months" }, ...paidMonths]} />
          <FilterSelect value={emp} onChange={setEmp} className="sm:w-52" options={[{ value: "all", label: "All employees" }, ...employees.map((e) => ({ value: e.id, label: e.name }))]} />
        </>}
        footer={`${rows.length} payslips`}>
        <table className="w-full text-sm">
          <thead><tr className={theadRow}>
            <th className={th}>Payslip</th><th className={th}>Employee</th><th className={th}>Month</th>
            <th className={`${th} text-right`}>Gross salary</th><th className={`${th} text-right`}>Net salary</th><th className={`${th} text-right`}>Actions</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 && <EmptyRow cols={6} text="No payslips found." />}
            {rows.slice(0, 60).map((r) => (
              <tr key={r.key} className={tbodyRow}>
                <td className={td}><div className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4 text-primary" /><span className="font-mono text-xs">PS-{r.monthValue.replace("-", "")}-{r.employee.id.slice(3)}</span></div></td>
                <td className={td}><EmployeeCell e={{ ...r.employee, designation: r.employee.dept }} /></td>
                <td className={`${td} whitespace-nowrap`}>{r.month}</td>
                <td className={`${td} text-right tabular`}>{formatINR(r.breakdown.gross)}</td>
                <td className={`${td} text-right font-semibold text-success tabular`}>{formatINR(r.breakdown.net)}</td>
                <td className={`${td} text-right`}>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download" onClick={() => toast.success("Payslip downloaded", { description: `${r.employee.name} · ${r.month}.pdf` })}><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Print" onClick={() => setView(r)}><Printer className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <PayslipDialog row={view} onOpenChange={(o) => !o && setView(null)} />
    </AppShell>
  );
}
