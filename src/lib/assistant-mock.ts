/**
 * Mock AI payroll assistant.
 *
 * CONTRACT for the future backend: the assistant must only narrate figures
 * returned by verified payroll APIs (payslips, payroll runs, anomaly engine).
 * It must never compute or invent payroll numbers itself. Every response
 * therefore carries `sources` pointing at the records the figures came from.
 * Here those records are the app's mock datasets.
 */
import { anomalyList, employeeLedger, explanation, monthlySeries, seriesFor } from "./intel-data";
import { getPayroll } from "./hr-data";
import { formatINR, formatINRCompact } from "./format";

export type Card =
  | { kind: "metrics"; title: string; items: { label: string; value: string; tone?: "up" | "down" | "neutral" }[] }
  | { kind: "changes"; title: string; rows: { label: string; prev: string; curr: string; delta: string; up: boolean }[] }
  | { kind: "list"; title: string; rows: { primary: string; secondary: string; badge: string; tone: "critical" | "warning" | "info" }[] };

export type AssistantReply = { text: string; cards: Card[]; sources: string[] };

export const suggestions = [
  "Why did my salary decrease?",
  "Explain my salary this month.",
  "Show this month's payroll summary.",
  "Which employees have unusual payroll changes?",
  "What caused payroll expenditure to increase?",
  "Show Engineering department payroll.",
];

const sign = (n: number) => `${n >= 0 ? "+" : "−"}${formatINR(Math.abs(n))}`;

function salaryChange(): AssistantReply {
  const changed = explanation.lines.filter((l) => l.prev !== l.curr);
  const cur = employeeLedger[employeeLedger.length - 1]!, prev = employeeLedger[employeeLedger.length - 2]!;
  return {
    text: `Your net salary did not decrease in September — it **increased by ${formatINR(cur.net - prev.net)}** compared with August. Two items did reduce it: 1 day of Loss of Pay and higher TDS. These were outweighed by your quarterly bonus and extra overtime.`,
    cards: [{ kind: "changes", title: "Items that changed · Aug → Sep", rows: changed.map((l) => {
      const eff = l.kind === "earning" ? l.curr - l.prev : l.prev - l.curr;
      return { label: l.label, prev: formatINR(l.prev), curr: formatINR(l.curr), delta: sign(eff), up: eff > 0 };
    }) }],
    sources: ["Payslip PS-202609-1444", "Payslip PS-202608-1444", "Attendance register Sep 2026"],
  };
}

function explainMonth(): AssistantReply {
  const c = employeeLedger[employeeLedger.length - 1]!;
  return {
    text: "Here's your September 2026 salary as recorded on your payslip. Earnings add up to gross; statutory and other deductions are subtracted to give net pay credited to HDFC ••4649.",
    cards: [
      { kind: "metrics", title: "September 2026 payslip", items: [
        { label: "Gross", value: formatINR(c.gross) }, { label: "Deductions", value: formatINR(c.deductions), tone: "down" }, { label: "Net pay", value: formatINR(c.net), tone: "up" },
        { label: "PF", value: formatINR(c.pf) }, { label: "TDS", value: formatINR(c.tax) }, { label: "PT + other", value: formatINR(c.pt + c.other) },
      ] },
    ],
    sources: ["Payslip PS-202609-1444"],
  };
}

function runSummary(): AssistantReply {
  const rows = getPayroll("2026-09");
  const s = monthlySeries[monthlySeries.length - 1]!;
  const count = (st: string) => rows.filter((r) => r.status === st).length;
  return {
    text: "The September 2026 payroll run is **in review**. Salaries are computed; approval is blocked until critical anomalies are resolved.",
    cards: [{ kind: "metrics", title: "Payroll run · Sep 2026", items: [
      { label: "Gross payroll", value: formatINRCompact(s.gross) }, { label: "Deductions", value: formatINRCompact(s.deductions), tone: "down" }, { label: "Headcount", value: String(s.headcount) },
      { label: "Processed", value: String(count("Processed")), tone: "up" }, { label: "Pending", value: String(count("Pending")), tone: "neutral" }, { label: "On hold", value: String(count("On Hold")), tone: "down" },
    ] }],
    sources: ["Payroll run PR-2026-09", "Processing log PR-2026-09"],
  };
}

