/**
 * Per-paper review outcomes, generated from the working-group spreadsheet by scripts/extract_records.py.
 * Re-run that script when the spreadsheet changes; do not edit records.json by hand.
 */
import raw from './records.json'

export interface Score {
  novelty: number
  importance: number
  presentability: number
  total: number
}

export interface PaperRecord {
  pmid: number
  title: string
  authors: string
  firstAuthor: string
  journal: string
  year: number
  doi: string | null
  /** Furthest stage reached: 0 identified, 1 passed title/abstract, 2 full text scored, 3 shortlisted. */
  stage: 0 | 1 | 2 | 3
  /** Kept at title/abstract but flagged as uncertain by the reviewer. */
  uncertain: boolean
  /** Round-2 outcome for papers that passed round 1. */
  fulltext: 'scored' | 'excluded' | 'pending' | null
  score: Score | null
}

export const records = raw as PaperRecord[]

export const countAtLeast = (stage: number) => records.filter((r) => r.stage >= stage).length

/** Shortlisted papers, best score first. */
export const shortlist = records
  .filter((r) => r.stage === 3)
  .sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0))

export const byJournal = Object.entries(
  records.reduce<Record<string, number>>((acc, r) => ((acc[r.journal] = (acc[r.journal] ?? 0) + 1), acc), {}),
).sort((a, b) => b[1] - a[1])
