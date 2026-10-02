import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AssistantView } from "@/components/intel/AssistantView";

const t = "AI Payroll Assistant — PayFlow";
const d = "Ask questions about payroll runs, anomalies and department costs, answered from verified records.";
export const Route = createFileRoute("/hr/assistant")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: () => (
    <AppShell role="hr">
      <PageHeader title="AI payroll assistant" description="Grounded answers from payroll records." />
      <AssistantView />
    </AppShell>
  ),
});
