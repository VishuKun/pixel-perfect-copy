import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmployeePayslips } from "@/components/pages/RolePages";

const t = "My Payslips — PayFlow";
const d = "View and download your monthly payslips.";
export const Route = createFileRoute("/employee/payslips")({
  head: () => ({ meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell role="employee">
      <PageHeader title="My Payslips" description="View and download your monthly payslips." />
      <EmployeePayslips />
    </AppShell>
  ),
});
