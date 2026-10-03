import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmployeeProfile } from "@/components/pages/RolePages";

const t = "My Profile — PayFlow";
const d = "Your personal, job and payroll details.";
export const Route = createFileRoute("/employee/profile")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="employee">
      <PageHeader title="My Profile" description="Your personal, job and payroll details." />
      <EmployeeProfile />
    </AppShell>
  ),
});
