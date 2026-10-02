import {
  LayoutDashboard, Users, Building2, CalendarCheck, Plane, Layers, Wallet, FileText, BarChart3,
  ShieldAlert, Sparkles, UserCircle, Calculator, TrendingUp, PiggyBank, LineChart, type LucideIcon,
} from "lucide-react";

export type Role = "hr" | "employee" | "management";

export type NavItem = { title: string; slug: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const roleMeta: Record<Role, { label: string; user: string; email: string; initials: string; title: string }> = {
  hr: { label: "HR / Admin", user: "Neha Kapoor", email: "neha.kapoor@payflow.in", initials: "NK", title: "HR Manager" },
  employee: { label: "Employee", user: "Rahul Verma", email: "rahul.verma@payflow.in", initials: "RV", title: "Senior Engineer" },
  management: { label: "Management", user: "Sanjay Gupta", email: "sanjay.gupta@payflow.in", initials: "SG", title: "CFO" },
};

export const navigation: Record<Role, NavGroup[]> = {
  hr: [
    { label: "Overview", items: [{ title: "Dashboard", slug: "dashboard", icon: LayoutDashboard }] },
    {
      label: "People",
      items: [
        { title: "Employees", slug: "employees", icon: Users },
        { title: "Departments", slug: "departments", icon: Building2 },
        { title: "Attendance", slug: "attendance", icon: CalendarCheck },
        { title: "Leave", slug: "leave", icon: Plane },
      ],
    },
    {
      label: "Payroll",
      items: [
        { title: "Salary Structures", slug: "salary-structures", icon: Layers },
        { title: "Payroll Runs", slug: "payroll", icon: Wallet },
        { title: "Payslips", slug: "payslips", icon: FileText },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Analytics", slug: "analytics", icon: BarChart3 },
        { title: "Anomalies", slug: "anomalies", icon: ShieldAlert },
        { title: "AI Assistant", slug: "assistant", icon: Sparkles },
      ],
    },
  ],
  employee: [
    { label: "Overview", items: [{ title: "Dashboard", slug: "dashboard", icon: LayoutDashboard }, { title: "Financial Dashboard", slug: "financial", icon: LineChart }, { title: "My Profile", slug: "profile", icon: UserCircle }] },
    { label: "Time", items: [{ title: "Attendance", slug: "attendance", icon: CalendarCheck }, { title: "Leave", slug: "leave", icon: Plane }] },
    {
      label: "Pay",
      items: [
        { title: "Salary", slug: "salary", icon: Wallet },
        { title: "Payslips", slug: "payslips", icon: FileText },
        { title: "Salary Explanation", slug: "explanation", icon: Calculator },
        { title: "Salary Forecast", slug: "forecast", icon: PiggyBank },
      ],
    },
    { label: "Help", items: [{ title: "AI Assistant", slug: "assistant", icon: Sparkles }] },
  ],
  management: [
    {
      label: "Overview",
      items: [
        { title: "Payroll Overview", slug: "dashboard", icon: LayoutDashboard },
        { title: "Department Payroll", slug: "departments", icon: Building2 },
        { title: "Payroll Trends", slug: "trends", icon: TrendingUp },
      ],
    },
    { label: "Insights", items: [{ title: "Analytics", slug: "analytics", icon: LineChart }, { title: "Anomaly Reports", slug: "anomalies", icon: ShieldAlert }] },
  ],
};

export const isRole = (r: string): r is Role => r === "hr" || r === "employee" || r === "management";

export function findNavItem(role: Role, slug: string) {
  return navigation[role].flatMap((g) => g.items).find((i) => i.slug === slug);
}