function anomalies(): AssistantReply {
  const open = anomalyList.filter((a) => a.status === "Open" || a.status === "Investigating");
  return {
    text: `The anomaly engine has flagged **${open.length} open items** this cycle. The top items are listed below; open Payroll Anomalies to review or resolve them.`,
    cards: [{ kind: "list", title: "Open payroll anomalies", rows: open.slice(0, 5).map((a) => ({
      primary: `${a.employee} · ${a.type}`, secondary: `Expected ${a.expected} · actual ${a.actual} (${a.variance})`,
      badge: a.severity, tone: a.severity === "Critical" ? "critical" : a.severity === "Warning" ? "warning" : "info",
    })) }],
    sources: ["Anomaly engine run AE-2026-09-30", "Payroll run PR-2026-09"],
  };
}

function expenditure(): AssistantReply {
  const c = monthlySeries[monthlySeries.length - 1]!, p = monthlySeries[monthlySeries.length - 2]!;
  return {
    text: `Payroll expenditure rose **${formatINRCompact(c.gross - p.gross)}** from August to September. The recorded drivers are headcount growth, higher overtime, and the September incentive cycle.`,
    cards: [{ kind: "changes", title: "Payroll run comparison · Aug → Sep", rows: [
      { label: "Gross payroll", prev: formatINRCompact(p.gross), curr: formatINRCompact(c.gross), delta: `+${formatINRCompact(c.gross - p.gross)}`, up: false },
      { label: "Headcount", prev: String(p.headcount), curr: String(c.headcount), delta: `+${c.headcount - p.headcount}`, up: false },
      { label: "Overtime cost", prev: formatINRCompact(p.overtime), curr: formatINRCompact(c.overtime), delta: `+${formatINRCompact(c.overtime - p.overtime)}`, up: false },
      { label: "TDS", prev: formatINRCompact(p.tax), curr: formatINRCompact(c.tax), delta: `+${formatINRCompact(c.tax - p.tax)}`, up: false },
    ] }],
    sources: ["Payroll run PR-2026-08", "Payroll run PR-2026-09"],
  };
}

function engineering(): AssistantReply {
  const s = seriesFor("Engineering", 2);
  const c = s[1]!, p = s[0]!;
  return {
    text: "Engineering is the largest department by payroll cost. Here is the September figure from the payroll run, with August for comparison.",
    cards: [{ kind: "metrics", title: "Engineering · September 2026", items: [
      { label: "Payroll", value: formatINRCompact(c.gross) }, { label: "Headcount", value: String(c.headcount) }, { label: "Avg salary", value: formatINR(Math.round(c.gross / c.headcount)) },
      { label: "Overtime", value: formatINRCompact(c.overtime), tone: "down" }, { label: "TDS", value: formatINRCompact(c.tax) }, { label: "vs Aug", value: `+${formatINRCompact(c.gross - p.gross)}`, tone: "neutral" },
    ] }],
    sources: ["Payroll run PR-2026-09 · dept=Engineering"],
  };
}

export function mockReply(q: string): AssistantReply {
  const s = q.toLowerCase();
  if (/decrease|drop|less|lower|change/.test(s) && /my|salary/.test(s)) return salaryChange();
  if (/explain|my salary|payslip|breakdown/.test(s)) return explainMonth();
  if (/unusual|anomal|suspicious|flag/.test(s)) return anomalies();
  if (/expenditure|cost|increase|spend/.test(s)) return expenditure();
  if (/engineering|department/.test(s)) return engineering();
  if (/summary|payroll run|this month/.test(s)) return runSummary();
  return {
    text: "I can only answer using verified payroll records, and I couldn't match your question to one. Try asking about your payslip, salary changes, the current payroll run, anomalies, or a department's payroll.",
    cards: [], sources: [],
  };
}
