
REVOKE ALL ON FUNCTION public.generate_account_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.perform_deposit(BIGINT, NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.perform_withdraw(BIGINT, NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.perform_transfer(BIGINT, BIGINT, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_account_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.perform_deposit(BIGINT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.perform_withdraw(BIGINT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.perform_transfer(BIGINT, BIGINT, NUMERIC) TO service_role;
