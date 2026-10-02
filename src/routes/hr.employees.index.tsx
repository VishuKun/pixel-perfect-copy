import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Plus, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  EmployeeCell, EmployeeFormDialog, EmptyRow, FilterSelect, MiniStat, SearchInput, StatusPill, TableCard, statusTone, tbodyRow, td, th, theadRow,
} from "@/components/hr/common";
import { departments, employees as seed, employmentStatuses, type Employee } from "@/lib/hr-data";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/hr/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — PayFlow" },
      { name: "description", content: "Search, filter and manage employee records across departments." },
      { property: "og:title", content: "Employees — PayFlow" },
      { property: "og:description", content: "Search, filter and manage employee records across departments." },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const [list, setList] = useState<Employee[]>(seed);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [dialog, setDialog] = useState<{ open: boolean; employee?: Employee }>({ open: false });

  const rows = useMemo(() => list.filter((e) =>
    (dept === "all" || e.dept === dept) && (status === "all" || e.status === status) && (type === "all" || e.type === type) &&
    (q === "" || `${e.name} ${e.id} ${e.email} ${e.designation}`.toLowerCase().includes(q.toLowerCase()))), [list, q, dept, status, type]);

  const save = (data: Partial<Employee>) => {
    if (dialog.employee) {
      setList((l) => l.map((e) => (e.id === dialog.employee!.id ? { ...e, ...data } as Employee : e)));
      toast.success("Employee updated", { description: data.name });
    } else {
      const id = `PF-${2000 + list.length}`;
      setList((l) => [{ manager: "—", pan: "—", bank: "—", phone: "—", designation: "—", joinDate: "2026-10-01", ...data, id } as Employee, ...l]);
      toast.success("Employee added", { description: `${data.name} · ${id}` });
    }
    setDialog({ open: false });
  };

  const filtersActive = q || dept !== "all" || status !== "all" || type !== "all";

  return (
    <AppShell role="hr">
      <PageHeader title="Employees" description="Manage employee records, compensation and status."
        actions={<>
          <Button variant="outline" size="sm" onClick={() => toast("Export started", { description: `${rows.length} employees · CSV` })}><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> Add employee</Button>
        </>} />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Total employees" value={list.length} sub="Across 7 departments" tone="primary" />
        <MiniStat label="Active" value={list.filter((e) => e.status === "Active").length} sub="Included in payroll" tone="success" />
        <MiniStat label="On probation" value={list.filter((e) => e.status === "Probation").length} sub="Review due in 90 days" tone="primary" />
        <MiniStat label="On leave / notice" value={list.filter((e) => e.status === "On Leave" || e.status === "Notice Period").length} sub="Needs attention" tone="warning" />
      </div>

      <TableCard
        toolbar={<>
          <SearchInput value={q} onChange={setQ} placeholder="Search name, ID, email…" />
          <FilterSelect value={dept} onChange={setDept} options={[{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
          <FilterSelect value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, ...employmentStatuses.map((d) => ({ value: d, label: d }))]} />
          <FilterSelect value={type} onChange={setType} className="sm:w-36" options={[{ value: "all", label: "All types" }, { value: "Full-time", label: "Full-time" }, { value: "Contract", label: "Contract" }]} />
          {filtersActive && <Button variant="ghost" size="sm" onClick={() => { setQ(""); setDept("all"); setStatus("all"); setType("all"); }}>Clear</Button>}
        </>}
        footer={`Showing ${rows.length} of ${list.length} employees`}>
        <table className="w-full text-sm">
          <thead><tr className={theadRow}>
            <th className={th}>Employee</th><th className={th}>Department</th><th className={th}>Location</th><th className={th}>Joined</th>
            <th className={`${th} text-right`}>Monthly gross</th><th className={th}>Status</th><th className={th} />
          </tr></thead>
          <tbody>
            {rows.length === 0 && <EmptyRow cols={7} text="No employees match these filters." />}
            {rows.map((e) => (
              <tr key={e.id} className={tbodyRow}>
                <td className={td}><Link to="/hr/employees/$id" params={{ id: e.id }} className="block hover:text-primary"><EmployeeCell e={e} /></Link></td>
                <td className={td}><div className="font-medium">{e.dept}</div><div className="text-xs text-muted-foreground">{e.grade} · {e.type}</div></td>
                <td className={`${td} text-muted-foreground`}>{e.location}</td>
                <td className={`${td} whitespace-nowrap text-muted-foreground`}>{new Date(e.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</td>
                <td className={`${td} text-right font-medium tabular`}>{formatINR(e.monthlyGross)}</td>
                <td className={td}><StatusPill tone={statusTone[e.status]}>{e.status}</StatusPill></td>
                <td className={`${td} text-right`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to="/hr/employees/$id" params={{ id: e.id }}><Eye className="h-4 w-4" /> View profile</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDialog({ open: true, employee: e })}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <EmployeeFormDialog open={dialog.open} employee={dialog.employee} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} onSave={save} />
    </AppShell>
  );
}
