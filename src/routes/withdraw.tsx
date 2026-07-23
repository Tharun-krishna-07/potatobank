import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/app-shell";
import { AnimatedCounter } from "@/components/animated-counter";
import { getAccount, withdraw } from "@/lib/bank.functions";
import { getSession } from "@/lib/session";
import { AmountFields, Screen, SuccessCard } from "./deposit";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw — Halo Bank" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WithdrawPage,
});

function WithdrawPage() {
  const nav = useNavigate();
  const doWithdraw = useServerFn(withdraw);
  const load = useServerFn(getAccount);
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sess = getSession();
    if (!sess) {
      nav({ to: "/login" });
      return;
    }
    load({ data: { acc_no: sess.acc_no } }).then((r) => setBalance(r.balance));
  }, [load, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!isFinite(amt) || amt <= 0) return setError("Enter an amount greater than 0.");
    if (!/^\d{4}$/.test(pin)) return setError("PIN must be 4 digits.");
    const sess = getSession();
    if (!sess) return nav({ to: "/login" });
    setLoading(true);
    try {
      const r = await doWithdraw({ data: { acc_no: sess.acc_no, pin, amount: amt } });
      setBalance(r.balance);
      setDone(true);
      setTimeout(() => nav({ to: "/dashboard" }), 1300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Withdraw" subtitle="Take money out of your account.">
      {balance != null && (
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Available:{" "}
          <span className="font-semibold text-foreground">
            <AnimatedCounter value={balance} />
          </span>
        </div>
      )}
      {done ? (
        <SuccessCard message={`Withdrew $${Number(amount).toLocaleString()}.`} />
      ) : (
        <GlassCard>
          <form onSubmit={onSubmit} className="space-y-5">
            <AmountFields amount={amount} setAmount={setAmount} pin={pin} setPin={setPin} />
            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Processing…" : "Confirm withdrawal"}
            </button>
          </form>
        </GlassCard>
      )}
    </Screen>
  );
}
