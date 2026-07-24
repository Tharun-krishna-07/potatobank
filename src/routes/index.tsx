import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/app-shell";
import { ArrowRight, Shield, Sparkles, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PotatoBank — A calmer way to bank" },
      {
        name: "description",
        content:
          "PotatoBank is a premium personal banking experience — instant transfers, secure PINs, beautiful design.",
      },
      { property: "og:title", content: "PotatoBank — A calmer way to bank" },
      {
        property: "og:description",
        content: "PotatoBank is a premium personal banking experience — instant transfers, secure PINs, beautiful design.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <section className="grid gap-12 pt-8 lg:grid-cols-2 lg:pt-16">
        <div className="flex flex-col justify-center animate-fade-in">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" /> Personal banking, reimagined
          </span>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
            A calmer way <br /> to move money.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Open an account in seconds. Deposit, withdraw and transfer with
            confidence — protected by a private PIN only you know.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/create" className="btn-primary">
              Open an account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-ghost">
              Sign in
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> PIN hashed with PBKDF2
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Instant transfers
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-brand/30 via-accent2/20 to-transparent blur-2xl" />
          <GlassCard className="w-full max-w-md">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>PotatoBank · Personal</span>
              <span>•• 4271</span>
            </div>
            <div className="mt-8">
              <div className="text-sm text-muted-foreground">Available balance</div>
              <div className="mt-1 text-5xl font-semibold tracking-tight">
                $12,480.00
              </div>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-2 text-xs">
              {["Deposit", "Send", "History"].map((l) => (
                <div
                  key={l}
                  className="rounded-2xl border border-glass-border bg-background/50 py-3 text-center font-medium"
                >
                  {l}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>
    </AppShell>
  );
}
