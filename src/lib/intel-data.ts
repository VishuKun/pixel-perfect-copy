// Mock data for analytics, anomalies, salary explanation and forecast.
import { departments, type Department } from "./hr-data";

export const deptShare: Record<Department, { share: number; headShare: number; otShare: number }> = {
  Engineering: { share: 0.385, headShare: 0.33, otShare: 0.28 },
  Sales: { share: 0.174, headShare: 0.19, otShare: 0.08 },
  Operations: { share: 0.143, headShare: 0.159, otShare: 0.34 },
  Product: { share: 0.108, headShare: 0.083, otShare: 0.04 },
  Finance: { share: 0.079, headShare: 0.069, otShare: 0.05 },
  HR: { share: 0.05, headShare: 0.051, otShare: 0.02 },
  Support: { share: 0.061, headShare: 0.118, otShare: 0.19 },
};

const months = ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26"];
const gross = [41.2, 42.1, 43.4, 43.9, 44.2, 47.8, 45.1, 45.6, 46.0, 46.3, 46.9, 48.3]; // ₹ lakh ×10 = actual crore scale below
const heads = [1142, 1158, 1167, 1171, 1180, 1189, 1196, 1204, 1213, 1222, 1236, 1248];
const ot = [1.42, 1.38, 1.71, 1.35, 1.29, 1.88, 1.41, 1.46, 1.52, 1.61, 1.74, 2.06];

/** Org-wide monthly series. Money values in ₹ (full rupees). */
export const monthlySeries = months.map((m, i) => {
  const g = gross[i]! * 1e6; // e.g. 48.3 → ₹4.83 Cr
  const tax = Math.round(g * (0.118 + (i === 5 ? 0.02 : 0)));
  const pf = Math.round(heads[i]! * 1800 * 0.92);
  const other = Math.round(heads[i]! * 620);
  return { month: m, gross: g, tax, pf, deductions: tax + pf + other + heads[i]! * 200, overtime: ot[i]! * 1e6, headcount: heads[i]! };
});

export function seriesFor(dept: string, period: number) {
  const s = dept === "all" ? null : deptShare[dept as Department];
  return monthlySeries.slice(-period).map((r) => s ? {
    ...r, gross: r.gross * s.share, tax: r.tax * s.share * 1.08, pf: r.pf * s.headShare, deductions: r.deductions * s.share,
    overtime: r.overtime * s.otShare, headcount: Math.round(r.headcount * s.headShare),
  } : r);
}

export const deptBreakdown = (period: number) => departments.map((d) => {
  const rows = seriesFor(d, period);
  const last = rows[rows.length - 1]!;
  return { dept: d, gross: last.gross, avg: last.gross / last.headcount, headcount: last.headcount, overtime: last.overtime, tax: last.tax };
});

/* ---------------- Anomalies ---------------- */

export type AnomalySeverity = "Critical" | "Warning" | "Info";
export type AnomalyStatus = "Open" | "Investigating" | "Resolved" | "Dismissed";
export type Anomaly = {
  id: string; severity: AnomalySeverity; type: string; employee: string; empId: string; dept: string;
  expected: string; actual: string; variance: string; description: string; detected: string; status: AnomalyStatus; rule: string;
};

export const anomalyList: Anomaly[] = [
  { id: "AN-2041", severity: "Critical", type: "Overtime spike", employee: "Rohan Mehta", empId: "PF-1000", dept: "Engineering", expected: "₹17,100", actual: "₹48,200", variance: "+182%", description: "Overtime pay is 2.8× the 6-month average. 61 OT hours logged against a team median of 9.", detected: "2026-10-02", status: "Open", rule: "OT > 2× trailing 6-mo mean" },
  { id: "AN-2040", severity: "Critical", type: "Duplicate bank account", employee: "Ananya Iyer", empId: "PF-1037", dept: "Sales", expected: "Unique account", actual: "Shared with PF-1629", variance: "1 match", description: "Salary account ICICI ••8812 is also registered for Harsh Agarwal. Both payouts would credit the same account.", detected: "2026-10-02", status: "Investigating", rule: "Account number seen on >1 employee" },
  { id: "AN-2039", severity: "Critical", type: "Bank change + salary change", employee: "Priya Nair", empId: "PF-1111", dept: "Finance", expected: "No concurrent changes", actual: "Both changed 26 Sep", variance: "+18% pay", description: "Bank account changed to Axis ••2201 two days after an 18% salary revision. Requires dual verification before disbursal.", detected: "2026-10-01", status: "Open", rule: "Bank & CTC edited within 7 days" },
  { id: "AN-2038", severity: "Warning", type: "Unusual salary increase", employee: "Tanvi Shah", empId: "PF-1777", dept: "Product", expected: "≤ ₹1,15,500 (+10%)", actual: "₹1,38,000", variance: "+31%", description: "Mid-cycle revision of 31% exceeds the 10% off-cycle threshold. No promotion letter attached.", detected: "2026-10-01", status: "Open", rule: "Off-cycle increase > 10%" },
  { id: "AN-2037", severity: "Warning", type: "Unusually large bonus", employee: "Harsh Agarwal", empId: "PF-1592", dept: "Sales", expected: "≤ ₹15,600", actual: "₹62,000", variance: "4.0×", description: "Incentive payout is 4× the 90th percentile for SDR role. Verify against Q2 sales attainment.", detected: "2026-09-30", status: "Investigating", rule: "Bonus > P90 for role × 2" },
  { id: "AN-2036", severity: "Warning", type: "Missing attendance", employee: "Farhan Qureshi", empId: "PF-1740", dept: "Operations", expected: "22 days marked", actual: "17 days marked", variance: "5 days", description: "5 working days have no attendance or leave record. ₹8,170 would be deducted as Loss of Pay if unresolved.", detected: "2026-09-30", status: "Open", rule: "Unmarked working days > 2" },
  { id: "AN-2035", severity: "Warning", type: "Overtime spike", employee: "Gaurav Chauhan", empId: "PF-1814", dept: "Support", expected: "₹4,200", actual: "₹11,500", variance: "+174%", description: "Weekend shift coverage drove OT above threshold. Manager approval on file.", detected: "2026-09-29", status: "Resolved", rule: "OT > 2× trailing 6-mo mean" },
  { id: "AN-2034", severity: "Info", type: "Missing attendance", employee: "Arjun Reddy", empId: "PF-1148", dept: "Support", expected: "On leave (approved)", actual: "LOP applied 2 days", variance: "₹3,070", description: "Paternity leave overlaps 2 days marked as absent. Likely data entry mismatch.", detected: "2026-09-28", status: "Open", rule: "Leave/attendance conflict" },
  { id: "AN-2033", severity: "Info", type: "Unusual salary increase", employee: "Kavya Menon", empId: "PF-1185", dept: "Engineering", expected: "+8% (cycle)", actual: "+12%", variance: "+4 pts", description: "Annual increment above band midpoint. Matches approved promotion to L3 — likely legitimate.", detected: "2026-09-27", status: "Dismissed", rule: "Increment > band max" },
  { id: "AN-2032", severity: "Info", type: "Unusually large bonus", employee: "Aditya Joshi", empId: "PF-1296", dept: "Engineering", expected: "₹30,000", actual: "₹75,000", variance: "2.5×", description: "Spot award for incident response. Approved by VP Engineering.", detected: "2026-09-25", status: "Resolved", rule: "Bonus > P90 for role × 2" },
];

