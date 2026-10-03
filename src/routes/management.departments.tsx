import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { DepartmentsTable } from "@/components/pages/RolePages";

const t = "Department Payroll — PayFlow";
const d = "Payroll cost and headcount split by department.";
export const Route = createFileRoute("/management/departments")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="management">
      <PageHeader title="Department Payroll" description="Payroll cost and headcount split by department." />
      <DepartmentsTable />
    </AppShell>
  ),
});
