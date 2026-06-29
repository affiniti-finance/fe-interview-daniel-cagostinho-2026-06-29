import { formatCents } from '../lib/money';
import type { Transaction } from '../types';

interface AccountSummaryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function AccountSummary({
  transactions,
  isLoading = false,
}: AccountSummaryProps) {
  const balanceCents = transactions
    .filter((t) => t.status === 'posted')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const pendingAuthCents = transactions
    .filter((t) => t.status === 'pending' && t.amountCents < 0)
    .reduce((sum, t) => sum + Math.abs(t.amountCents), 0);

  return (
    <section
      className="account-summary"
      aria-label="Account summary"
      aria-busy={isLoading || undefined}
    >
      <div className="summary-card">
        <span className="summary-label">Current balance</span>
        {isLoading ? (
          <span className="skeleton skeleton--summary-value" aria-hidden="true" />
        ) : (
          <span className="summary-value">{formatCents(balanceCents)}</span>
        )}
      </div>
      <div className="summary-card">
        <span className="summary-label">Pending authorizations</span>
        {isLoading ? (
          <span className="skeleton skeleton--summary-value" aria-hidden="true" />
        ) : (
          <span className="summary-value">{formatCents(pendingAuthCents)}</span>
        )}
      </div>
    </section>
  );
}