/* ---------------- Employee: salary explanation ---------------- */

export type Line = { key: string; label: string; prev: number; curr: number; kind: "earning" | "deduction"; reason?: string };

// Rahul Verma, L4 Senior Software Engineer
export const explanation = {
  employee: "Rahul Verma", prevMonth: "August 2026", currMonth: "September 2026",
  lines: [
    { key: "basic", label: "Basic salary", prev: 80100, curr: 80100, kind: "earning" },
    { key: "hra", label: "House rent allowance", prev: 32040, curr: 32040, kind: "earning" },
    { key: "allow", label: "Special allowances", prev: 65860, curr: 65860, kind: "earning" },
    { key: "ot", label: "Overtime", prev: 3200, curr: 12800, kind: "earning", reason: "16 OT hours during the September release (vs 4 hours in August) at ₹800/hr." },
    { key: "bonus", label: "Bonus", prev: 0, curr: 15000, kind: "earning", reason: "Quarterly performance bonus for Q2 FY26–27, paid in September." },
    { key: "lop", label: "Loss of pay", prev: 0, curr: -5933, kind: "earning", reason: "1 unpaid day on 11 Sep (leave applied after cut-off). ₹1,78,000 ÷ 30 days." },
    { key: "pf", label: "Provident fund", prev: 1800, curr: 1800, kind: "deduction" },
    { key: "tax", label: "Income tax (TDS)", prev: 25480, curr: 29610, kind: "deduction", reason: "Higher taxable income this month from bonus + overtime raises TDS." },
    { key: "pt", label: "Professional tax", prev: 200, curr: 200, kind: "deduction" },
    { key: "other", label: "Other deductions", prev: 1250, curr: 1750, kind: "deduction", reason: "₹500 cafeteria recovery added this month." },
  ] as Line[],
};

/* ---------------- Employee: forecast ---------------- */

export const salaryHistory = [
  { month: "Oct 25", net: 128400 }, { month: "Nov 25", net: 126900 }, { month: "Dec 25", net: 131200 },
  { month: "Jan 26", net: 127600 }, { month: "Feb 26", net: 127600 }, { month: "Mar 26", net: 142300 },
  { month: "Apr 26", net: 139500 }, { month: "May 26", net: 140100 }, { month: "Jun 26", net: 139800 },
  { month: "Jul 26", net: 141600 }, { month: "Aug 26", net: 152470 }, { month: "Sep 26", net: 166507 },
];

/* ---------------- Employee monthly ledger (Rahul Verma) ---------------- */
// Derived from verified payslip records (mock). Deductions = PF + PT + TDS + other.
export const employeeLedger = salaryHistory.map((h, i) => {
  const isLast = i === salaryHistory.length - 1, isPrev = i === salaryHistory.length - 2;
  const pf = 1800, pt = 200, other = isLast ? 1750 : 1250;
  const tax = isLast ? 29610 : isPrev ? 25480 : Math.round((h.net + pf + pt + other) * 0.16 / 0.84);
  const gross = h.net + pf + pt + other + tax;
  return { month: h.month, gross, net: h.net, pf, pt, tax, other, deductions: gross - h.net };
});

export const employeeAlerts = [
  { title: "1 day Loss of Pay applied", desc: "11 Sep · leave applied after cut-off · −₹5,933", severity: "warning" as const },
  { title: "Submit investment proofs", desc: "Due 15 Jan to avoid higher TDS in Q4", severity: "info" as const },
  { title: "September payslip available", desc: "Credited 30 Sep to HDFC ••4649", severity: "success" as const },
];
