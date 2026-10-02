import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Bot, Database, MessageSquarePlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mockReply, suggestions, type AssistantReply, type Card } from "@/lib/assistant-mock";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; text: string; reply?: AssistantReply };
type Thread = { id: string; title: string; messages: Msg[] };

const uid = () => Math.random().toString(36).slice(2, 10);

export function AssistantView({ suggestionSet = suggestions }: { suggestionSet?: string[] }) {
  const [threads, setThreads] = useState<Thread[]>([{ id: "t0", title: "New conversation", messages: [] }]);
  const [activeId, setActiveId] = useState("t0");
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const active = threads.find((t) => t.id === activeId)!;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active.messages.length, thinking]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId, thinking]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    const tid = activeId;
    setThreads((ts) => ts.map((t) => t.id === tid ? { ...t, title: t.messages.length ? t.title : q.slice(0, 40), messages: [...t.messages, { id: uid(), role: "user", text: q }] } : t));
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = mockReply(q);
      setThreads((ts) => ts.map((t) => t.id === tid ? { ...t, messages: [...t.messages, { id: uid(), role: "assistant", text: reply.text, reply }] } : t));
      setThinking(false);
    }, 700);
  };

  const newThread = () => {
    const id = uid();
    setThreads((ts) => [{ id, title: "New conversation", messages: [] }, ...ts]);
    setActiveId(id);
  };

  return (
    <div className="grid h-[calc(100vh-11rem)] min-h-[520px] gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden flex-col rounded-xl border bg-card p-3 lg:flex">
        <Button variant="outline" size="sm" onClick={newThread} className="mb-3 justify-start"><MessageSquarePlus className="h-4 w-4" /> New conversation</Button>
        <div className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">History</div>
        <div className="flex-1 space-y-0.5 overflow-y-auto">
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActiveId(t.id)}
              className={cn("w-full truncate rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted", t.id === activeId && "bg-primary-soft font-medium text-accent-foreground")}>
              {t.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b px-5 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          Answers only use verified payroll records. The assistant never calculates or estimates pay figures itself.
          <span className="ml-auto rounded bg-warning-soft px-1.5 py-0.5 font-medium text-warning">Demo responses</span>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {active.messages.length === 0 && (
            <div className="mx-auto max-w-xl pt-6 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Bot className="h-6 w-6" /></span>
              <h2 className="mt-3 text-lg font-semibold">PayFlow payroll assistant</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ask about payslips, salary changes, payroll runs and anomalies.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {suggestionSet.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary-soft">{s}</button>
                ))}
              </div>
            </div>
          )}

          {active.messages.map((m) => m.role === "user" ? (
            <div key={m.id} className="flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.text}</div></div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><Bot className="h-4 w-4" /></span>
              <div className="min-w-0 max-w-[85%] space-y-3">
                <p className="text-sm leading-relaxed"><Rich text={m.text} /></p>
                {m.reply?.cards.map((c, i) => <ResponseCard key={i} card={c} />)}
                {!!m.reply?.sources.length && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Database className="h-3 w-3" /> Sources:
                    {m.reply.sources.map((s) => <span key={s} className="rounded border bg-muted px-1.5 py-0.5 font-medium">{s}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><Bot className="h-4 w-4" /></span>
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {active.messages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-5 pb-2">
            {suggestionSet.slice(0, 4).map((s) => <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted">{s}</button>)}
          </div>
        )}
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); send(input); }} className="border-t p-3">
          <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring/30">
            <Textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} rows={1} maxLength={500}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask about payroll…" className="max-h-32 min-h-9 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!input.trim() || thinking} aria-label="Send"><ArrowUp className="h-4 w-4" /></Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Rich({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/).map((p, i) => p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)}</>;
}

const toneTxt = { up: "text-success", down: "text-destructive", neutral: "text-foreground" };
const badge = { critical: "bg-destructive-soft text-destructive", warning: "bg-warning-soft text-warning", info: "bg-primary-soft text-primary" };

function ResponseCard({ card }: { card: Card }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{card.title}</div>
      {card.kind === "metrics" && (
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
          {card.items.map((it) => (
            <div key={it.label} className="bg-card px-4 py-3"><div className="text-xs text-muted-foreground">{it.label}</div><div className={cn("mt-0.5 font-semibold tabular", it.tone && toneTxt[it.tone])}>{it.value}</div></div>
          ))}
        </div>
      )}
      {card.kind === "changes" && (
        <table className="w-full text-sm">
          <tbody>
            {card.rows.map((r) => (
              <tr key={r.label} className="border-b last:border-0">
                <td className="px-4 py-2">{r.label}</td>
                <td className="px-2 py-2 text-right text-muted-foreground tabular">{r.prev}</td>
                <td className="px-2 py-2 text-right tabular">{r.curr}</td>
                <td className={cn("px-4 py-2 text-right font-semibold tabular", r.up ? "text-success" : "text-destructive")}>{r.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {card.kind === "list" && (
        <ul className="divide-y">
          {card.rows.map((r) => (
            <li key={r.primary} className="flex items-start gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1"><div className="text-sm font-medium">{r.primary}</div><div className="text-xs text-muted-foreground">{r.secondary}</div></div>
              <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold", badge[r.tone])}>{r.badge}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
