import { useState, type FormEvent } from 'react';
import type {
  MerchantCategory,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../types';
import type { TransactionInput } from '../hooks/useTransactions';

interface TransactionFormProps {
  initial?: Transaction;
  submitLabel: string;
  onSubmit: (input: TransactionInput) => void | Promise<void>;
  onCancel: () => void;
}

const STATUSES: TransactionStatus[] = ['posted', 'pending', 'declined'];
const TYPES: TransactionType[] = [
  'purchase',
  'refund',
  'transfer',
  'fee',
  'interest',
];
const CATEGORIES: MerchantCategory[] = [
  'groceries',
  'travel',
  'dining',
  'payroll',
  'utilities',
  'entertainment',
  'shopping',
  'health',
  'transfer',
  'income',
  'fees',
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function centsToDollarsString(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsStringToCents(value: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function localInputToIso(local: string): string {
  return new Date(local).toISOString();
}

export function TransactionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(
    initial ? centsToDollarsString(initial.amountCents) : '',
  );
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  const [status, setStatus] = useState<TransactionStatus>(
    initial?.status ?? 'posted',
  );
  const [type, setType] = useState<TransactionType>(
    initial?.type ?? 'purchase',
  );
  const [category, setCategory] = useState<MerchantCategory>(
    initial?.merchantCategory ?? 'shopping',
  );
  const [createdAt, setCreatedAt] = useState(
    initial ? isoToLocalInput(initial.createdAt) : isoToLocalInput(new Date().toISOString()),
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError('Description is required.');
      return;
    }
    if (amount.trim() === '' || Number.isNaN(Number.parseFloat(amount))) {
      setError('Amount must be a number.');
      return;
    }
    if (!createdAt) {
      setError('Date is required.');
      return;
    }
    onSubmit({
      description: trimmedDescription,
      amountCents: dollarsStringToCents(amount),
      currency: currency.trim().toUpperCase() || 'USD',
      status,
      type,
      merchantCategory: category,
      createdAt: localInputToIso(createdAt),
    });
  };

  return (
    <form className="txn-form" onSubmit={handleSubmit} noValidate>
      <label className="txn-form-field">
        <span>Description</span>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. WHOLE FOODS MARKET"
          autoFocus
          required
        />
      </label>

      <div className="txn-form-row">
        <label className="txn-form-field">
          <span>Amount</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="-12.34"
            required
          />
          <small className="txn-form-hint">
            Negative for debits, positive for credits.
          </small>
        </label>
        <label className="txn-form-field txn-form-field--narrow">
          <span>Currency</span>
          <input
            type="text"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            maxLength={3}
            required
          />
        </label>
      </div>

      <div className="txn-form-row">
        <label className="txn-form-field">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as TransactionStatus)
            }
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {capitalize(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="txn-form-field">
          <span>Type</span>
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as TransactionType)
            }
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {capitalize(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="txn-form-field">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as MerchantCategory)
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {capitalize(c)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="txn-form-field">
        <span>Date</span>
        <input
          type="datetime-local"
          value={createdAt}
          onChange={(event) => setCreatedAt(event.target.value)}
          required
        />
      </label>

      {error && (
        <p className="txn-form-error" role="alert">
          {error}
        </p>
      )}

      <div className="txn-form-actions">
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
