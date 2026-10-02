import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { departments, employmentStatuses, type Employee } from "@/lib/hr-data";

export type Tone = "success" | "warning" | "critical" | "primary" | "neutral";
const toneCls: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  critical: "bg-destructive-soft text-destructive",
  primary: "bg-primary-soft text-primary",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold", toneCls[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export const statusTone: Record<string, Tone> = {
  Active: "success", Probation: "primary", "On Leave": "warning", "Notice Period": "critical",
  Approved: "success", Pending: "warning", Rejected: "critical",
  Paid: "success", Processed: "primary", "On Hold": "critical", "In review": "warning",
};

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-accent-foreground",
      size === "sm" && "h-8 w-8 text-[11px]", size === "md" && "h-9 w-9 text-xs", size === "lg" && "h-16 w-16 text-lg")}>
      {initials}
    </span>
  );
}

export function EmployeeCell({ e }: { e: Pick<Employee, "name" | "id"> & { designation?: string } }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={e.name} size="sm" />
      <div className="min-w-0">
        <div className="truncate font-medium">{e.name}</div>
        <div className="truncate text-xs text-muted-foreground">{e.id}{e.designation ? ` · ${e.designation}` : ""}</div>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 bg-card pl-9" />
    </div>
  );
}

export function FilterSelect({ value, onChange, options, placeholder, className }: {
  value: string; onChange: (v: string) => void; options: readonly { value: string; label: string }[] | readonly string[]; placeholder?: string; className?: string;
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 w-full bg-card sm:w-44", className)}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{opts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function TableCard({ toolbar, children, footer }: { toolbar?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {toolbar && <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:flex-wrap sm:items-center">{toolbar}</div>}
      <div className="overflow-x-auto">{children}</div>
      {footer && <div className="border-t px-4 py-3 text-xs text-muted-foreground">{footer}</div>}
    </div>
  );
}

export const th = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap";
export const td = "px-4 py-3 align-middle";
export const theadRow = "border-b bg-muted/50";
export const tbodyRow = "border-b last:border-0 transition-colors hover:bg-muted/40";

export function MiniStat({ label, value, sub, tone = "neutral" }: { label: string; value: ReactNode; sub?: string; tone?: Tone }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={cn("h-2 w-2 rounded-full", tone === "neutral" ? "bg-muted-foreground" : toneCls[tone].split(" ")[1].replace("text-", "bg-"))} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight tabular">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return <tr><td colSpan={cols} className="px-4 py-12 text-center text-sm text-muted-foreground">{text}</td></tr>;
}

/* ---------------- Employee add / edit dialog ---------------- */

export function EmployeeFormDialog({ open, onOpenChange, employee, onSave }: {
  open: boolean; onOpenChange: (o: boolean) => void; employee?: Employee; onSave: (e: Partial<Employee>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {open && <EmployeeForm employee={employee} onCancel={() => onOpenChange(false)} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}

function EmployeeForm({ employee, onCancel, onSave }: { employee?: Employee; onCancel: () => void; onSave: (e: Partial<Employee>) => void }) {
  const [f, setF] = useState<Partial<Employee>>(employee ?? { dept: "Engineering", status: "Probation", type: "Full-time", location: "Bengaluru", grade: "L3" });
  const set = <K extends keyof Employee>(k: K, v: Employee[K]) => setF((p) => ({ ...p, [k]: v }));
  const valid = (f.name ?? "").trim().length > 1 && /\S+@\S+\.\S+/.test(f.email ?? "") && (f.monthlyGross ?? 0) > 0;

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) onSave(f); }}>
      <DialogHeader>
        <DialogTitle>{employee ? "Edit employee" : "Add employee"}</DialogTitle>
        <DialogDescription>{employee ? `Update details for ${employee.name}.` : "Create a new employee record. They'll be included in the next payroll run."}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-5 sm:grid-cols-2">
        <Field label="Full name"><Input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aarav Patel" maxLength={80} /></Field>
        <Field label="Work email"><Input type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="aarav.patel@payflow.in" maxLength={120} /></Field>
        <Field label="Phone"><Input value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98xxxxxxxx" maxLength={16} /></Field>
        <Field label="Designation"><Input value={f.designation ?? ""} onChange={(e) => set("designation", e.target.value)} placeholder="Software Engineer" maxLength={80} /></Field>
        <Field label="Department"><FilterSelect className="sm:w-full" value={f.dept ?? ""} onChange={(v) => set("dept", v as Employee["dept"])} options={departments} /></Field>
        <Field label="Employment status"><FilterSelect className="sm:w-full" value={f.status ?? ""} onChange={(v) => set("status", v as Employee["status"])} options={employmentStatuses} /></Field>
        <Field label="Grade"><FilterSelect className="sm:w-full" value={f.grade ?? ""} onChange={(v) => set("grade", v)} options={["L1", "L2", "L3", "L4", "L5", "L6"]} /></Field>
        <Field label="Monthly gross (₹)"><Input type="number" min={0} value={f.monthlyGross ?? ""} onChange={(e) => set("monthlyGross", Number(e.target.value))} placeholder="85000" /></Field>
        <Field label="Location"><FilterSelect className="sm:w-full" value={f.location ?? ""} onChange={(v) => set("location", v)} options={["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Gurugram", "Chennai"]} /></Field>
        <Field label="Joining date"><Input type="date" value={f.joinDate ?? ""} onChange={(e) => set("joinDate", e.target.value)} /></Field>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!valid}>{employee ? "Save changes" : "Add employee"}</Button>
      </DialogFooter>
    </form>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}

export function KV({ k, v, strong }: { k: string; v: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("tabular", strong ? "font-semibold" : "font-medium")}>{v}</span>
    </div>
  );
}
