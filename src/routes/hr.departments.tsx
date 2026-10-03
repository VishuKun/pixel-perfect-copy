import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { DepartmentsTable } from "@/components/pages/RolePages";

const t = "Departments — PayFlow";
const d = "Headcount and payroll cost by department.";
export const Route = createFileRoute("/hr/departments")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="hr">
      <PageHeader title="Departments" description="Headcount and payroll cost by department." />
      <DepartmentsTable />
    </AppShell>
  ),
});
