import { Link, useRouterState } from "@tanstack/react-router";
import { Workflow } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigation, type Role } from "@/lib/navigation";

export function AppSidebar({ role }: { role: Role }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hrefFor = (slug: string) => (role === "hr" && slug === "dashboard" ? "/" : `/${role}/${slug}`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-1">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="text-[15px] font-bold tracking-tight text-foreground">PayFlow</div>
            <div className="text-[11px] text-muted-foreground">Payroll automation</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-2">
        {navigation[role].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const href = hrefFor(item.slug);
                  const active = pathname === href;
                  return (
                    <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}
                      className="h-9 font-medium data-[active=true]:font-semibold">
                      {href === "/" ? <Link to="/"><item.icon className="h-4 w-4" /><span>{item.title}</span></Link> :
                      <Link to="/$role/$page" params={{ role, page: item.slug }}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>}
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg border bg-primary-soft p-3">
          <div className="text-xs font-semibold text-accent-foreground">September payroll</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Disbursement on 30 Sep</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
            <div className="h-full w-3/5 rounded-full bg-primary" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
