// Mock HR & payroll data. Deterministic so SSR and client render identically.

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const departments = ["Engineering", "Sales", "Operations", "Product", "Finance", "HR", "Support"] as const;
export type Department = (typeof departments)[number];
export const employmentStatuses = ["Active", "Probation", "On Leave", "Notice Period"] as const;
export type EmploymentStatus = (typeof employmentStatuses)[number];

export type Employee = {
  id: string; name: string; email: string; phone: string; dept: Department; designation: string;
  status: EmploymentStatus; type: "Full-time" | "Contract"; joinDate: string; location: string;
  manager: string; grade: string; monthlyGross: number; pan: string; bank: string;
};

const seedRows: [string, Department, string, string, number][] = [
  ["Rohan Mehta", "Engineering", "Senior Software Engineer", "L4", 185000],
  ["Ananya Iyer", "Sales", "Account Executive", "L3", 98000],
  ["Vikram Singh", "Operations", "Operations Lead", "L4", 132000],
  ["Priya Nair", "Finance", "Finance Manager", "L5", 176000],
  ["Arjun Reddy", "Support", "Support Specialist", "L2", 46000],
  ["Kavya Menon", "Engineering", "Software Engineer", "L3", 112000],
  ["Siddharth Rao", "Product", "Product Manager", "L5", 210000],
  ["Neha Kapoor", "HR", "HR Manager", "L5", 148000],
  ["Aditya Joshi", "Engineering", "Staff Engineer", "L6", 295000],
  ["Ishita Banerjee", "Product", "Product Designer", "L4", 142000],
  ["Karthik Subramanian", "Engineering", "DevOps Engineer", "L4", 158000],
  ["Meera Pillai", "Sales", "Regional Sales Manager", "L5", 165000],
  ["Rahul Verma", "Engineering", "Senior Software Engineer", "L4", 178000],
  ["Sneha Kulkarni", "Finance", "Accountant", "L2", 58000],
  ["Amit Sharma", "HR", "Payroll Specialist", "L3", 82000],
  ["Divya Krishnan", "Support", "Support Team Lead", "L3", 74000],
  ["Harsh Agarwal", "Sales", "Sales Development Rep", "L2", 52000],
  ["Pooja Desai", "Operations", "Supply Chain Analyst", "L3", 88000],
  ["Manish Tiwari", "Engineering", "QA Engineer", "L3", 96000],
  ["Lakshmi Venkatesh", "Engineering", "Engineering Manager", "L6", 320000],
  ["Farhan Qureshi", "Operations", "Logistics Coordinator", "L2", 49000],
  ["Tanvi Shah", "Product", "Associate PM", "L3", 105000],
  ["Gaurav Chauhan", "Support", "Support Specialist", "L2", 44000],
  ["Ritika Malhotra", "Sales", "Account Executive", "L3", 92000],
];

const locations = ["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Gurugram", "Chennai"];
const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra"];
const managers: Record<Department, string> = {
  Engineering: "Lakshmi Venkatesh", Sales: "Meera Pillai", Operations: "Vikram Singh", Product: "Siddharth Rao",
  Finance: "Priya Nair", HR: "Neha Kapoor", Support: "Divya Krishnan",
};

