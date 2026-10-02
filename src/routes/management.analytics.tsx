import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AnalyticsView } from "@/components/intel/AnalyticsView";

const t = "Analytics — PayFlow Management";
const d = "Executive view of payroll cost, tax contribution, overtime and headcount trends.";
export const Route = createFileRoute("/management/analytics")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: () => (
    <AppShell role="management">
      <PageHeader title="Analytics" description="Payroll cost and workforce trends." />
      <AnalyticsView />
    </AppShell>
  ),
});
