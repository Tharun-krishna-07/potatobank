
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = true)
AS SELECT acc_name, balance FROM public.accounts;

GRANT SELECT ON public.leaderboard TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_rank(_balance numeric)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) + 1 FROM public.accounts WHERE balance > _balance;
$$;

GRANT EXECUTE ON FUNCTION public.get_rank(numeric) TO anon, authenticated;

-- Allow public read of only the two safe columns via a policy on accounts is not needed
-- because we expose the view; but accounts still has no RLS enabled.
-- Ensure accounts RLS remains as-is (server functions use service_role).
