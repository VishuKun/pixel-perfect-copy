import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AnalyticsView } from "@/components/intel/AnalyticsView";

const t = "Payroll Overview — PayFlow";
const d = "Organisation-wide payroll cost, headcount and tax at a glance.";
export const Route = createFileRoute("/management/dashboard")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="management">
      <PageHeader title="Payroll Overview" description="Organisation-wide payroll cost, headcount and tax at a glance." />
      <AnalyticsView />
    </AppShell>
  ),
});
