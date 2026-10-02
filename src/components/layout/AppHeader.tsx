import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Search, Settings, User, Repeat } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleMeta, type Role } from "@/lib/navigation";
import { notifications } from "@/lib/mock-data";

export function AppHeader({ role }: { role: Role }) {
  const navigate = useNavigate();
  const me = roleMeta[role];
  const unread = notifications.filter((n) => n.unread).length;

  const switchRole = (r: Role) => r === "hr" ? navigate({ to: "/" }) : navigate({ to: "/$role/$page", params: { role: r, page: "dashboard" } });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search employees, payslips, runs…" className="h-9 border-transparent bg-muted pl-9 shadow-none focus-visible:bg-card" />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border bg-card px-1.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications <span className="text-xs font-normal text-muted-foreground">{unread} new</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="items-start gap-3 py-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-primary" : "bg-border"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{n.desc}</div>
                </div>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary-soft text-xs font-semibold text-accent-foreground">{me.initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold leading-tight">{me.user}</div>
                <div className="text-[11px] text-muted-foreground">{me.label}</div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="font-semibold">{me.user}</div>
              <div className="text-xs font-normal text-muted-foreground">{me.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="h-4 w-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Switch role (demo)</DropdownMenuLabel>
            {(Object.keys(roleMeta) as Role[]).map((r) => (
              <DropdownMenuItem key={r} onClick={() => switchRole(r)} className={r === role ? "font-semibold text-primary" : ""}>
                <Repeat className="h-4 w-4" /> {roleMeta[r].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive"><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
