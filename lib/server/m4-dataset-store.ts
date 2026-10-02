import { randomBytes } from "node:crypto";
import { computeDataSet, type DataSetInput, type DataSetResult } from "../m4-dataset.ts";

// Review-session datasets, keyed by a short public id (the dataSetId that rides
// in the presentation contract). Server-side source of truth: the asprak POSTs
// raw numbers, we compute η here and hand back the id; students GET the computed
// result by id. The raw numbers never travel in the presentation state — only
// the id does — so a dropped/garbled broadcast can't corrupt the chart.
//
// In-memory and short-lived, exactly like presentation sessions: a 30-minute
// review is cheap to re-enter, so a container restart dropping datasets is an
// accepted limitation. Capacity + TTL bound memory so a stuck process can't grow
// unbounded.

export interface StoredDataSet {
  id: string;
  createdAt: number;
  result: DataSetResult;
}

const TTL_MS = 6 * 60 * 60 * 1000; // 6h — comfortably longer than a lab session
const MAX_ENTRIES = 200;           // hard cap; evict oldest beyond this
const ID_BYTES = 9;                // base64url -> 12 chars, within /^[A-Za-z0-9_-]{8,32}$/

const store = new Map<string, StoredDataSet>();

const purge = (now: number) => {
  for (const [id, entry] of store) {
    if (entry.createdAt + TTL_MS <= now) store.delete(id);
  }
  // Bound size: Map preserves insertion order, so the first keys are the oldest.
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
};

/** Store a computed dataset, returning its public id. */
export function saveDataSet(input: DataSetInput, assumptionConfirmed: boolean): StoredDataSet {
  const now = Date.now();
  purge(now);
  const id = randomBytes(ID_BYTES).toString("base64url");
  const entry: StoredDataSet = { id, createdAt: now, result: computeDataSet(input, assumptionConfirmed) };
  store.set(id, entry);
  return entry;
}

/** Fetch a dataset by id, or null if unknown/expired. */
export function getDataSet(id: string): StoredDataSet | null {
  const now = Date.now();
  const entry = store.get(id);
  if (!entry) return null;
  if (entry.createdAt + TTL_MS <= now) { store.delete(id); return null; }
  return entry;
}

/** Test-only: reset the store between cases. */
export function _clearDataSets() { store.clear(); }
