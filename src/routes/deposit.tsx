import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell, GlassCard } from "@/components/app-shell";
import { AnimatedCounter } from "@/components/animated-counter";
import { deposit, getAccount } from "@/lib/bank.functions";
import { getSession } from "@/lib/session";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit — PotatoBank" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DepositPage,
});

function DepositPage() {
  return <AmountForm kind="deposit" />;
}

// Shared amount form used by deposit/withdraw (transfer has its own)
export function AmountForm({ kind }: { kind: "deposit" | "withdraw" }) {
  const nav = useNavigate();
  const doDeposit = useServerFn(deposit);
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
      const r = await doDeposit({ data: { acc_no: sess.acc_no, pin, amount: amt } });
      setBalance(r.balance);
      setDone(true);
      setTimeout(() => nav({ to: "/dashboard" }), 1300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Deposit" subtitle="Add money to your account.">
      {balance != null && (
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Current balance:{" "}
          <span className="font-semibold text-foreground">
            <AnimatedCounter value={balance} />
          </span>
        </div>
      )}
      {done ? (
        <SuccessCard message={`Deposited $${Number(amount).toLocaleString()}.`} />
      ) : (
        <GlassCard>
          <form onSubmit={onSubmit} className="space-y-5">
            <AmountFields
              amount={amount}
              setAmount={setAmount}
              pin={pin}
              setPin={setPin}
            />
            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Processing…" : `Confirm ${kind}`}
            </button>
          </form>
        </GlassCard>
      )}
    </Screen>
  );
}

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const nav = useNavigate();
  return (
    <AppShell>
      <div className="mx-auto max-w-md pt-4 sm:pt-8">
        <button
          onClick={() => nav({ to: "/dashboard" })}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
    </AppShell>
  );
}

export function AmountFields({
  amount,
  setAmount,
  pin,
  setPin,
}: {
  amount: string;
  setAmount: (s: string) => void;
  pin: string;
  setPin: (s: string) => void;
}) {
  return (
    <>
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
            autoFocus
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
    </>
  );
}

export function SuccessCard({ message }: { message: string }) {
  return (
    <GlassCard className="animate-fade-in text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Success</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </GlassCard>
  );
}
