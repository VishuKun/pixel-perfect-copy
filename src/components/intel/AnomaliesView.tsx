import { useState } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, Search as SearchIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeeCell, EmptyRow, FilterSelect, MiniStat, SearchInput, StatusPill, TableCard, tbodyRow, td, th, theadRow, type Tone } from "@/components/hr/common";
import { anomalyList, type Anomaly, type AnomalySeverity, type AnomalyStatus } from "@/lib/intel-data";
import { cn } from "@/lib/utils";

const sevTone: Record<AnomalySeverity, Tone> = { Critical: "critical", Warning: "warning", Info: "primary" };
const statusTone: Record<AnomalyStatus, Tone> = { Open: "critical", Investigating: "warning", Resolved: "success", Dismissed: "neutral" };
const sevIcon = { Critical: AlertOctagon, Warning: AlertTriangle, Info };
const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function AnomaliesView({ canAct = true }: { canAct?: boolean }) {
  const [list, setList] = useState(anomalyList);
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("active");
  const [open, setOpen] = useState<Anomaly | null>(null);

  const types = [...new Set(anomalyList.map((a) => a.type))];
  const rows = list.filter((a) => (sev === "all" || a.severity === sev) && (type === "all" || a.type === type) &&
    (status === "all" || (status === "active" ? a.status === "Open" || a.status === "Investigating" : a.status === status)) &&
    (q === "" || `${a.employee} ${a.empId} ${a.id}`.toLowerCase().includes(q.toLowerCase())));
  const active = list.filter((a) => a.status === "Open" || a.status === "Investigating");

  const update = (id: string, s: AnomalyStatus) => {
    setList((l) => l.map((a) => (a.id === id ? { ...a, status: s } : a)));
    setOpen(null);
    toast.success(`Anomaly ${id} marked ${s.toLowerCase()}`);
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Critical (open)" value={active.filter((a) => a.severity === "Critical").length} sub="Blocking payroll approval" tone="critical" />
        <MiniStat label="Warnings (open)" value={active.filter((a) => a.severity === "Warning").length} sub="Review before disbursal" tone="warning" />
        <MiniStat label="Info (open)" value={active.filter((a) => a.severity === "Info").length} sub="Low risk" tone="primary" />
        <MiniStat label="Resolved this cycle" value={list.filter((a) => a.status === "Resolved" || a.status === "Dismissed").length} sub="of 10 detected" tone="success" />
      </div>

      <TableCard
        toolbar={<>
          <SearchInput value={q} onChange={setQ} placeholder="Search employee or ID…" />
          <FilterSelect value={sev} onChange={setSev} className="sm:w-36" options={[{ value: "all", label: "All severities" }, "Critical", "Warning", "Info"].map((o) => typeof o === "string" ? { value: o, label: o } : o)} />
          <FilterSelect value={type} onChange={setType} className="sm:w-56" options={[{ value: "all", label: "All anomaly types" }, ...types.map((t) => ({ value: t, label: t }))]} />
          <FilterSelect value={status} onChange={setStatus} className="sm:w-40" options={[{ value: "active", label: "Open & investigating" }, { value: "all", label: "All statuses" }, ...["Open", "Investigating", "Resolved", "Dismissed"].map((t) => ({ value: t, label: t }))]} />
        </>}
        footer={`${rows.length} anomalies · Detection runs after every payroll computation`}>
        <table className="w-full text-sm">
          <thead><tr className={theadRow}>
            <th className={th}>Severity</th><th className={th}>Employee</th><th className={th}>Anomaly</th><th className={`${th} text-right`}>Expected</th><th className={`${th} text-right`}>Actual</th>
            <th className={th}>Detected</th><th className={th}>Status</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 && <EmptyRow cols={7} text="No anomalies match these filters." />}
            {rows.map((a) => {
              const Icon = sevIcon[a.severity];
              return (
                <tr key={a.id} className={cn(tbodyRow, "cursor-pointer")} onClick={() => setOpen(a)}>
                  <td className={td}><StatusPill tone={sevTone[a.severity]}><Icon className="-ml-0.5 h-3 w-3" />{a.severity}</StatusPill></td>
                  <td className={td}><EmployeeCell e={{ name: a.employee, id: a.empId, designation: a.dept }} /></td>
                  <td className={`${td} max-w-[320px]`}><div className="font-medium">{a.type}</div><div className="line-clamp-1 text-xs text-muted-foreground">{a.description}</div></td>
                  <td className={`${td} whitespace-nowrap text-right text-muted-foreground tabular`}>{a.expected}</td>
                  <td className={`${td} whitespace-nowrap text-right tabular`}><div className="font-semibold">{a.actual}</div><div className={cn("text-xs font-medium", a.severity === "Critical" ? "text-destructive" : a.severity === "Warning" ? "text-warning" : "text-primary")}>{a.variance}</div></td>
                  <td className={`${td} whitespace-nowrap text-muted-foreground`}>{fmt(a.detected)}</td>
                  <td className={td}><StatusPill tone={statusTone[a.status]}>{a.status}</StatusPill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-lg">
          {open && (<>
            <DialogHeader>
              <div className="mb-1 flex gap-2"><StatusPill tone={sevTone[open.severity]}>{open.severity}</StatusPill><StatusPill tone={statusTone[open.status]}>{open.status}</StatusPill></div>
              <DialogTitle>{open.type}</DialogTitle>
              <DialogDescription>{open.id} · {open.employee} ({open.empId}) · {open.dept}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Expected</div><div className="mt-1 font-semibold tabular">{open.expected}</div></div>
              <div className="rounded-lg border border-destructive/30 bg-destructive-soft p-3"><div className="text-xs text-muted-foreground">Actual</div><div className="mt-1 font-semibold tabular">{open.actual} <span className="text-xs text-destructive">{open.variance}</span></div></div>
            </div>
            <p className="text-sm leading-relaxed">{open.description}</p>
            <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Detection rule:</span> {open.rule} · detected {fmt(open.detected)}</div>
            {canAct && open.status !== "Resolved" && open.status !== "Dismissed" && (
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => update(open.id, "Dismissed")}><X className="h-4 w-4" /> Dismiss</Button>
                {open.status === "Open" && <Button variant="outline" onClick={() => update(open.id, "Investigating")}><SearchIcon className="h-4 w-4" /> Investigate</Button>}
                <Button onClick={() => update(open.id, "Resolved")}><CheckCircle2 className="h-4 w-4" /> Mark resolved</Button>
              </DialogFooter>
            )}
          </>)}
        </DialogContent>
      </Dialog>
    </>
  );
}
