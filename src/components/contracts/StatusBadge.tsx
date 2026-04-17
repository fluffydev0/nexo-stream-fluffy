import { ContractStatus, MilestoneStatus, STATUS_LABELS, MILESTONE_LABELS } from '@/lib/contracts';

const CONTRACT_STYLES: Record<ContractStatus, string> = {
  awaiting_funding: 'bg-amber/15 text-amber border border-amber/25',
  active: 'bg-primary/15 text-primary border border-primary/25',
  disputed: 'bg-destructive/15 text-destructive border border-destructive/25',
  completed: 'bg-muted/40 text-muted-foreground border border-border',
  cancelled: 'bg-muted/40 text-muted-foreground border border-border',
};

const MILESTONE_STYLES: Record<MilestoneStatus, string> = {
  locked: 'bg-muted/40 text-muted-foreground border border-border',
  in_progress: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  pending_approval: 'bg-amber/15 text-amber border border-amber/25',
  paid: 'bg-primary/15 text-primary border border-primary/25',
  disputed: 'bg-destructive/15 text-destructive border border-destructive/25',
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${CONTRACT_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${MILESTONE_STYLES[status]}`}>
      {MILESTONE_LABELS[status]}
    </span>
  );
}
