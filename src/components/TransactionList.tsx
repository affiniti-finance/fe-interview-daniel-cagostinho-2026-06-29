import { TransactionRow } from './TransactionRow';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  selectedId: string | null;
  onSelect: (transaction: Transaction) => void;
  isLoading?: boolean;
}

const SKELETON_ROW_COUNT = 8;

export function TransactionList({
  transactions,
  selectedId,
  onSelect,
  isLoading = false,
}: TransactionListProps) {
  if (!isLoading && transactions.length === 0) {
    return (
      <p className="empty-state">No transactions match your search.</p>
    );
  }

  return (
    <table className="txn-table" aria-busy={isLoading || undefined}>
      <thead>
        <tr>
          <th>Description</th>
          <th>Type</th>
          <th>Status</th>
          <th>Date</th>
          <th className="txn-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {isLoading
          ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="txn-row txn-row--skeleton">
                <td>
                  <span className="skeleton skeleton--text skeleton--w-lg" />
                </td>
                <td>
                  <span className="skeleton skeleton--text skeleton--w-sm" />
                </td>
                <td>
                  <span className="skeleton skeleton--badge" />
                </td>
                <td>
                  <span className="skeleton skeleton--text skeleton--w-md" />
                </td>
                <td className="txn-amount">
                  <span className="skeleton skeleton--text skeleton--w-md" />
                </td>
              </tr>
            ))
          : transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                isSelected={transaction.id === selectedId}
                onSelect={onSelect}
              />
            ))}
      </tbody>
    </table>
  );
}
