import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AssistantView } from "@/components/intel/AssistantView";

const t = "Payroll Assistant — PayFlow";
const d = "Ask about your payslip and salary changes, answered from your verified payroll records.";
export const Route = createFileRoute("/employee/assistant")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] }),
  component: () => (
    <AppShell role="employee">
      <PageHeader title="Payroll assistant" description="Grounded answers from your payslips." />
      <AssistantView suggestionSet={["Why did my salary decrease?", "Explain my salary this month.", "What caused my tax to go up?", "Show my payslip breakdown."]} />
    </AppShell>
  ),
});
