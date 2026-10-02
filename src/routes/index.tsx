import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Download, Play, Receipt, Users, Wallet } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  ActivityFeed, AlertsList, AnomaliesTable, DepartmentChart, Panel, PayrollTrendChart, ProcessingStatus, StatCard,
} from "@/components/dashboard/widgets";
import { kpis } from "@/lib/mock-data";
import { formatINRCompact, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HR Dashboard — PayFlow" },
      { name: "description", content: "Payroll overview, processing status, anomalies and department costs in PayFlow." },
      { property: "og:title", content: "HR Dashboard — PayFlow" },
      { property: "og:description", content: "Payroll overview, processing status, anomalies and department costs in PayFlow." },
    ],
  }),
  component: HrDashboard,
});

function HrDashboard() {
  return (
    <AppShell role="hr">
      <PageHeader
        title="Good evening, Neha"
        description="September 2026 payroll · Pay period 1–30 Sep"
        actions={<>
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm"><Play className="h-4 w-4" /> Run payroll</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total employees" value={formatNumber(kpis.totalEmployees)} delta={kpis.employeesDelta} icon={Users} accent="primary" foot="38 joined this month" />
        <StatCard label="Monthly payroll" value={formatINRCompact(kpis.monthlyPayroll)} delta={kpis.payrollDelta} icon={Wallet} accent="success" foot="vs August" />
        <StatCard label="Deductions & tax" value={formatINRCompact(kpis.deductions)} delta={kpis.deductionsDelta} deltaGood={false} icon={Receipt} accent="warning" foot="TDS, PF, ESI, PT" />
        <StatCard label="Payroll alerts" value={String(kpis.openAlerts)} icon={AlertTriangle} accent="critical" foot={`${kpis.criticalAlerts} critical need action`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Monthly payroll trend" subtitle="Gross vs net pay, last 11 months (₹ lakh)" className="lg:col-span-2"
          action={<div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-1" />Gross</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-3" />Net</span>
          </div>}>
          <PayrollTrendChart />
        </Panel>
        <Panel title="Processing status" subtitle="September 2026 run">
          <ProcessingStatus />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Department payroll" subtitle="Monthly cost by department (₹ lakh)" className="lg:col-span-2">
          <DepartmentChart />
        </Panel>
        <Panel title="Alerts" subtitle="Compliance & processing">
          <AlertsList />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Recent payroll anomalies" subtitle="AI-detected irregularities this cycle" className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" className="text-primary">View all</Button>}>
          <AnomaliesTable />
        </Panel>
        <Panel title="Recent activity">
          <ActivityFeed />
        </Panel>
      </div>
    </AppShell>
  );
}
