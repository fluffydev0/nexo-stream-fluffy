export type ContractStatus =
  | 'awaiting_funding'
  | 'active'
  | 'disputed'
  | 'completed'
  | 'cancelled';

export type MilestoneStatus =
  | 'locked'
  | 'in_progress'
  | 'pending_approval'
  | 'paid'
  | 'disputed';

export type DisputeMethod = 'auto_release_72h' | 'nexolpay_arbitration';

export interface Contract {
  id: string;
  contract_code: string;
  public_share_code: string;
  freelancer_id: string;
  freelancer_email: string;
  client_id: string | null;
  client_email: string;
  title: string;
  description: string | null;
  total_amount: number;
  currency: string;
  deadline: string;
  dispute_method: DisputeMethod;
  status: ContractStatus;
  escrow_pubkey: string | null;
  stellar_network: string;
  funded_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  contract_id: string;
  position: number;
  title: string;
  description: string | null;
  amount: number;
  percentage: number;
  due_date: string;
  status: MilestoneStatus;
  deliverable_url: string | null;
  deliverable_note: string | null;
  payment_requested_at: string | null;
  auto_release_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  stellar_tx_hash: string | null;
}

export const STATUS_LABELS: Record<ContractStatus, string> = {
  awaiting_funding: 'Awaiting Funding',
  active: 'Active',
  disputed: 'Disputed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const MILESTONE_LABELS: Record<MilestoneStatus, string> = {
  locked: 'Locked',
  in_progress: 'In Progress',
  pending_approval: 'Pending Approval',
  paid: 'Paid',
  disputed: 'Disputed',
};

export function fmtUSDC(n: number): string {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function shortAddr(addr: string | null | undefined, len = 4): string {
  if (!addr) return '—';
  return `${addr.slice(0, len)}...${addr.slice(-len)}`;
}