export const employees: Employee[] = seedRows.map(([name, dept, designation, grade, gross], i) => {
  const r = rng(i + 7);
  const [first, last] = name.toLowerCase().split(" ");
  const statusRoll = r();
  const status: EmploymentStatus = i === 4 ? "On Leave" : i === 16 ? "Notice Period" : statusRoll > 0.85 ? "Probation" : "Active";
  const year = 2018 + Math.floor(r() * 8);
  const month = 1 + Math.floor(r() * 12);
  return {
    id: `PF-${String(1000 + i * 37).padStart(4, "0")}`,
    name, dept, designation, grade, status,
    email: `${first}.${last}@payflow.in`,
    phone: `+91 9${Math.floor(r() * 1e9).toString().padStart(9, "0")}`,
    type: i % 9 === 8 ? "Contract" : "Full-time",
    joinDate: `${year}-${String(month).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
    location: locations[i % locations.length]!,
    manager: managers[dept] === name ? "Sanjay Gupta" : managers[dept],
    monthlyGross: gross,
    pan: `${String.fromCharCode(65 + (i % 26))}${"BCDPQ"[i % 5]}${"KLMNP"[i % 5]}P${String.fromCharCode(65 + ((i * 3) % 26))}${4000 + i * 13}${String.fromCharCode(70 + (i % 10))}`,
    bank: `${banks[i % banks.length]!} ••${String(1000 + Math.floor(r() * 8999))}`,
  };
});

export const getEmployee = (id: string) => employees.find((e) => e.id === id);

/* ---------------- Salary breakdown ---------------- */

export type SalaryBreakdown = {
  basic: number; hra: number; allowances: number; bonus: number; overtime: number; gross: number;
  pf: number; pt: number; tds: number; other: number; deductions: number; net: number;
};

export function computeSalary(monthlyGross: number, opts: { overtime?: number; bonus?: number; lop?: number } = {}): SalaryBreakdown {
  const basic = Math.round(monthlyGross * 0.45);
  const hra = Math.round(basic * 0.4);
  const allowances = monthlyGross - basic - hra;
  const bonus = opts.bonus ?? 0;
  const overtime = opts.overtime ?? 0;
  const lop = opts.lop ?? 0;
  const gross = monthlyGross + bonus + overtime - lop;
  const pf = Math.round(Math.min(basic, 15000) * 0.12);
  const pt = 200;
  const annual = gross * 12;
  const taxRate = annual > 2_400_000 ? 0.22 : annual > 1_500_000 ? 0.15 : annual > 1_000_000 ? 0.09 : annual > 700_000 ? 0.04 : 0;
  const tds = Math.round(gross * taxRate);
  const other = monthlyGross > 150000 ? 1250 : 500; // group insurance / welfare
  const deductions = pf + pt + tds + other;
  return { basic, hra, allowances, bonus, overtime, gross, pf, pt, tds, other, deductions, net: gross - deductions };
}

/* ---------------- Salary structures (grade templates) ---------------- */

export type SalaryStructure = {
  grade: string; name: string; employees: number; effectiveFrom: string;
  basic: number; hra: number; allowances: number; bonus: number; overtimeRate: number;
  pfPct: number; pt: number; tdsPct: number; otherDeductions: number;
};

export const salaryStructures: SalaryStructure[] = [
  { grade: "L1", name: "Associate", employees: 148, effectiveFrom: "2026-04-01", basic: 18000, hra: 7200, allowances: 9800, bonus: 2000, overtimeRate: 250, pfPct: 12, pt: 200, tdsPct: 0, otherDeductions: 300 },
  { grade: "L2", name: "Specialist", employees: 312, effectiveFrom: "2026-04-01", basic: 23000, hra: 9200, allowances: 18800, bonus: 3500, overtimeRate: 350, pfPct: 12, pt: 200, tdsPct: 2, otherDeductions: 500 },
  { grade: "L3", name: "Senior Specialist", employees: 356, effectiveFrom: "2026-04-01", basic: 40500, hra: 16200, allowances: 33300, bonus: 6000, overtimeRate: 500, pfPct: 12, pt: 200, tdsPct: 6, otherDeductions: 500 },
  { grade: "L4", name: "Lead / Senior Engineer", employees: 254, effectiveFrom: "2026-04-01", basic: 69750, hra: 27900, allowances: 57350, bonus: 12000, overtimeRate: 800, pfPct: 12, pt: 200, tdsPct: 14, otherDeductions: 1250 },
  { grade: "L5", name: "Manager", employees: 128, effectiveFrom: "2026-07-01", basic: 79000, hra: 31600, allowances: 64400, bonus: 18000, overtimeRate: 0, pfPct: 12, pt: 200, tdsPct: 18, otherDeductions: 1250 },
  { grade: "L6", name: "Senior Manager / Staff", employees: 50, effectiveFrom: "2026-07-01", basic: 135000, hra: 54000, allowances: 111000, bonus: 30000, overtimeRate: 0, pfPct: 12, pt: 200, tdsPct: 22, otherDeductions: 1250 },
];

/* ---------------- Attendance ---------------- */

export type AttendanceStatus = "P" | "A" | "L" | "H" | "W";
export const attendanceLabels: Record<AttendanceStatus, string> = { P: "Present", A: "Absent", L: "Leave", H: "Half-day", W: "Weekend" };

export const attendanceMonths = [
  { value: "2026-09", label: "September 2026", year: 2026, month: 8 },
  { value: "2026-08", label: "August 2026", year: 2026, month: 7 },
  { value: "2026-07", label: "July 2026", year: 2026, month: 6 },
];

export function getAttendance(empIndex: number, year: number, month: number): AttendanceStatus[] {
  const days = new Date(year, month + 1, 0).getDate();
  const r = rng(empIndex * 131 + month * 17 + year);
  return Array.from({ length: days }, (_, d) => {
    const dow = new Date(year, month, d + 1).getDay();
    if (dow === 0 || dow === 6) return "W";
    const x = r();
    return x > 0.96 ? "A" : x > 0.91 ? "L" : x > 0.87 ? "H" : "P";
  });
}

export function summarizeAttendance(days: AttendanceStatus[]) {
  const c = { P: 0, A: 0, L: 0, H: 0, W: 0 };
  days.forEach((d) => c[d]++);
  const working = days.length - c.W;
  return { ...c, working, rate: Math.round(((c.P + c.H * 0.5) / working) * 1000) / 10 };
}

/* ---------------- Leave ---------------- */

export type LeaveStatus = "Pending" | "Approved" | "Rejected";
export type LeaveRequest = { id: string; empId: string; type: string; from: string; to: string; days: number; reason: string; applied: string; status: LeaveStatus };

export const leaveRequests: LeaveRequest[] = [
  { id: "LV-3312", empId: employees[5]!.id, type: "Casual Leave", from: "2026-10-05", to: "2026-10-06", days: 2, reason: "Family function in Kochi", applied: "2026-09-29", status: "Pending" },
  { id: "LV-3311", empId: employees[0]!.id, type: "Earned Leave", from: "2026-10-12", to: "2026-10-16", days: 5, reason: "Vacation — Goa", applied: "2026-09-28", status: "Pending" },
  { id: "LV-3310", empId: employees[13]!.id, type: "Sick Leave", from: "2026-09-30", to: "2026-09-30", days: 1, reason: "Fever", applied: "2026-09-30", status: "Pending" },
  { id: "LV-3309", empId: employees[21]!.id, type: "Casual Leave", from: "2026-10-02", to: "2026-10-02", days: 1, reason: "Personal work", applied: "2026-09-27", status: "Pending" },
  { id: "LV-3308", empId: employees[9]!.id, type: "Earned Leave", from: "2026-10-20", to: "2026-10-24", days: 5, reason: "Diwali travel to Kolkata", applied: "2026-09-26", status: "Pending" },
  { id: "LV-3307", empId: employees[4]!.id, type: "Maternity/Paternity", from: "2026-09-15", to: "2026-10-14", days: 30, reason: "Paternity leave", applied: "2026-08-30", status: "Approved" },
  { id: "LV-3306", empId: employees[11]!.id, type: "Casual Leave", from: "2026-09-22", to: "2026-09-22", days: 1, reason: "Bank work", applied: "2026-09-19", status: "Approved" },
  { id: "LV-3305", empId: employees[16]!.id, type: "Earned Leave", from: "2026-09-25", to: "2026-09-30", days: 4, reason: "Serving notice — personal", applied: "2026-09-18", status: "Rejected" },
  { id: "LV-3304", empId: employees[2]!.id, type: "Sick Leave", from: "2026-09-17", to: "2026-09-18", days: 2, reason: "Viral infection", applied: "2026-09-17", status: "Approved" },
  { id: "LV-3303", empId: employees[18]!.id, type: "Casual Leave", from: "2026-09-12", to: "2026-09-12", days: 1, reason: "Moving house", applied: "2026-09-08", status: "Approved" },
];

export const leaveBalanceFor = (i: number) => [
  { type: "Casual Leave", total: 12, used: 3 + (i % 5) },
  { type: "Sick Leave", total: 10, used: 1 + (i % 4) },
  { type: "Earned Leave", total: 18, used: 4 + (i % 7) },
  { type: "Comp Off", total: 4, used: i % 3 },
];

/* ---------------- Payroll & payslips ---------------- */

export const payrollMonths = [
  { value: "2026-09", label: "September 2026", status: "In review" as const },
  { value: "2026-08", label: "August 2026", status: "Paid" as const },
  { value: "2026-07", label: "July 2026", status: "Paid" as const },
  { value: "2026-06", label: "June 2026", status: "Paid" as const },
];

export type PayrollRowStatus = "Paid" | "Processed" | "Pending" | "On Hold";
export type PayrollRow = { employee: Employee; breakdown: SalaryBreakdown; status: PayrollRowStatus; paidDays: number; workingDays: number; month: string };

export function getPayroll(month: string): PayrollRow[] {
  const m = payrollMonths.find((p) => p.value === month) ?? payrollMonths[0];
  const mi = Number(month.slice(5)) ;
  return employees.map((e, i) => {
    const r = rng(i * 19 + mi);
    const workingDays = 22;
    const lopDays = r() > 0.88 ? 1 + Math.floor(r() * 2) : 0;
    const overtime = e.grade <= "L4" && r() > 0.7 ? Math.round(r() * 12) * 500 : 0;
    const bonus = mi === 3 ? Math.round(e.monthlyGross * 0.5) : r() > 0.9 ? 5000 : 0;
    const lop = Math.round((e.monthlyGross / 30) * lopDays);
    const breakdown = computeSalary(e.monthlyGross, { overtime, bonus, lop });
    let status: PayrollRowStatus = "Paid";
    if (m.status === "In review") status = i === 0 || i === 1 ? "On Hold" : i % 6 === 2 ? "Pending" : "Processed";
    return { employee: e, breakdown, status, paidDays: workingDays - lopDays, workingDays, month: m.label };
  });
}
