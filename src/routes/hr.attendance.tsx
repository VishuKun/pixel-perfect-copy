import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeeCell, Field, FilterSelect, MiniStat, SearchInput, TableCard, th, theadRow } from "@/components/hr/common";
import { attendanceLabels, attendanceMonths, departments, employees, getAttendance, summarizeAttendance, type AttendanceStatus } from "@/lib/hr-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hr/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — PayFlow" },
      { name: "description", content: "Monthly attendance register with present, absent, leave and half-day tracking." },
      { property: "og:title", content: "Attendance — PayFlow" },
      { property: "og:description", content: "Monthly attendance register with present, absent, leave and half-day tracking." },
    ],
  }),
  component: AttendancePage,
});

const cellCls: Record<AttendanceStatus, string> = {
  P: "bg-success-soft text-success", A: "bg-destructive-soft text-destructive", L: "bg-primary-soft text-primary", H: "bg-warning-soft text-warning", W: "text-muted-foreground/40",
};
const cycle: AttendanceStatus[] = ["P", "H", "L", "A"];

function AttendancePage() {
  const [month, setMonth] = useState(attendanceMonths[0].value);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [emp, setEmp] = useState("all");
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({});
  const [markOpen, setMarkOpen] = useState(false);

  const m = attendanceMonths.find((x) => x.value === month)!;
  const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();

  const data = useMemo(() => employees.map((e, i) => {
    const days = getAttendance(i, m.year, m.month).map((d, di) => overrides[`${month}|${e.id}|${di}`] ?? d);
    return { e, days, s: summarizeAttendance(days) };
  }), [month, m, overrides]);

  const rows = data.filter(({ e }) => (dept === "all" || e.dept === dept) && (emp === "all" || e.id === emp) &&
    (q === "" || `${e.name} ${e.id}`.toLowerCase().includes(q.toLowerCase())));

  const totals = rows.reduce((a, r) => ({ P: a.P + r.s.P, A: a.A + r.s.A, L: a.L + r.s.L, H: a.H + r.s.H, working: a.working + r.s.working }), { P: 0, A: 0, L: 0, H: 0, working: 0 });
  const rate = totals.working ? ((totals.P + totals.H * 0.5) / totals.working * 100).toFixed(1) : "0";

  const toggle = (empId: string, di: number, cur: AttendanceStatus) => {
    if (cur === "W") return;
    const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
    setOverrides((o) => ({ ...o, [`${month}|${empId}|${di}`]: next }));
  };

  return (
    <AppShell role="hr">
      <PageHeader title="Attendance" description="Click any day in the register to cycle its status."
        actions={<Button size="sm" onClick={() => setMarkOpen(true)}><CalendarPlus className="h-4 w-4" /> Mark attendance</Button>} />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MiniStat label="Attendance rate" value={`${rate}%`} sub={m.label} tone="primary" />
        <MiniStat label="Present" value={totals.P} sub="person-days" tone="success" />
        <MiniStat label="Absent" value={totals.A} sub="person-days" tone="critical" />
        <MiniStat label="On leave" value={totals.L} sub="person-days" tone="primary" />
        <MiniStat label="Half-days" value={totals.H} sub="person-days" tone="warning" />
      </div>

      <TableCard
        toolbar={<>
          <FilterSelect value={month} onChange={setMonth} options={attendanceMonths} />
          <SearchInput value={q} onChange={setQ} placeholder="Search employee…" />
          <FilterSelect value={dept} onChange={setDept} options={[{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
          <FilterSelect value={emp} onChange={setEmp} className="sm:w-52" options={[{ value: "all", label: "All employees" }, ...employees.map((e) => ({ value: e.id, label: e.name }))]} />
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground sm:ml-auto">
            {(["P", "A", "L", "H"] as const).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={cn("grid h-4 w-4 place-items-center rounded text-[9px] font-bold", cellCls[k])}>{k}</span>{attendanceLabels[k]}</span>)}
          </div>
        </>}
        footer={`${rows.length} employees · ${m.label}`}>
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead><tr className={theadRow}>
            <th className={cn(th, "sticky left-0 z-10 min-w-[220px] border-b bg-muted")}>Employee</th>
            {Array.from({ length: daysInMonth }, (_, d) => {
              const dow = new Date(m.year, m.month, d + 1).getDay();
              return <th key={d} className={cn("border-b px-0.5 py-2 text-center text-[10px] font-semibold text-muted-foreground", (dow === 0 || dow === 6) && "text-muted-foreground/50")}>
                <div>{"SMTWTFS"[dow]}</div><div className="text-[11px] text-foreground">{d + 1}</div></th>;
            })}
            <th className={cn(th, "border-b text-center")}>P</th><th className={cn(th, "border-b text-center")}>A</th><th className={cn(th, "border-b text-center")}>L</th><th className={cn(th, "border-b text-right")}>Rate</th>
          </tr></thead>
          <tbody>
            {rows.map(({ e, days, s }) => (
              <tr key={e.id} className="group">
                <td className="sticky left-0 z-10 border-b bg-card px-4 py-2 group-hover:bg-muted"><EmployeeCell e={e} /></td>
                {days.map((d, di) => (
                  <td key={di} className="border-b px-0.5 py-2 text-center group-hover:bg-muted/40">
                    <button onClick={() => toggle(e.id, di, d)} disabled={d === "W"} title={`${di + 1} · ${attendanceLabels[d]}`}
                      className={cn("grid h-6 w-6 place-items-center rounded text-[10px] font-bold transition-transform enabled:hover:scale-110", cellCls[d])}>
                      {d === "W" ? "·" : d}
                    </button>
                  </td>
                ))}
                <td className="border-b px-3 text-center font-medium text-success tabular">{s.P}</td>
                <td className="border-b px-3 text-center font-medium text-destructive tabular">{s.A}</td>
                <td className="border-b px-3 text-center font-medium text-primary tabular">{s.L}</td>
                <td className="border-b px-4 text-right font-semibold tabular">{s.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <MarkDialog open={markOpen} onOpenChange={setMarkOpen} daysInMonth={daysInMonth} monthLabel={m.label}
        onSave={(ids, day, status) => {
          setOverrides((o) => { const n = { ...o }; ids.forEach((id) => { n[`${month}|${id}|${day - 1}`] = status; }); return n; });
          toast.success("Attendance marked", { description: `${ids.length} employee(s) · ${day} ${m.label} · ${attendanceLabels[status]}` });
          setMarkOpen(false);
        }} />
    </AppShell>
  );
}

function MarkDialog({ open, onOpenChange, daysInMonth, monthLabel, onSave }: {
  open: boolean; onOpenChange: (o: boolean) => void; daysInMonth: number; monthLabel: string; onSave: (ids: string[], day: number, s: AttendanceStatus) => void;
}) {
  const [day, setDay] = useState(30);
  const [status, setStatus] = useState<AttendanceStatus>("P");
  const [dept, setDept] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const list = employees.filter((e) => dept === "all" || e.dept === dept);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Mark attendance</DialogTitle><DialogDescription>Apply a status to one or more employees for a day in {monthLabel}.</DialogDescription></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Day"><Input type="number" min={1} max={daysInMonth} value={day} onChange={(e) => setDay(Math.min(daysInMonth, Math.max(1, Number(e.target.value))))} /></Field>
          <Field label="Department"><FilterSelect className="sm:w-full" value={dept} onChange={setDept} options={[{ value: "all", label: "All" }, ...departments.map((d) => ({ value: d, label: d }))]} /></Field>
        </div>
        <Field label="Status">
          <div className="grid grid-cols-4 gap-2">
            {cycle.map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={cn("rounded-lg border px-2 py-2 text-xs font-semibold transition-colors", status === s ? cn(cellCls[s], "border-current") : "hover:bg-muted")}>{attendanceLabels[s]}</button>
            ))}
          </div>
        </Field>
        <div className="max-h-56 overflow-y-auto rounded-lg border">
          <label className="flex items-center gap-3 border-b bg-muted/50 px-3 py-2 text-xs font-semibold">
            <input type="checkbox" className="accent-primary" checked={list.length > 0 && list.every((e) => selected.includes(e.id))}
              onChange={(ev) => setSelected(ev.target.checked ? list.map((e) => e.id) : [])} /> Select all ({list.length})
          </label>
          {list.map((e) => (
            <label key={e.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40">
              <input type="checkbox" className="accent-primary" checked={selected.includes(e.id)}
                onChange={(ev) => setSelected((s) => ev.target.checked ? [...s, e.id] : s.filter((x) => x !== e.id))} />
              <span className="font-medium">{e.name}</span><span className="text-xs text-muted-foreground">{e.dept}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={selected.length === 0} onClick={() => { onSave(selected, day, status); setSelected([]); }}>Mark {selected.length || ""} employee{selected.length === 1 ? "" : "s"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
