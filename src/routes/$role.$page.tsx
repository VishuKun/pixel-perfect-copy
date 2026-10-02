import { createFileRoute, notFound } from "@tanstack/react-router";
import { Hammer } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { findNavItem, isRole, roleMeta } from "@/lib/navigation";

export const Route = createFileRoute("/$role/$page")({
  loader: ({ params }) => {
    if (!isRole(params.role)) throw notFound();
    const item = findNavItem(params.role, params.page);
    if (!item) throw notFound();
    return { role: params.role, title: item.title };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — PayFlow` : "PayFlow";
    const desc = loaderData ? `${loaderData.title} for ${roleMeta[loaderData.role].label} in PayFlow payroll automation.` : "PayFlow payroll automation.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }] };
  },
  component: SectionPage,
});

function SectionPage() {
  const { role, title } = Route.useLoaderData();
  const item = findNavItem(role, Route.useParams().page)!;
  return (
    <AppShell role={role}>
      <PageHeader title={title} description={`${roleMeta[role].label} workspace`} />
      <div className="grid place-items-center rounded-xl border border-dashed bg-card px-6 py-20 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary"><item.icon className="h-6 w-6" /></span>
        <h2 className="mt-4 text-lg font-semibold">{title} is on the way</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">This module is part of the next build phase. Navigation and layout are ready.</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Hammer className="h-3.5 w-3.5" /> In development</span>
      </div>
    </AppShell>
  );
}
