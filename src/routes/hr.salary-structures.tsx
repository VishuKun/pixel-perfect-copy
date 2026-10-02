import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Panel } from "@/components/dashboard/widgets";
import { Field, KV } from "@/components/hr/common";
import { salaryStructures, type SalaryStructure } from "@/lib/hr-data";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hr/salary-structures")({
  head: () => ({
    meta: [
      { title: "Salary Structures — PayFlow" },
      { name: "description", content: "Grade-wise salary templates: basic, HRA, allowances, bonus, PF, PT and TDS." },
      { property: "og:title", content: "Salary Structures — PayFlow" },
      { property: "og:description", content: "Grade-wise salary templates: basic, HRA, allowances, bonus, PF, PT and TDS." },
    ],
  }),
  component: StructuresPage,
});

function calc(s: SalaryStructure) {
  const gross = s.basic + s.hra + s.allowances + s.bonus;
  const pf = Math.round(Math.min(s.basic, 15000) * (s.pfPct / 100));
  const tds = Math.round(gross * (s.tdsPct / 100));
  const deductions = pf + s.pt + tds + s.otherDeductions;
  return { gross, pf, tds, deductions, net: gross - deductions };
}

function StructuresPage() {
  const [list, setList] = useState(salaryStructures);
  const [sel, setSel] = useState("L4");
  const [editing, setEditing] = useState<SalaryStructure | null>(null);
  const s = list.find((x) => x.grade === sel)!;
  const c = calc(s);

  return (
    <AppShell role="hr">
      <PageHeader title="Salary structures" description="Grade-wise compensation templates applied during payroll." />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-2">
          {list.map((x) => {
            const g = calc(x);
            return (
              <button key={x.grade} onClick={() => setSel(x.grade)}
                className={cn("w-full rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40", sel === x.grade && "border-primary ring-1 ring-primary")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-xs font-bold text-primary">{x.grade}</span>
                    <div><div className="text-sm font-semibold">{x.name}</div><div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" />{x.employees} employees</div></div>
                  </div>
                  <div className="text-right"><div className="text-sm font-semibold tabular">{formatINR(g.gross)}</div><div className="text-[11px] text-muted-foreground">gross / mo</div></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Grade {s.grade}</div>
              <h2 className="text-xl font-bold tracking-tight">{s.name}</h2>
              <div className="mt-1 text-sm text-muted-foreground">Effective from {new Date(s.effectiveFrom).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
            <div className="flex items-center gap-6">
              <div><div className="text-xs text-muted-foreground">Annual CTC</div><div className="text-lg font-bold tabular">{formatINR(c.gross * 12)}</div></div>
              <Button size="sm" onClick={() => setEditing(s)}><Pencil className="h-4 w-4" /> Edit structure</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Earnings" subtitle="Monthly components">
              <div className="divide-y">
                <KV k="Basic salary" v={formatINR(s.basic)} />
                <KV k="House rent allowance (HRA)" v={formatINR(s.hra)} />
                <KV k="Special allowances" v={formatINR(s.allowances)} />
                <KV k="Performance bonus" v={formatINR(s.bonus)} />
                <KV k="Overtime rate" v={s.overtimeRate ? `${formatINR(s.overtimeRate)} / hr` : "Not eligible"} />
                <KV k="Gross salary" v={formatINR(c.gross)} strong />
              </div>
            </Panel>
            <Panel title="Deductions" subtitle="Statutory & other">
              <div className="divide-y">
                <KV k={`Provident fund (${s.pfPct}% of basic, capped)`} v={formatINR(c.pf)} />
                <KV k="Professional tax" v={formatINR(s.pt)} />
                <KV k={`TDS (~${s.tdsPct}%)`} v={formatINR(c.tds)} />
                <KV k="Other deductions" v={formatINR(s.otherDeductions)} />
                <KV k="Total deductions" v={<span className="text-destructive">{formatINR(c.deductions)}</span>} strong />
              </div>
            </Panel>
          </div>

          <Panel title="Composition" subtitle="Share of gross salary">
            <div className="flex h-3 overflow-hidden rounded-full">
              {[["bg-chart-1", s.basic], ["bg-chart-2", s.hra], ["bg-chart-5", s.allowances], ["bg-chart-4", s.bonus]].map(([cls, v]) => (
                <div key={cls as string} className={cls as string} style={{ width: `${((v as number) / c.gross) * 100}%` }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {[["bg-chart-1", "Basic", s.basic], ["bg-chart-2", "HRA", s.hra], ["bg-chart-5", "Allowances", s.allowances], ["bg-chart-4", "Bonus", s.bonus]].map(([cls, l, v]) => (
                <span key={l as string} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded-sm", cls as string)} />{l as string} · {Math.round(((v as number) / c.gross) * 100)}%</span>
              ))}
              <span className="ml-auto font-semibold text-success">Net {formatINR(c.net)} / mo</span>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-xl">
          {editing && <EditForm s={editing} onCancel={() => setEditing(null)} onSave={(n) => {
            setList((l) => l.map((x) => (x.grade === n.grade ? n : x))); setEditing(null);
            toast.success(`Grade ${n.grade} structure updated`, { description: `Effective ${n.effectiveFrom}` });
          }} />}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function EditForm({ s, onCancel, onSave }: { s: SalaryStructure; onCancel: () => void; onSave: (s: SalaryStructure) => void }) {
  const [f, setF] = useState(s);
  const num = (k: keyof SalaryStructure) => (
    <Input type="number" min={0} value={f[k] as number} onChange={(e) => setF({ ...f, [k]: Math.max(0, Number(e.target.value)) })} />
  );
  const c = calc(f);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <DialogHeader><DialogTitle>Edit {f.grade} — {f.name}</DialogTitle><DialogDescription>Changes apply to {f.employees} employees from the effective date.</DialogDescription></DialogHeader>
      <div className="grid gap-4 py-5 sm:grid-cols-3">
        <Field label="Basic (₹)">{num("basic")}</Field>
        <Field label="HRA (₹)">{num("hra")}</Field>
        <Field label="Allowances (₹)">{num("allowances")}</Field>
        <Field label="Bonus (₹)">{num("bonus")}</Field>
        <Field label="Overtime (₹/hr)">{num("overtimeRate")}</Field>
        <Field label="PF (%)">{num("pfPct")}</Field>
        <Field label="Professional tax (₹)">{num("pt")}</Field>
        <Field label="TDS (%)">{num("tdsPct")}</Field>
        <Field label="Other deductions (₹)">{num("otherDeductions")}</Field>
        <Field label="Effective date"><Input type="date" value={f.effectiveFrom} onChange={(e) => setF({ ...f, effectiveFrom: e.target.value })} /></Field>
      </div>
      <div className="mb-5 grid grid-cols-3 rounded-lg bg-muted p-3 text-center text-sm">
        <div><div className="text-xs text-muted-foreground">Gross</div><div className="font-semibold tabular">{formatINR(c.gross)}</div></div>
        <div><div className="text-xs text-muted-foreground">Deductions</div><div className="font-semibold text-destructive tabular">{formatINR(c.deductions)}</div></div>
        <div><div className="text-xs text-muted-foreground">Net</div><div className="font-semibold text-success tabular">{formatINR(c.net)}</div></div>
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save structure</Button></DialogFooter>
    </form>
  );
}
