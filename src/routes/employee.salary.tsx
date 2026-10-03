import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmployeeSalary } from "@/components/pages/RolePages";

const t = "My Salary — PayFlow";
const d = "Your current monthly salary structure.";
export const Route = createFileRoute("/employee/salary")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="employee">
      <PageHeader title="My Salary" description="Your current monthly salary structure." />
      <EmployeeSalary />
    </AppShell>
  ),
});
