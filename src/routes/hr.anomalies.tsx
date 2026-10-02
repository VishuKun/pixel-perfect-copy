import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AnomaliesView } from "@/components/intel/AnomaliesView";

const t = "Payroll Anomalies — PayFlow";
const d = "Detected payroll irregularities: overtime spikes, duplicate bank accounts, unusual bonuses and more.";
export const Route = createFileRoute("/hr/anomalies")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: () => (
    <AppShell role="hr">
      <PageHeader title="Payroll anomalies" description="Irregularities flagged in the September 2026 run. Click a row to review." />
      <AnomaliesView />
    </AppShell>
  ),
});
