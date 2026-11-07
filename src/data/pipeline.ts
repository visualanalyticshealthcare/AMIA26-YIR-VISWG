/**
 * Funnel stages, counted from the per-paper records so they always match the spreadsheet.
 * Every number is shown as "<count> papers <meaning>", so it is clear what it counts.
 */
import { byJournal, countAtLeast, records } from './records'

export interface Stage {
  id: string
  /** Short name for the stage tracker. */
  short: string
  /** Step name shown above the number. */
  label: string
  /** Minimum `PaperRecord.stage` a paper needs to still be in the funnel here. */
  minStage: number
  count: number
  /** Completes the sentence "<count> papers …". */
  meaning: string
  /** What happened to the papers coming into this step. */
  flow: string
  description: string
  chips: string[]
}

const n = (s: number) => countAtLeast(s)
const uncertain = records.filter((r) => r.uncertain).length
// The two papers with a perfect full-text score are the most representative overall.
const perfect = records.filter((r) => r.stage === 3 && r.score?.total === 9).length

export const stages: Stage[] = [
  {
    id: 'identified',
    short: 'Reviewed',
    label: 'Manual review set',
    minStage: 0,
    count: n(0),
    meaning: 'entered manual review',
    flow: `All ${n(0)} papers returned by the PubMed search`,
    description: 'Every paper was read and judged by the team, not filtered by keywords alone.',
    chips: byJournal.slice(0, 6).map(([j, c]) => `${j} · ${c}`),
  },
  {
    id: 'screened',
    short: 'Passed screening',
    label: 'Title & abstract screening',
    minStage: 1,
    count: n(1),
    meaning: 'passed title & abstract screening',
    flow: `${n(1)} of ${n(0)} kept · ${n(0) - n(1)} excluded`,
    description: 'Kept only if it is interactive visual analytics applied to health care.',
    chips: [`${uncertain} of the ${n(1)} kept as uncertain`],
  },
  {
    id: 'shortlist',
    short: 'Selected',
    label: 'Full-text review',
    minStage: 3,
    count: n(3),
    meaning: 'selected after full-text review',
    flow: `${n(3)} of ${n(1)} selected · ${perfect} most representative overall`,
    description: `The strongest papers of the year; ${perfect} of them stood out as the most representative across every dimension.`,
    chips: [`${perfect} most representative`, `${n(3) - perfect} more strong papers`],
  },
]
