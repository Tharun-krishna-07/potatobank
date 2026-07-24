import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/app-shell";
import { listTransactions, type Transaction } from "@/lib/bank.functions";
import { getSession } from "@/lib/session";
import { Screen } from "./deposit";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Transactions — PotatoBank" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

type Filter = "all" | "deposit" | "withdraw" | "transfer";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Deposits" },
  { id: "withdraw", label: "Withdrawals" },
  { id: "transfer", label: "Transfers" },
];

function iconFor(t: Transaction["type"]) {
  switch (t) {
    case "deposit":
      return { Icon: PlusCircle, color: "text-success", bg: "bg-success/12" };
    case "withdraw":
      return { Icon: MinusCircle, color: "text-brand", bg: "bg-brand/12" };
    case "failed_withdrawal":
      return { Icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/12" };
    case "transfer_in":
      return { Icon: ArrowDownLeft, color: "text-success", bg: "bg-success/12" };
    case "transfer_out":
      return { Icon: ArrowUpRight, color: "text-brand", bg: "bg-brand/12" };
  }
}

function labelFor(t: Transaction) {
  switch (t.type) {
    case "deposit":
      return "Deposit";
    case "withdraw":
      return "Withdrawal";
    case "failed_withdrawal":
      return "Failed withdrawal";
    case "transfer_in":
      return `Received from ${t.related_acc_no ?? "—"}`;
    case "transfer_out":
      return `Sent to ${t.related_acc_no ?? "—"}`;
  }
}

function HistoryPage() {
  const nav = useNavigate();
  const load = useServerFn(listTransactions);
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const sess = getSession();
    if (!sess) {
      nav({ to: "/login" });
      return;
    }
    load({ data: { acc_no: sess.acc_no } })
      .then(setRows)
      .finally(() => setLoading(false));
  }, [load, nav]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "transfer")
      return rows.filter((r) => r.type === "transfer_in" || r.type === "transfer_out");
    if (filter === "withdraw")
      return rows.filter((r) => r.type === "withdraw" || r.type === "failed_withdrawal");
    return rows.filter((r) => r.type === "deposit");
  }, [rows, filter]);

  return (
    <Screen title="Transactions" subtitle="Newest activity first.">
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={
              "rounded-full border px-4 py-1.5 text-sm transition " +
              (filter === f.id
                ? "border-transparent bg-brand text-brand-foreground shadow-glass"
                : "border-glass-border bg-glass text-muted-foreground hover:text-foreground")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <GlassCard className="p-2">
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-lg font-medium">No transactions yet</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Make your first deposit or transfer to see it here.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {filtered.map((t) => {
                const meta = iconFor(t.type);
                const failed = t.type === "failed_withdrawal";
                const positive = t.type === "deposit" || t.type === "transfer_in";
                return (
                  <li
                    key={t.transaction_id}
                    className="flex items-center gap-4 px-4 py-3 transition hover:bg-background/40"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}
                    >
                      <meta.Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{labelFor(t)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(t.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={
                        "font-mono text-sm font-semibold " +
                        (failed
                          ? "text-destructive line-through"
                          : positive
                            ? "text-success"
                            : "text-foreground")
                      }
                    >
                      {positive ? "+" : failed ? "" : "−"}$
                      {Number(t.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </GlassCard>
    </Screen>
  );
}
