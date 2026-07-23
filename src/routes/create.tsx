import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, GlassCard } from "@/components/app-shell";
import { createAccount } from "@/lib/bank.functions";
import { Check, Copy } from "lucide-react";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Open your Halo account" },
      { name: "description", content: "Create a Halo Bank account in seconds." },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const create = useServerFn(createAccount);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ acc_no: string; acc_name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please enter your full name.");
    if (!/^\d{4}$/.test(pin)) return setError("PIN must be exactly 4 digits.");
    setLoading(true);
    try {
      const r = await create({ data: { name: name.trim(), pin } });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md pt-12">
          <GlassCard className="animate-fade-in text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">Welcome, {result.acc_name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is ready. Save your account number — you'll need it to sign in.
            </p>
            <div className="mt-8 rounded-2xl bg-background/60 p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Account Number
              </div>
              <div className="mt-1 flex items-center justify-center gap-3 text-2xl font-mono tracking-widest">
                {result.acc_no}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.acc_no);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="rounded-full p-2 text-muted-foreground transition hover:bg-muted"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="btn-primary mt-8 w-full"
            >
              Continue to sign in
            </button>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md pt-8 sm:pt-12">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-semibold tracking-tight">Open an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Takes about 15 seconds. No documents required.
          </p>
        </div>
        <GlassCard>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-sm">Full name</label>
              <input
                className="field"
                placeholder="Jane Appleseed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                autoFocus
              />
            </div>
            <div>
              <label className="label-sm">Choose a 4-digit PIN</label>
              <input
                className="field tracking-[0.8em] text-center text-2xl font-semibold"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                We hash your PIN — we never store it in plain text.
              </p>
            </div>
            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-brand hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </GlassCard>
      </div>
    </AppShell>
  );
}
