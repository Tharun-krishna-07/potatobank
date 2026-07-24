import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell, GlassCard } from "@/components/app-shell";
import { AnimatedCounter } from "@/components/animated-counter";
import { getLeaderboard, getMyRank, type LeaderboardEntry } from "@/lib/bank.functions";
import { getSession } from "@/lib/session";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — PotatoBank" },
      { name: "description", content: "The wealthiest spuds on PotatoBank." },
      { property: "og:title", content: "Leaderboard — PotatoBank" },
      { property: "og:description", content: "The wealthiest spuds on PotatoBank." },
    ],
  }),
  component: LeaderboardPage,
});

function titleFor(rank: number): string {
  if (rank === 1) return "Potato Baron";
  if (rank <= 3) return "Spud Aristocrat";
  if (rank <= 10) return "Chip Tycoon";
  return "Humble Tater";
}

function medalFor(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-glass-border bg-background/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function LeaderboardPage() {
  const loadBoard = useServerFn(getLeaderboard);
  const loadRank = useServerFn(getMyRank);
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [me, setMe] = useState<{ rank: number; balance: number; acc_name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBoard()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load leaderboard"));
    const sess = getSession();
    if (sess) {
      loadRank({ data: { acc_no: sess.acc_no } })
        .then(setMe)
        .catch(() => {});
    }
  }, [loadBoard, loadRank]);

  const showMyRank = me && me.rank > 10;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 pt-4 sm:pt-8">
        <div className="animate-fade-in text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12 text-brand">
            <Trophy className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The ten wealthiest spuds on PotatoBank.
          </p>
        </div>

        <GlassCard className="animate-fade-in">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!rows && !error && (
            <p className="text-center text-sm text-muted-foreground">Loading…</p>
          )}
          {rows && (
            <ul className="divide-y divide-glass-border">
              {rows.map((row, i) => {
                const rank = i + 1;
                const medal = medalFor(rank);
                return (
                  <li
                    key={`${row.acc_name}-${i}`}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background/60 text-lg font-semibold">
                      {medal ?? <span className="text-muted-foreground">{rank}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold">{row.acc_name}</div>
                      <div className="mt-1">
                        <Pill>{titleFor(rank)}</Pill>
                      </div>
                    </div>
                    <div className="text-right font-mono text-base font-semibold tabular-nums">
                      <AnimatedCounter value={row.balance} />
                    </div>
                  </li>
                );
              })}
              {rows.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  No accounts yet.
                </li>
              )}
            </ul>
          )}
        </GlassCard>

        {showMyRank && (
          <GlassCard className="animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background/60 text-sm font-semibold text-muted-foreground">
                #{me!.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-muted-foreground">You're currently</div>
                <div className="mt-0.5 truncate text-base font-semibold">
                  #{me!.rank} · {me!.acc_name}
                </div>
                <div className="mt-1">
                  <Pill>{titleFor(me!.rank)}</Pill>
                </div>
              </div>
              <div className="text-right font-mono text-base font-semibold tabular-nums">
                <AnimatedCounter value={me!.balance} />
              </div>
            </div>
          </GlassCard>
        )}

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back home
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
