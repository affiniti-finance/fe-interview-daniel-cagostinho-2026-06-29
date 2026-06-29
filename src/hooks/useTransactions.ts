import { useEffect, useMemo, useState } from 'react';
import { debounce } from '../lib/debounce';
import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../types';

export type StatusFilter = TransactionStatus | 'all';
export type TypeFilter = TransactionType | 'all';

export type TransactionInput = Omit<Transaction, 'id'>;

export interface UseTransactions {
  /** True while the initial transactions fetch is in flight. */
  isLoading: boolean;
  /** The full account, unfiltered. */
  transactions: Transaction[];
  /** The rows that match the current search query and active filters. */
  results: Transaction[];
  /** Current value of the search box. */
  query: string;
  /** Update the search query. */
  onSearch: (value: string) => void;
  /** Current status filter selection. */
  statusFilter: StatusFilter;
  /** Update the status filter. */
  onStatusFilterChange: (value: StatusFilter) => void;
  /** Current transaction-type filter selection. */
  typeFilter: TypeFilter;
  /** Update the transaction-type filter. */
  onTypeFilterChange: (value: TypeFilter) => void;
  /** Persist a new transaction on the server and return the saved row. */
  createTransaction: (input: TransactionInput) => Promise<Transaction>;
  /** Persist edits to a transaction on the server. */
  updateTransaction: (id: string, patch: TransactionInput) => Promise<void>;
  /** Delete a transaction on the server. */
  deleteTransaction: (id: string) => Promise<void>;
}

function sortByCreatedDesc(rows: Transaction[]): Transaction[] {
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Owns the account's transactions and the description search.
 *
 * Searching is debounced so we don't re-filter on every keystroke.
 */
export function useTransactions(): UseTransactions {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  useEffect(() => {
    let active = true;
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data: Transaction[]) => {
        if (!active) return;
        setTransactions(data);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const debouncedSetQuery = useMemo(
    () => debounce((q: string) => setDebouncedQuery(q), 250),
    [],
  );

  const onSearch = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  const results = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    return transactions.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (term && !t.description.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [transactions, debouncedQuery, statusFilter, typeFilter]);

  const createTransaction = async (
    input: TransactionInput,
  ): Promise<Transaction> => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to create transaction (${res.status})`);
    const created: Transaction = await res.json();
    setTransactions((prev) => sortByCreatedDesc([created, ...prev]));
    return created;
  };

  const updateTransaction = async (
    id: string,
    patch: TransactionInput,
  ): Promise<void> => {
    const res = await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`Failed to update transaction (${res.status})`);
    const updated: Transaction = await res.json();
    setTransactions((prev) =>
      sortByCreatedDesc(prev.map((t) => (t.id === id ? updated : t))),
    );
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    const res = await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete transaction (${res.status})`);
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    isLoading,
    transactions,
    results,
    query,
    onSearch,
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    typeFilter,
    onTypeFilterChange: setTypeFilter,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
