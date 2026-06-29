import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { seedTransactions } from '../src/data/seed';
import type { Transaction } from '../src/types';

export const app = express();

app.use(express.json());

let transactions: Transaction[] = [...seedTransactions];

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isValidInput(body: unknown): body is Omit<Transaction, 'id'> {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.description === 'string' &&
    typeof b.amountCents === 'number' &&
    typeof b.currency === 'string' &&
    typeof b.status === 'string' &&
    typeof b.type === 'string' &&
    typeof b.merchantCategory === 'string' &&
    typeof b.createdAt === 'string'
  );
}

app.get('/api/transactions', async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  if (!isValidInput(req.body)) {
    res.status(400).json({ error: 'Invalid transaction body' });
    return;
  }
  const created: Transaction = { ...req.body, id: generateId() };
  transactions = [created, ...transactions];
  res.status(201).json(created);
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const exists = transactions.some((t) => t.id === id);
  if (!exists) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }
  if (!isValidInput(req.body)) {
    res.status(400).json({ error: 'Invalid transaction body' });
    return;
  }
  const updated: Transaction = { ...req.body, id };
  transactions = transactions.map((t) => (t.id === id ? updated : t));
  res.json(updated);
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const exists = transactions.some((t) => t.id === id);
  if (!exists) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }
  transactions = transactions.filter((t) => t.id !== id);
  res.status(204).end();
});

app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
  }),
);
