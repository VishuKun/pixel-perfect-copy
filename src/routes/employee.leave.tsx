import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmployeeLeave } from "@/components/pages/RolePages";

const t = "My Leave — PayFlow";
const d = "Your leave balances and requests.";
export const Route = createFileRoute("/employee/leave")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="employee">
      <PageHeader title="My Leave" description="Your leave balances and requests." />
      <EmployeeLeave />
    </AppShell>
  ),
});
