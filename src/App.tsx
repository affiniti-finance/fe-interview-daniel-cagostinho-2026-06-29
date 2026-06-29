import { useState } from 'react';
import { AccountSummary } from './components/AccountSummary';
import { Modal } from './components/Modal';
import { SearchBar } from './components/SearchBar';
import { TransactionDetail } from './components/TransactionDetail';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { useTransactions } from './hooks/useTransactions';
import type { Transaction } from './types';

type FormMode = { kind: 'create' } | { kind: 'edit'; id: string } | null;

export default function App() {
  const {
    isLoading,
    transactions,
    results,
    query,
    onSearch,
    statusFilter,
    onStatusFilterChange,
    typeFilter,
    onTypeFilterChange,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );

  const selected = selectedId
    ? transactions.find((t) => t.id === selectedId) ?? null
    : null;

  const editing =
    formMode?.kind === 'edit'
      ? transactions.find((t) => t.id === formMode.id) ?? null
      : null;

  const confirmingDelete = confirmingDeleteId
    ? transactions.find((t) => t.id === confirmingDeleteId) ?? null
    : null;

  const handleSelect = (transaction: Transaction) => {
    setSelectedId(transaction.id);
  };

  const handleRequestDelete = (transaction: Transaction) => {
    setConfirmingDeleteId(transaction.id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmingDeleteId) return;
    const id = confirmingDeleteId;
    await deleteTransaction(id);
    if (selectedId === id) setSelectedId(null);
    if (formMode?.kind === 'edit' && formMode.id === id) setFormMode(null);
    setConfirmingDeleteId(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setFormMode({ kind: 'edit', id: transaction.id });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Account Transactions</h1>
        <p className="account-meta">Account acct_8842 · USD</p>
      </header>

      <AccountSummary transactions={transactions} isLoading={isLoading} />

      <div className="toolbar">
        <SearchBar value={query} onChange={onSearch} />
        <select
          className="status-filter"
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(
              event.target.value as typeof statusFilter,
            )
          }
          aria-label="Filter transactions by status"
        >
          <option value="all">All statuses</option>
          <option value="posted">Posted</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
        <select
          className="status-filter"
          value={typeFilter}
          onChange={(event) =>
            onTypeFilterChange(event.target.value as typeof typeFilter)
          }
          aria-label="Filter transactions by type"
        >
          <option value="all">All types</option>
          <option value="purchase">Purchase</option>
          <option value="refund">Refund</option>
          <option value="transfer">Transfer</option>
          <option value="fee">Fee</option>
          <option value="interest">Interest</option>
        </select>
        <span className="result-count">
          {isLoading ? 'Loading…' : `${results.length} shown`}
        </span>
        <button
          type="button"
          className="button button--primary"
          onClick={() => setFormMode({ kind: 'create' })}
        >
          New transaction
        </button>
      </div>

      <div className="content">
        <TransactionList
          transactions={results}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          isLoading={isLoading}
        />
        {selected && (
          <TransactionDetail
            transaction={selected}
            onClose={() => setSelectedId(null)}
            onEdit={handleEdit}
            onDelete={handleRequestDelete}
          />
        )}
      </div>

      {formMode?.kind === 'create' && (
        <Modal title="New transaction" onClose={() => setFormMode(null)}>
          <TransactionForm
            submitLabel="Create"
            onSubmit={async (input) => {
              const created = await createTransaction(input);
              setSelectedId(created.id);
              setFormMode(null);
            }}
            onCancel={() => setFormMode(null)}
          />
        </Modal>
      )}

      {formMode?.kind === 'edit' && editing && (
        <Modal title="Edit transaction" onClose={() => setFormMode(null)}>
          <TransactionForm
            initial={editing}
            submitLabel="Save changes"
            onSubmit={async (input) => {
              await updateTransaction(editing.id, input);
              setFormMode(null);
            }}
            onCancel={() => setFormMode(null)}
          />
        </Modal>
      )}

      {confirmingDelete && (
        <Modal
          title="Delete transaction"
          onClose={() => setConfirmingDeleteId(null)}
        >
          <div className="confirm-body">
            <p>
              Delete <strong>{confirmingDelete.description}</strong>? This
              cannot be undone.
            </p>
            <div className="txn-form-actions">
              <button
                type="button"
                className="button"
                onClick={() => setConfirmingDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={handleConfirmDelete}
                autoFocus
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
