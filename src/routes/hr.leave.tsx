import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel } from "@/components/dashboard/widgets";
import { EmployeeCell, EmptyRow, FilterSelect, MiniStat, StatusPill, TableCard, statusTone, tbodyRow, td, th, theadRow } from "@/components/hr/common";
import { employees, getEmployee, leaveBalanceFor, leaveRequests, type LeaveRequest, type LeaveStatus } from "@/lib/hr-data";

export const Route = createFileRoute("/hr/leave")({
  head: () => ({
    meta: [
      { title: "Leave Management — PayFlow" },
      { name: "description", content: "Review, approve and reject leave requests and track leave balances." },
      { property: "og:title", content: "Leave Management — PayFlow" },
      { property: "og:description", content: "Review, approve and reject leave requests and track leave balances." },
    ],
  }),
  component: LeavePage,
});

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function LeavePage() {
  const [list, setList] = useState<LeaveRequest[]>(leaveRequests);
  const [tab, setTab] = useState<"all" | LeaveStatus>("Pending");
  const [balEmp, setBalEmp] = useState(employees[0].id);

  const act = (id: string, status: LeaveStatus) => {
    setList((l) => l.map((r) => (r.id === id ? { ...r, status } : r)));
    const r = list.find((x) => x.id === id)!;
    const name = getEmployee(r.empId)?.name;
    status === "Approved" ? toast.success("Leave approved", { description: `${name} · ${r.days} day(s)` }) : toast.error("Leave rejected", { description: `${name} · ${r.type}` });
  };

  const rows = list.filter((r) => tab === "all" || r.status === tab);
  const count = (s: LeaveStatus) => list.filter((r) => r.status === s).length;
  const balIndex = employees.findIndex((e) => e.id === balEmp);

  return (
    <AppShell role="hr">
      <PageHeader title="Leave management" description="Approve requests and monitor leave balances across the organisation." />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Pending requests" value={count("Pending")} sub="Awaiting your action" tone="warning" />
        <MiniStat label="Approved this month" value={count("Approved")} sub={`${list.filter((r) => r.status === "Approved").reduce((a, r) => a + r.days, 0)} days total`} tone="success" />
        <MiniStat label="Rejected" value={count("Rejected")} sub="This month" tone="critical" />
        <MiniStat label="On leave today" value={3} sub="2 Oct 2026" tone="primary" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TableCard
            toolbar={<Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="Pending">Pending ({count("Pending")})</TabsTrigger>
                <TabsTrigger value="Approved">Approved</TabsTrigger>
                <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>}>
            <table className="w-full text-sm">
              <thead><tr className={theadRow}><th className={th}>Employee</th><th className={th}>Leave</th><th className={th}>Dates</th><th className={th}>Status</th><th className={`${th} text-right`}>Action</th></tr></thead>
              <tbody>
                {rows.length === 0 && <EmptyRow cols={5} text="No requests here. You're all caught up." />}
                {rows.map((r) => {
                  const e = getEmployee(r.empId)!;
                  return (
                    <tr key={r.id} className={tbodyRow}>
                      <td className={td}><EmployeeCell e={{ ...e, designation: e.dept }} /></td>
                      <td className={td}><div className="font-medium">{r.type}</div><div className="max-w-[200px] truncate text-xs text-muted-foreground">{r.reason}</div></td>
                      <td className={`${td} whitespace-nowrap`}><div className="font-medium">{fmt(r.from)}{r.from !== r.to && ` – ${fmt(r.to)}`}</div><div className="text-xs text-muted-foreground">{r.days} day{r.days > 1 ? "s" : ""} · applied {fmt(r.applied)}</div></td>
                      <td className={td}><StatusPill tone={statusTone[r.status]}>{r.status}</StatusPill></td>
                      <td className={`${td} text-right`}>
                        {r.status === "Pending" ? (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" onClick={() => act(r.id, "Rejected")}><X className="h-3.5 w-3.5" /> Reject</Button>
                            <Button size="sm" className="h-8" onClick={() => act(r.id, "Approved")}><Check className="h-3.5 w-3.5" /> Approve</Button>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">{r.id}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableCard>
        </div>

        <Panel title="Leave balance" subtitle="FY 2026–27" action={<FilterSelect value={balEmp} onChange={setBalEmp} className="sm:w-40" options={employees.map((e) => ({ value: e.id, label: e.name }))} />}>
          <div className="space-y-4">
            {leaveBalanceFor(balIndex).map((l) => {
              const left = l.total - l.used;
              return (
                <div key={l.type} className="rounded-lg border p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">{l.type}</span>
                    <span className="text-lg font-bold tabular">{left}<span className="text-xs font-normal text-muted-foreground"> / {l.total}</span></span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${left / l.total < 0.25 ? "bg-warning" : "bg-primary"}`} style={{ width: `${(left / l.total) * 100}%` }} /></div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{l.used} used</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
