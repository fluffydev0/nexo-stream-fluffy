-- Contract status enum
CREATE TYPE public.contract_status AS ENUM (
  'awaiting_funding',
  'active',
  'disputed',
  'completed',
  'cancelled'
);

CREATE TYPE public.milestone_status AS ENUM (
  'locked',
  'in_progress',
  'pending_approval',
  'paid',
  'disputed'
);

CREATE TYPE public.dispute_method AS ENUM (
  'auto_release_72h',
  'nexolpay_arbitration'
);

-- Main contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_code TEXT NOT NULL UNIQUE,
  public_share_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  freelancer_id UUID NOT NULL,
  freelancer_email TEXT NOT NULL,
  client_id UUID,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  currency TEXT NOT NULL DEFAULT 'USDC',
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  dispute_method public.dispute_method NOT NULL DEFAULT 'auto_release_72h',
  status public.contract_status NOT NULL DEFAULT 'awaiting_funding',
  escrow_pubkey TEXT,
  escrow_secret TEXT,
  stellar_network TEXT NOT NULL DEFAULT 'testnet',
  funded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_freelancer ON public.contracts(freelancer_id);
CREATE INDEX idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX idx_contracts_client_email ON public.contracts(client_email);
CREATE INDEX idx_contracts_share_code ON public.contracts(public_share_code);

-- Milestones table
CREATE TABLE public.contract_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  percentage NUMERIC NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.milestone_status NOT NULL DEFAULT 'locked',
  deliverable_url TEXT,
  deliverable_note TEXT,
  payment_requested_at TIMESTAMP WITH TIME ZONE,
  auto_release_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  stellar_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (contract_id, position)
);

CREATE INDEX idx_milestones_contract ON public.contract_milestones(contract_id);
CREATE INDEX idx_milestones_status ON public.contract_milestones(status);

-- Events / audit log
CREATE TABLE public.contract_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.contract_milestones(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_role TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_contract ON public.contract_events(contract_id);

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER milestones_updated_at
BEFORE UPDATE ON public.contract_milestones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_events ENABLE ROW LEVEL SECURITY;

-- Helper: check contract participant
CREATE OR REPLACE FUNCTION public.is_contract_participant(_contract_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contracts c
    LEFT JOIN public.users u ON u.id = _user_id
    WHERE c.id = _contract_id
      AND (
        c.freelancer_id = _user_id
        OR c.client_id = _user_id
        OR c.client_email = u.email
      )
  )
$$;

-- Contracts RLS
CREATE POLICY "Freelancers and clients can view their contracts"
ON public.contracts FOR SELECT
USING (
  auth.uid() = freelancer_id
  OR auth.uid() = client_id
  OR client_email = (SELECT email FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "Freelancers can create contracts"
ON public.contracts FOR INSERT
WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers and clients can update their contracts"
ON public.contracts FOR UPDATE
USING (
  auth.uid() = freelancer_id
  OR auth.uid() = client_id
  OR client_email = (SELECT email FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can view all contracts"
ON public.contracts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Milestones RLS
CREATE POLICY "Participants can view milestones"
ON public.contract_milestones FOR SELECT
USING (public.is_contract_participant(contract_id, auth.uid()));

CREATE POLICY "Freelancers can insert milestones"
ON public.contract_milestones FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND freelancer_id = auth.uid())
);

CREATE POLICY "Participants can update milestones"
ON public.contract_milestones FOR UPDATE
USING (public.is_contract_participant(contract_id, auth.uid()));

-- Events RLS
CREATE POLICY "Participants can view events"
ON public.contract_events FOR SELECT
USING (public.is_contract_participant(contract_id, auth.uid()));

CREATE POLICY "Participants can insert events"
ON public.contract_events FOR INSERT
WITH CHECK (public.is_contract_participant(contract_id, auth.uid()));

-- Contract code generator
CREATE OR REPLACE FUNCTION public.generate_contract_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  year_part TEXT;
  num_part INTEGER;
BEGIN
  year_part := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(contract_code, '-', 3) AS INTEGER)), 0) + 1
  INTO num_part
  FROM public.contracts
  WHERE contract_code LIKE 'CTR-' || year_part || '-%';
  new_code := 'CTR-' || year_part || '-' || LPAD(num_part::TEXT, 5, '0');
  RETURN new_code;
END;
$$;