import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AnomaliesView } from "@/components/intel/AnomaliesView";

const t = "Anomaly Reports — PayFlow Management";
const d = "Read-only report of payroll anomalies by severity, type and status.";
export const Route = createFileRoute("/management/anomalies")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: () => (
    <AppShell role="management">
      <PageHeader title="Anomaly reports" description="Read-only view. HR resolves anomalies before payroll approval." />
      <AnomaliesView canAct={false} />
    </AppShell>
  ),
});
