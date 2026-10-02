export const kpis = {
  totalEmployees: 1248,
  employeesDelta: 3.2,
  monthlyPayroll: 48_265_400,
  payrollDelta: 4.8,
  deductions: 9_874_200,
  deductionsDelta: 2.1,
  openAlerts: 7,
  criticalAlerts: 2,
};

export const payrollTrend = [
  { month: "Nov", gross: 42.1, net: 33.8 },
  { month: "Dec", gross: 43.4, net: 34.9 },
  { month: "Jan", gross: 43.9, net: 35.2 },
  { month: "Feb", gross: 44.2, net: 35.4 },
  { month: "Mar", gross: 47.8, net: 37.6 },
  { month: "Apr", gross: 45.1, net: 36.0 },
  { month: "May", gross: 45.6, net: 36.4 },
  { month: "Jun", gross: 46.0, net: 36.7 },
  { month: "Jul", gross: 46.3, net: 36.9 },
  { month: "Aug", gross: 46.9, net: 37.4 },
  { month: "Sep", gross: 48.3, net: 38.4 },
];

export const departmentPayroll = [
  { dept: "Engineering", amount: 18.6, headcount: 412 },
  { dept: "Sales", amount: 8.4, headcount: 236 },
  { dept: "Operations", amount: 6.9, headcount: 198 },
  { dept: "Product", amount: 5.2, headcount: 104 },
  { dept: "Finance", amount: 3.8, headcount: 86 },
  { dept: "HR", amount: 2.4, headcount: 64 },
  { dept: "Support", amount: 2.9, headcount: 148 },
];

export type Severity = "critical" | "warning" | "info";

export const anomalies: {
  id: string; employee: string; empId: string; dept: string; issue: string; amount: number; severity: Severity; detected: string;
}[] = [
  { id: "AN-2041", employee: "Rohan Mehta", empId: "PF-1043", dept: "Engineering", issue: "Overtime 182% above 6-month average", amount: 48200, severity: "critical", detected: "2h ago" },
  { id: "AN-2040", employee: "Ananya Iyer", empId: "PF-0877", dept: "Sales", issue: "Duplicate incentive payout detected", amount: 35000, severity: "critical", detected: "5h ago" },
  { id: "AN-2039", employee: "Vikram Singh", empId: "PF-1192", dept: "Operations", issue: "Missing PAN — TDS at higher rate", amount: 12640, severity: "warning", detected: "Yesterday" },
  { id: "AN-2038", employee: "Priya Nair", empId: "PF-0562", dept: "Finance", issue: "Bank account changed before payroll run", amount: 0, severity: "warning", detected: "Yesterday" },
  { id: "AN-2037", employee: "Arjun Reddy", empId: "PF-1220", dept: "Support", issue: "LOP days exceed attendance record", amount: 6800, severity: "info", detected: "2 days ago" },
];

export const processingSteps = [
  { label: "Attendance locked", status: "done" as const, meta: "1,248 records" },
  { label: "Salary computed", status: "done" as const, meta: "₹4.83 Cr gross" },
  { label: "Anomaly review", status: "active" as const, meta: "5 of 7 resolved" },
  { label: "Approval", status: "pending" as const, meta: "CFO sign-off" },
  { label: "Disbursement", status: "pending" as const, meta: "Scheduled 30 Sep" },
];

export const alerts = [
  { title: "PF challan due in 3 days", desc: "EPF contribution for Sep · ₹38.6 L", severity: "warning" as Severity },
  { title: "2 critical anomalies unresolved", desc: "Blocking payroll approval", severity: "critical" as Severity },
  { title: "Professional tax slab update", desc: "Karnataka revision effective Oct 1", severity: "info" as Severity },
];

export const activity = [
  { who: "Neha Kapoor", initials: "NK", action: "approved leave for", target: "Siddharth Rao", time: "12 min ago" },
  { who: "System", initials: "PF", action: "flagged overtime anomaly for", target: "Rohan Mehta", time: "2h ago" },
  { who: "Amit Sharma", initials: "AS", action: "updated salary structure", target: "L4 — Senior Engineer", time: "3h ago" },
  { who: "Neha Kapoor", initials: "NK", action: "onboarded", target: "Kavya Menon", time: "5h ago" },
  { who: "System", initials: "PF", action: "locked attendance for", target: "September 2026", time: "Yesterday" },
];

export const notifications = [
  { title: "Payroll ready for review", desc: "September run computed", time: "10m", unread: true },
  { title: "Critical anomaly detected", desc: "Duplicate incentive — Ananya Iyer", time: "5h", unread: true },
  { title: "3 leave requests pending", desc: "Engineering team", time: "1d", unread: false },
];
