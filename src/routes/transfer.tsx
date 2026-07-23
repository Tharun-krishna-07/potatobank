import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/app-shell";
import { AnimatedCounter } from "@/components/animated-counter";
import { getAccount, transfer } from "@/lib/bank.functions";
import { getSession } from "@/lib/session";
import { Screen, SuccessCard } from "./deposit";

export const Route = createFileRoute("/transfer")({
  head: () => ({
    meta: [
      { title: "Transfer — Halo Bank" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TransferPage,
});

function TransferPage() {
  const nav = useNavigate();
  const doTransfer = useServerFn(transfer);
  const load = useServerFn(getAccount);
  const [balance, setBalance] = useState<number | null>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sess = getSession();
    if (!sess) return nav({ to: "/login" });
    load({ data: { acc_no: sess.acc_no } }).then((r) => setBalance(r.balance));
  }, [load, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!/^\d{10}$/.test(to)) return setError("Receiver must be a 10-digit account.");
    if (!isFinite(amt) || amt <= 0) return setError("Enter an amount greater than 0.");
    if (!/^\d{4}$/.test(pin)) return setError("PIN must be 4 digits.");
    const sess = getSession();
    if (!sess) return nav({ to: "/login" });
    setLoading(true);
    try {
      const r = await doTransfer({
        data: { acc_no: sess.acc_no, to_acc_no: to, pin, amount: amt },
      });
      setBalance(r.balance);
      setDone(true);
      setTimeout(() => nav({ to: "/dashboard" }), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Transfer" subtitle="Send money to another Halo account.">
      {balance != null && (
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Available:{" "}
          <span className="font-semibold text-foreground">
            <AnimatedCounter value={balance} />
          </span>
        </div>
      )}
      {done ? (
        <SuccessCard message={`Sent $${Number(amount).toLocaleString()} to ${to}.`} />
      ) : (
        <GlassCard>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-sm">Recipient account number</label>
              <input
                className="field font-mono tracking-widest"
                inputMode="numeric"
                maxLength={10}
                placeholder="0000000000"
                value={to}
                onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
            <div>
              <label className="label-sm">Amount</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
                  $
                </span>
                <input
                  className="field pl-10 text-2xl font-semibold"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                />
              </div>
            </div>
            <div>
              <label className="label-sm">Confirm with PIN</label>
              <input
                className="field tracking-[0.8em] text-center text-2xl font-semibold"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending…" : "Send money"}
            </button>
          </form>
        </GlassCard>
      )}
    </Screen>
  );
}
