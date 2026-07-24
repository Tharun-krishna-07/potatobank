import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const pinRe = /^\d{4}$/;
const accRe = /^\d{10}$/;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type Account = {
  acc_no: string;
  acc_name: string;
  balance: number;
};
export type Transaction = {
  transaction_id: number;
  acc_no: string;
  type: "deposit" | "withdraw" | "failed_withdrawal" | "transfer_out" | "transfer_in";
  amount: number;
  related_acc_no: string | null;
  timestamp: string;
};

async function verifyCredentials(accNoStr: string, pin: string) {
  const { hashPin: _h, verifyPin } = await import("./hash.server");
  void _h;
  const db = await admin();
  const { data, error } = await db
    .from("accounts")
    .select("acc_no, acc_name, balance, pin_hash")
    .eq("acc_no", Number(accNoStr))
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Account not found");
  const ok = await verifyPin(pin, (data as { pin_hash: string }).pin_hash);
  if (!ok) throw new Error("Incorrect PIN");
  return data as { acc_no: number; acc_name: string; balance: number; pin_hash: string };
}

// --- Create account ---
export const createAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; pin: string }) =>
    z
      .object({
        name: z.string().trim().min(1, "Name required").max(80),
        pin: z.string().regex(pinRe, "PIN must be 4 digits"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { hashPin } = await import("./hash.server");
    const db = await admin();
    const { data: accNoRow, error: rpcErr } = await db.rpc("generate_account_number");
    if (rpcErr || accNoRow == null) throw new Error(rpcErr?.message || "Could not allocate account");
    const acc_no = accNoRow as unknown as number;
    const pin_hash = await hashPin(data.pin);
    const { error } = await db
      .from("accounts")
      .insert({ acc_no, acc_name: data.name, pin_hash, balance: 0 });
    if (error) throw new Error(error.message);
    return { acc_no: String(acc_no), acc_name: data.name };
  });

// --- Login ---
export const login = createServerFn({ method: "POST" })
  .inputValidator((d: { acc_no: string; pin: string }) =>
    z
      .object({
        acc_no: z.string().regex(accRe, "Account number must be 10 digits"),
        pin: z.string().regex(pinRe, "PIN must be 4 digits"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const row = await verifyCredentials(data.acc_no, data.pin);
    return {
      acc_no: String(row.acc_no),
      acc_name: row.acc_name,
      balance: Number(row.balance),
    };
  });

// --- Get account (session refresh, no PIN needed after login) ---
export const getAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { acc_no: string }) =>
    z.object({ acc_no: z.string().regex(accRe) }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db
      .from("accounts")
      .select("acc_no, acc_name, balance")
      .eq("acc_no", Number(data.acc_no))
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Account not found");
    return {
      acc_no: String((row as { acc_no: number }).acc_no),
      acc_name: (row as { acc_name: string }).acc_name,
      balance: Number((row as { balance: number }).balance),
    };
  });

// --- Deposit ---
export const deposit = createServerFn({ method: "POST" })
  .inputValidator((d: { acc_no: string; pin: string; amount: number }) =>
    z
      .object({
        acc_no: z.string().regex(accRe),
        pin: z.string().regex(pinRe),
        amount: z.number().positive("Amount must be positive").max(1_000_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await verifyCredentials(data.acc_no, data.pin);
    const db = await admin();
    const { data: newBal, error } = await db.rpc("perform_deposit", {
      _acc_no: Number(data.acc_no),
      _amount: data.amount,
    });
    if (error) throw new Error(error.message);
    return { balance: Number(newBal) };
  });

// --- Withdraw ---
export const withdraw = createServerFn({ method: "POST" })
  .inputValidator((d: { acc_no: string; pin: string; amount: number }) =>
    z
      .object({
        acc_no: z.string().regex(accRe),
        pin: z.string().regex(pinRe),
        amount: z.number().positive("Amount must be positive").max(1_000_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await verifyCredentials(data.acc_no, data.pin);
    const db = await admin();
    const { data: newBal, error } = await db.rpc("perform_withdraw", {
      _acc_no: Number(data.acc_no),
      _amount: data.amount,
    });
    if (error) throw new Error(error.message);
    return { balance: Number(newBal) };
  });

// --- Transfer ---
export const transfer = createServerFn({ method: "POST" })
  .inputValidator((d: { acc_no: string; pin: string; to_acc_no: string; amount: number }) =>
    z
      .object({
        acc_no: z.string().regex(accRe),
        pin: z.string().regex(pinRe),
        to_acc_no: z.string().regex(accRe, "Receiver account must be 10 digits"),
        amount: z.number().positive("Amount must be positive").max(1_000_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (data.acc_no === data.to_acc_no) throw new Error("Cannot transfer to same account");
    await verifyCredentials(data.acc_no, data.pin);
    const db = await admin();
    const { data: newBal, error } = await db.rpc("perform_transfer", {
      _from: Number(data.acc_no),
      _to: Number(data.to_acc_no),
      _amount: data.amount,
    });
    if (error) throw new Error(error.message);
    return { balance: Number(newBal) };
  });

// --- Transactions ---
export const listTransactions = createServerFn({ method: "POST" })
  .inputValidator((d: { acc_no: string }) =>
    z.object({ acc_no: z.string().regex(accRe) }).parse(d),
  )
  .handler(async ({ data }): Promise<Transaction[]> => {
    const db = await admin();
    const { data: rows, error } = await db
      .from("transactions")
      .select("transaction_id, acc_no, type, amount, related_acc_no, timestamp")
      .eq("acc_no", Number(data.acc_no))
      .order("timestamp", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const row = r as {
        transaction_id: number;
        acc_no: number;
        type: Transaction["type"];
        amount: number;
        related_acc_no: number | null;
        timestamp: string;
      };
      return {
        transaction_id: row.transaction_id,
        acc_no: String(row.acc_no),
        type: row.type,
        amount: Number(row.amount),
        related_acc_no: row.related_acc_no != null ? String(row.related_acc_no) : null,
        timestamp: row.timestamp,
      };
    });
  });

// --- Leaderboard (public, exposes only name + balance) ---
export type LeaderboardEntry = { acc_name: string; balance: number };

export const getLeaderboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<LeaderboardEntry[]> => {
    const db = await admin();
    const { data, error } = await db
      .from("accounts")
      .select("acc_name, balance")
      .order("balance", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      acc_name: (r as { acc_name: string }).acc_name,
      balance: Number((r as { balance: number }).balance),
    }));
  },
);

// --- My rank (returns rank and balance for a given account) ---
export const getMyRank = createServerFn({ method: "POST" })
  .inputValidator((d: { acc_no: string }) =>
    z.object({ acc_no: z.string().regex(accRe) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ rank: number; balance: number; acc_name: string }> => {
    const db = await admin();
    const { data: me, error: e1 } = await db
      .from("accounts")
      .select("acc_name, balance")
      .eq("acc_no", Number(data.acc_no))
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!me) throw new Error("Account not found");
    const balance = Number((me as { balance: number }).balance);
    const { count, error: e2 } = await db
      .from("accounts")
      .select("acc_no", { count: "exact", head: true })
      .gt("balance", balance);
    if (e2) throw new Error(e2.message);
    return {
      rank: (count ?? 0) + 1,
      balance,
      acc_name: (me as { acc_name: string }).acc_name,
    };
  });
