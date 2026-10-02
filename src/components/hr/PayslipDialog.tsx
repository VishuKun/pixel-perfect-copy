import { Download, Printer, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import type { PayrollRow } from "@/lib/hr-data";

export function PayslipDialog({ row, onOpenChange }: { row: PayrollRow | null; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={!!row} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {row && <Payslip row={row} />}
      </DialogContent>
    </Dialog>
  );
}

export function Payslip({ row }: { row: PayrollRow }) {
  const { employee: e, breakdown: b } = row;
  const earnings = [["Basic salary", b.basic], ["House rent allowance", b.hra], ["Special allowances", b.allowances], ["Bonus", b.bonus], ["Overtime", b.overtime]] as const;
  const deductions = [["Provident fund (PF)", b.pf], ["Professional tax", b.pt], ["Income tax (TDS)", b.tds], ["Other deductions", b.other]] as const;
  const lop = b.basic + b.hra + b.allowances + b.bonus + b.overtime - b.gross;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4 pr-8">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Workflow className="h-4 w-4" /></div>
          <div>
            <DialogTitle className="text-base">Payslip — {row.month}</DialogTitle>
            <div className="text-xs text-muted-foreground">PayFlow Technologies Pvt. Ltd. · Bengaluru 560103</div>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
          <Button size="sm" onClick={() => toast.success("Payslip downloaded", { description: `${e.name} · ${row.month}.pdf` })}><Download className="h-4 w-4" /> PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-4 text-sm sm:grid-cols-3">
        {[["Employee", e.name], ["Employee ID", e.id], ["Designation", e.designation], ["Department", e.dept], ["PAN", e.pan], ["Bank", e.bank], ["Paid days", `${row.paidDays} / ${row.workingDays}`], ["Location", e.location], ["Grade", e.grade]].map(([k, v]) => (
          <div key={k}><div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div><div className="font-medium">{v}</div></div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Column title="Earnings" rows={[...earnings, ...(lop > 0 ? [["Loss of pay", -lop] as const] : [])]} total={["Gross earnings", b.gross]} />
        <Column title="Deductions" rows={deductions} total={["Total deductions", b.deductions]} negative />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-success-soft px-4 py-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Net pay</div>
          <div className="text-xs text-muted-foreground">Credited to {e.bank}</div>
        </div>
        <div className="text-2xl font-bold text-success tabular">{formatINR(b.net)}</div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">This is a system-generated payslip and does not require a signature.</p>
    </div>
  );
}

function Column({ title, rows, total, negative }: { title: string; rows: readonly (readonly [string, number])[]; total: readonly [string, number]; negative?: boolean }) {
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="divide-y px-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className={`font-medium tabular ${v < 0 ? "text-destructive" : ""}`}>{v < 0 ? `− ${formatINR(-v)}` : formatINR(v)}</span>
          </div>
        ))}
      </div>
      <div className={`flex justify-between border-t px-4 py-2.5 text-sm font-semibold ${negative ? "text-destructive" : ""}`}>
        <span>{total[0]}</span><span className="tabular">{formatINR(total[1])}</span>
      </div>
    </div>
  );
}
