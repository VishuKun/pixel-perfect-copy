import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AnalyticsView } from "@/components/intel/AnalyticsView";

const t = "Payroll Trends — PayFlow";
const d = "How payroll cost, overtime and tax are moving over time.";
export const Route = createFileRoute("/management/trends")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="management">
      <PageHeader title="Payroll Trends" description="How payroll cost, overtime and tax are moving over time." />
      <AnalyticsView />
    </AppShell>
  ),
});
