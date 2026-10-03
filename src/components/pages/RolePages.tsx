import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  employees, departments, computeSalary, getAttendance, summarizeAttendance, attendanceLabels,
  attendanceMonths, leaveBalanceFor, payrollMonths, type AttendanceStatus, type LeaveStatus,
} from "@/lib/hr-data";
import { roleMeta } from "@/lib/navigation";
import { formatINR, formatNumber } from "@/lib/format";
import { EmptyRow, FilterSelect, KV, MiniStat, StatusPill, TableCard, td, th, theadRow, tbodyRow, statusTone } from "@/components/hr/common";

/* The signed-in demo employee: profile identity from roleMeta, pay data from mock records. */
const ME_INDEX = 0;
const meRecord = employees[ME_INDEX]!;
export const me = { ...meRecord, name: roleMeta.employee.user, email: roleMeta.employee.email, designation: roleMeta.employee.title };

const Card = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="rounded-xl border bg-card p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

/* ---------------- Departments (HR + Management) ---------------- */

export function DepartmentsTable() {
  const rows = useMemo(() => departments.map((d) => {
    const list = employees.filter((e) => e.dept === d);
    const gross = list.reduce((s, e) => s + e.monthlyGross, 0);
    return { d, count: list.length, gross, avg: list.length ? Math.round(gross / list.length) : 0 };
  }).sort((a, b) => b.gross - a.gross), []);
  const total = rows.reduce((s, r) => s + r.gross, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Departments" value={rows.length} />
        <MiniStat label="Headcount" value={formatNumber(employees.length)} />
        <MiniStat label="Monthly gross payroll" value={formatINR(total)} tone="primary" />
      </div>
      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className={theadRow}>
              <th scope="col" className={th}>Department</th>
              <th scope="col" className={`${th} text-right`}>Headcount</th>
              <th scope="col" className={`${th} text-right`}>Avg. gross</th>
              <th scope="col" className={`${th} text-right`}>Monthly gross</th>
              <th scope="col" className={`${th} text-right`}>Share</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 && <EmptyRow cols={5} text="No departments found." />}
              {rows.map((r) => (
                <tr key={r.d} className={tbodyRow}>
                  <td className={`${td} font-medium`}>{r.d}</td>
                  <td className={`${td} text-right tabular-nums`}>{r.count}</td>
                  <td className={`${td} text-right tabular-nums`}>{formatINR(r.avg)}</td>
                  <td className={`${td} text-right tabular-nums font-medium`}>{formatINR(r.gross)}</td>
                  <td className={`${td} text-right tabular-nums text-muted-foreground`}>{total ? ((r.gross / total) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  );
}

/* ---------------- Employee: profile ---------------- */

export function EmployeeProfile() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Personal & job details">
        <dl className="space-y-1">
          <KV k="Name" v={me.name} />
          <KV k="Employee ID" v={me.id} />
          <KV k="Email" v={me.email} />
          <KV k="Phone" v={me.phone} />
          <KV k="Designation" v={me.designation} />
          <KV k="Department" v={me.dept} />
          <KV k="Grade" v={me.grade} />
          <KV k="Manager" v={me.manager} />
          <KV k="Location" v={me.location} />
          <KV k="Joined" v={me.joinDate} />
        </dl>
      </Card>
      <Card title="Payroll details">
        <dl className="space-y-1">
          <KV k="Employment type" v={me.type} />
          <KV k="Status" v={<StatusPill tone={statusTone[me.status] ?? "neutral"}>{me.status}</StatusPill>} />
          <KV k="PAN" v={me.pan} />
          <KV k="Bank account" v={me.bank} />
          <KV k="Monthly gross" v={formatINR(me.monthlyGross)} strong />
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">To update bank or tax details, contact HR.</p>
      </Card>
    </div>
  );
}

/* ---------------- Employee: attendance ---------------- */

const attTone: Record<AttendanceStatus, "success" | "critical" | "warning" | "primary" | "neutral"> = { P: "success", A: "critical", L: "primary", H: "warning", W: "neutral" };

export function EmployeeAttendance() {
  const [month, setMonth] = useState(attendanceMonths[0]!.value);
  const m = attendanceMonths.find((x) => x.value === month) ?? attendanceMonths[0]!;
  const [y, mo] = m.value.split("-").map(Number) as [number, number];
  const days = getAttendance(ME_INDEX, y, mo);
  const s = summarizeAttendance(days);
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <FilterSelect value={month} onChange={setMonth} options={attendanceMonths.map((x) => ({ value: x.value, label: x.label }))} placeholder="Month" className="w-full sm:w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Attendance rate" value={`${s.rate}%`} tone="primary" />
        <MiniStat label="Present" value={s.P} tone="success" />
        <MiniStat label="Leave" value={s.L} />
        <MiniStat label="Absent" value={s.A} tone={s.A ? "critical" : "neutral"} />
      </div>
      <Card title={`Daily log — ${m.label}`}>
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7" aria-label="Daily attendance">
          {days.map((d, i) => (
            <li key={i} className="flex flex-col items-center gap-1 rounded-lg border p-2">
              <span className="text-xs text-muted-foreground">Day {i + 1}</span>
              <StatusPill tone={attTone[d]}>{attendanceLabels[d]}</StatusPill>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- Employee: leave ---------------- */

type MyLeave = { id: string; type: string; from: string; to: string; days: number; reason: string; status: LeaveStatus };
const leaveTypes = ["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off"];

export function EmployeeLeave() {
  const [items, setItems] = useState<MyLeave[]>([
    { id: "LV-3290", type: "Sick Leave", from: "2026-08-11", to: "2026-08-11", days: 1, reason: "Fever", status: "Approved" },
    { id: "LV-3301", type: "Casual Leave", from: "2026-10-09", to: "2026-10-09", days: 1, reason: "Personal work", status: "Pending" },
  ]);
  const [open, setOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "", from: "", to: "", reason: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const balance = leaveBalanceFor(ME_INDEX);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.type) err.type = "Select a leave type.";
    if (!form.from) err.from = "Choose a start date.";
    if (!form.to) err.to = "Choose an end date.";
    if (form.from && form.to && form.to < form.from) err.to = "End date must be on or after the start date.";
    if (form.reason.trim().length < 3) err.reason = "Add a short reason (at least 3 characters).";
    if (form.reason.length > 200) err.reason = "Keep the reason under 200 characters.";
    setErrors(err);
    if (Object.keys(err).length) return;
    const days = Math.round((new Date(form.to).getTime() - new Date(form.from).getTime()) / 86400000) + 1;
    setItems((p) => [{ id: `LV-${3400 + p.length}`, type: form.type, from: form.from, to: form.to, days, reason: form.reason.trim(), status: "Pending" }, ...p]);
    setOpen(false);
    setForm({ type: "", from: "", to: "", reason: "" });
    toast.success("Leave request submitted", { description: "Your manager will review it shortly." });
  };

  const fieldErr = (k: string) => errors[k] && <p id={`${k}-err`} className="text-xs text-destructive">{errors[k]}</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {balance.map((b) => <MiniStat key={b.type} label={b.type} value={`${b.total - b.used} left`} sub={`${b.used} of ${b.total} used`} />)}
      </div>
      <TableCard toolbar={
        <div className="flex w-full items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">My requests</h2>
          <Button size="sm" onClick={() => { setErrors({}); setOpen(true); }}><Plus className="h-4 w-4" /> Apply for leave</Button>
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className={theadRow}>
              {["Request", "Type", "Dates", "Days", "Reason", "Status", ""].map((h, i) => <th key={i} scope="col" className={th}>{h || <span className="sr-only">Actions</span>}</th>)}
            </tr></thead>
            <tbody>
              {items.length === 0 && <EmptyRow cols={7} text="You haven't applied for any leave yet." />}
              {items.map((l) => (
                <tr key={l.id} className={tbodyRow}>
                  <td className={`${td} font-mono text-xs`}>{l.id}</td>
                  <td className={td}>{l.type}</td>
                  <td className={`${td} whitespace-nowrap`}>{l.from}{l.to !== l.from && ` → ${l.to}`}</td>
                  <td className={`${td} tabular-nums`}>{l.days}</td>
                  <td className={`${td} max-w-[200px] truncate`} title={l.reason}>{l.reason}</td>
                  <td className={td}><StatusPill tone={statusTone[l.status] ?? "neutral"}>{l.status}</StatusPill></td>
                  <td className={`${td} text-right`}>
                    {l.status === "Pending" && <Button variant="ghost" size="sm" onClick={() => setCancelId(l.id)}>Cancel</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for leave</DialogTitle>
            <DialogDescription>Requests go to {me.manager} for approval.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lv-type">Leave type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="lv-type" aria-invalid={!!errors.type}><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{leaveTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              {fieldErr("type")}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lv-from">From</Label>
                <Input id="lv-from" type="date" value={form.from} aria-invalid={!!errors.from} aria-describedby="from-err" onChange={(e) => setForm({ ...form, from: e.target.value })} />
                {fieldErr("from")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv-to">To</Label>
                <Input id="lv-to" type="date" value={form.to} aria-invalid={!!errors.to} aria-describedby="to-err" onChange={(e) => setForm({ ...form, to: e.target.value })} />
                {fieldErr("to")}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lv-reason">Reason</Label>
              <Textarea id="lv-reason" rows={3} maxLength={200} value={form.reason} aria-invalid={!!errors.reason} aria-describedby="reason-err" onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              {fieldErr("reason")}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Submit request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this leave request?</AlertDialogTitle>
            <AlertDialogDescription>Request {cancelId} will be withdrawn. You can apply again later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setItems((p) => p.filter((x) => x.id !== cancelId)); toast.success("Leave request cancelled"); setCancelId(null); }}>
              Withdraw request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------- Employee: salary ---------------- */

export function EmployeeSalary() {
  const b = computeSalary(me.monthlyGross);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Monthly gross" value={formatINR(b.gross)} />
        <MiniStat label="Monthly deductions" value={formatINR(b.deductions)} />
        <MiniStat label="Monthly take-home" value={formatINR(b.net)} tone="primary" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Earnings">
          <dl className="space-y-1">
            <KV k="Basic" v={formatINR(b.basic)} />
            <KV k="HRA" v={formatINR(b.hra)} />
            <KV k="Allowances" v={formatINR(b.allowances)} />
            <KV k="Gross" v={formatINR(b.gross)} strong />
          </dl>
        </Card>
        <Card title="Deductions">
          <dl className="space-y-1">
            <KV k="Provident Fund" v={formatINR(b.pf)} />
            <KV k="Professional Tax" v={formatINR(b.pt)} />
            <KV k="Income Tax (TDS)" v={formatINR(b.tds)} />
            <KV k="Other" v={formatINR(b.other)} />
            <KV k="Total deductions" v={formatINR(b.deductions)} strong />
          </dl>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Annual CTC (approx.): {formatINR(b.gross * 12)}. Tax figures are estimates.</p>
    </div>
  );
}

/* ---------------- Employee: payslips ---------------- */

export function EmployeePayslips() {
  const [view, setView] = useState<string | null>(null);
  const b = computeSalary(me.monthlyGross);
  const m = payrollMonths.find((p) => p.value === view);
  const slips = payrollMonths.filter((p) => p.status === "Paid");
  return (
    <>
      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className={theadRow}>
              <th scope="col" className={th}>Month</th>
              <th scope="col" className={`${th} text-right`}>Gross</th>
              <th scope="col" className={`${th} text-right`}>Net pay</th>
              <th scope="col" className={th}>Status</th>
              <th scope="col" className={th}><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {slips.length === 0 && <EmptyRow cols={5} text="No payslips have been issued yet." />}
              {slips.map((p) => (
                <tr key={p.value} className={tbodyRow}>
                  <td className={`${td} font-medium`}>{p.label}</td>
                  <td className={`${td} text-right tabular-nums`}>{formatINR(b.gross)}</td>
                  <td className={`${td} text-right tabular-nums font-medium`}>{formatINR(b.net)}</td>
                  <td className={td}><StatusPill tone="success">Paid</StatusPill></td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    <Button variant="ghost" size="sm" onClick={() => setView(p.value)} aria-label={`View ${p.label} payslip`}><Eye className="h-4 w-4" /> View</Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Download started", { description: `${p.label} payslip (demo)` })} aria-label={`Download ${p.label} payslip`}><Download className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payslip — {m?.label}</DialogTitle>
            <DialogDescription>{me.name} · {me.id}</DialogDescription>
          </DialogHeader>
          <dl className="space-y-1">
            <KV k="Gross earnings" v={formatINR(b.gross)} />
            <KV k="Provident Fund" v={`− ${formatINR(b.pf)}`} />
            <KV k="Professional Tax" v={`− ${formatINR(b.pt)}`} />
            <KV k="Income Tax (TDS)" v={`− ${formatINR(b.tds)}`} />
            <KV k="Other" v={`− ${formatINR(b.other)}`} />
            <KV k="Net pay" v={formatINR(b.net)} strong />
          </dl>
          <DialogFooter>
            <Button variant="outline" onClick={() => setView(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
