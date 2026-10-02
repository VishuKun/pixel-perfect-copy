import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AnalyticsView } from "@/components/intel/AnalyticsView";

const t = "Payroll Analytics — PayFlow";
const d = "Payroll trends, department costs, average salary, tax, overtime and headcount.";
export const Route = createFileRoute("/hr/analytics")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: () => (
    <AppShell role="hr">
      <PageHeader title="Payroll analytics" description="Cost, tax and workforce trends across the organisation." />
      <AnalyticsView />
    </AppShell>
  ),
});
