
-- accounts table
CREATE TABLE public.accounts (
  acc_no BIGINT PRIMARY KEY,
  acc_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (server functions) may access.

-- transactions table
CREATE TABLE public.transactions (
  transaction_id BIGSERIAL PRIMARY KEY,
  acc_no BIGINT NOT NULL REFERENCES public.accounts(acc_no) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdraw','failed_withdrawal','transfer_out','transfer_in')),
  amount NUMERIC(18,2) NOT NULL,
  related_acc_no BIGINT REFERENCES public.accounts(acc_no) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX transactions_acc_no_ts_idx ON public.transactions (acc_no, timestamp DESC);

GRANT ALL ON public.transactions TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.transactions_transaction_id_seq TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Generate a unique 10-digit account number
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate BIGINT;
  attempts INT := 0;
BEGIN
  LOOP
    -- 10-digit number: 1_000_000_000 .. 9_999_999_999
    candidate := 1000000000 + floor(random() * 9000000000)::BIGINT;
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE acc_no = candidate) THEN
      RETURN candidate;
    END IF;
    attempts := attempts + 1;
    IF attempts > 20 THEN
      RAISE EXCEPTION 'Could not allocate account number';
    END IF;
  END LOOP;
END;
$$;

-- Deposit
CREATE OR REPLACE FUNCTION public.perform_deposit(_acc_no BIGINT, _amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  UPDATE public.accounts SET balance = balance + _amount
    WHERE acc_no = _acc_no
    RETURNING balance INTO new_balance;
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Account not found';
  END IF;
  INSERT INTO public.transactions (acc_no, type, amount) VALUES (_acc_no, 'deposit', _amount);
  RETURN new_balance;
END;
$$;

-- Withdraw
CREATE OR REPLACE FUNCTION public.perform_withdraw(_acc_no BIGINT, _amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur NUMERIC;
  new_balance NUMERIC;
BEGIN
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  SELECT balance INTO cur FROM public.accounts WHERE acc_no = _acc_no FOR UPDATE;
  IF cur IS NULL THEN
    RAISE EXCEPTION 'Account not found';
  END IF;
  IF cur < _amount THEN
    INSERT INTO public.transactions (acc_no, type, amount) VALUES (_acc_no, 'failed_withdrawal', _amount);
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  UPDATE public.accounts SET balance = balance - _amount WHERE acc_no = _acc_no RETURNING balance INTO new_balance;
  INSERT INTO public.transactions (acc_no, type, amount) VALUES (_acc_no, 'withdraw', _amount);
  RETURN new_balance;
END;
$$;

-- Transfer
CREATE OR REPLACE FUNCTION public.perform_transfer(_from BIGINT, _to BIGINT, _amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur NUMERIC;
  new_balance NUMERIC;
  to_exists BOOLEAN;
BEGIN
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  IF _from = _to THEN
    RAISE EXCEPTION 'Cannot transfer to same account';
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.accounts WHERE acc_no = _to) INTO to_exists;
  IF NOT to_exists THEN
    RAISE EXCEPTION 'Receiver account not found';
  END IF;
  SELECT balance INTO cur FROM public.accounts WHERE acc_no = _from FOR UPDATE;
  IF cur IS NULL THEN
    RAISE EXCEPTION 'Sender account not found';
  END IF;
  IF cur < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  UPDATE public.accounts SET balance = balance - _amount WHERE acc_no = _from RETURNING balance INTO new_balance;
  UPDATE public.accounts SET balance = balance + _amount WHERE acc_no = _to;
  INSERT INTO public.transactions (acc_no, type, amount, related_acc_no) VALUES (_from, 'transfer_out', _amount, _to);
  INSERT INTO public.transactions (acc_no, type, amount, related_acc_no) VALUES (_to, 'transfer_in', _amount, _from);
  RETURN new_balance;
END;
$$;
