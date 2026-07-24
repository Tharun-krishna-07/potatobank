import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, GlassCard } from "@/components/app-shell";
import { login } from "@/lib/bank.functions";
import { setSession } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — PotatoBank" },
      { name: "description", content: "Sign in to your PotatoBank account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const doLogin = useServerFn(login);
  const [accNo, setAccNo] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{10}$/.test(accNo)) return setError("Account number must be 10 digits.");
    if (!/^\d{4}$/.test(pin)) return setError("PIN must be 4 digits.");
    setLoading(true);
    try {
      const r = await doLogin({ data: { acc_no: accNo, pin } });
      setSession({ acc_no: r.acc_no, acc_name: r.acc_name });
      nav({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md pt-8 sm:pt-12">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account.</p>
        </div>
        <GlassCard>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-sm">Account number</label>
              <input
                className="field font-mono tracking-widest"
                inputMode="numeric"
                maxLength={10}
                placeholder="0000000000"
                value={accNo}
                onChange={(e) => setAccNo(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
            <div>
              <label className="label-sm">PIN</label>
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/create" className="font-medium text-brand hover:underline">
                Open an account
              </Link>
            </p>
          </form>
        </GlassCard>
      </div>
    </AppShell>
  );
}
