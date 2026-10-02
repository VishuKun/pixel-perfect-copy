import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Briefcase, Calendar, Mail, MapPin, Pencil, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/dashboard/widgets";
import { Avatar, EmployeeFormDialog, KV, MiniStat, StatusPill, statusTone } from "@/components/hr/common";
import { attendanceLabels, computeSalary, employees, getAttendance, leaveBalanceFor, summarizeAttendance, type AttendanceStatus, type Employee } from "@/lib/hr-data";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hr/employees/$id")({
  loader: ({ params }) => {
    const index = employees.findIndex((e) => e.id === params.id);
    if (index < 0) throw notFound();
    return { index };
  },
  head: ({ loaderData }) => {
    const e = loaderData ? employees[loaderData.index] : undefined;
    const title = e ? `${e.name} — Employee profile · PayFlow` : "Employee not found — PayFlow";
    const desc = e ? `${e.designation}, ${e.dept}. Salary, attendance and leave for ${e.name}.` : "Employee profile";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }] };
  },
  notFoundComponent: () => (
    <AppShell role="hr"><div className="py-20 text-center"><h1 className="text-xl font-semibold">Employee not found</h1>
      <Link to="/hr/employees" className="mt-3 inline-block text-sm text-primary">Back to employees</Link></div></AppShell>
  ),
  component: ProfilePage,
});

const dayCls: Record<AttendanceStatus, string> = {
  P: "bg-success-soft text-success", A: "bg-destructive-soft text-destructive", L: "bg-primary-soft text-primary", H: "bg-warning-soft text-warning", W: "bg-muted text-muted-foreground/60",
};

function ProfilePage() {
  const { index } = Route.useLoaderData();
  const [emp, setEmp] = useState<Employee>(employees[index]);
  const [editing, setEditing] = useState(false);
  const s = computeSalary(emp.monthlyGross);
  const days = getAttendance(index, 2026, 8);
  const att = summarizeAttendance(days);
  const offset = new Date(2026, 8, 1).getDay();

  return (
    <AppShell role="hr">
      <Link to="/hr/employees" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Employees</Link>

      <div className="mb-4 rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={emp.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{emp.name}</h1>
              <StatusPill tone={statusTone[emp.status]}>{emp.status}</StatusPill>
            </div>
            <p className="text-sm text-muted-foreground">{emp.designation} · {emp.dept} · {emp.id}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{emp.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{emp.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{emp.location}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit</Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Monthly gross" value={formatINR(s.gross)} sub={`${formatINR(s.gross * 12)} per year`} tone="primary" />
        <MiniStat label="Net take-home" value={formatINR(s.net)} sub="After PF, PT & TDS" tone="success" />
        <MiniStat label="Attendance (Sep)" value={`${att.rate}%`} sub={`${att.P} present · ${att.A} absent`} tone={att.rate > 90 ? "success" : "warning"} />
        <MiniStat label="Leave balance" value={leaveBalanceFor(index).reduce((a, l) => a + l.total - l.used, 0)} sub="days available" tone="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Salary information" subtitle={`Grade ${emp.grade} · effective 1 Apr 2026`} className="lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="divide-y">
              <div className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Earnings</div>
              <KV k="Basic salary" v={formatINR(s.basic)} />
              <KV k="HRA" v={formatINR(s.hra)} />
              <KV k="Special allowances" v={formatINR(s.allowances)} />
              <KV k="Gross" v={formatINR(s.gross)} strong />
            </div>
            <div className="divide-y">
              <div className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Deductions</div>
              <KV k="Provident fund" v={formatINR(s.pf)} />
              <KV k="Professional tax" v={formatINR(s.pt)} />
              <KV k="TDS" v={formatINR(s.tds)} />
              <KV k="Other" v={formatINR(s.other)} />
              <KV k="Net pay" v={<span className="text-success">{formatINR(s.net)}</span>} strong />
            </div>
          </div>
        </Panel>

        <Panel title="Employment details">
          <div className="space-y-3 text-sm">
            {[[Briefcase, "Type", emp.type], [Calendar, "Joined", new Date(emp.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
              [User, "Reports to", emp.manager], [User, "PAN", emp.pan], [User, "Bank account", emp.bank]].map(([Icon, k, v]) => {
              const I = Icon as typeof User;
              return <div key={k as string} className="flex items-center gap-3"><I className="h-4 w-4 text-muted-foreground" /><span className="w-24 text-muted-foreground">{k as string}</span><span className="font-medium">{v as string}</span></div>;
            })}
          </div>
        </Panel>

        <Panel title="Attendance summary" subtitle="September 2026" className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="pb-1 font-medium text-muted-foreground">{d}</div>)}
            {Array.from({ length: offset }).map((_, i) => <div key={`o${i}`} />)}
            {days.map((d, i) => (
              <div key={i} title={attendanceLabels[d]} className={cn("rounded-md py-2 font-semibold", dayCls[d])}>{i + 1}</div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {(["P", "A", "L", "H"] as const).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded", dayCls[k])} />{attendanceLabels[k]} · {att[k]}</span>)}
          </div>
        </Panel>

        <Panel title="Leave balance" subtitle="FY 2026–27">
          <div className="space-y-4">
            {leaveBalanceFor(index).map((l) => (
              <div key={l.type}>
                <div className="flex justify-between text-sm"><span className="font-medium">{l.type}</span><span className="text-muted-foreground tabular">{l.total - l.used} / {l.total}</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${((l.total - l.used) / l.total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <EmployeeFormDialog open={editing} employee={emp} onOpenChange={setEditing}
        onSave={(d) => { setEmp((e) => ({ ...e, ...d })); setEditing(false); toast.success("Profile updated"); }} />
    </AppShell>
  );
}
