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
// The two papers with a perfect full-text score are highlighted on their own slides.
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
    description: 'Each paper was reviewed manually by a student team under faculty supervision.',
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
    description: 'Included when the title and abstract met the criteria: interactive visual analytics in a health setting.',
    chips: [`${uncertain} of the ${n(1)} kept as uncertain`],
  },
  {
    id: 'shortlist',
    short: 'Selected',
    label: 'Full-text review',
    minStage: 3,
    count: n(3),
    meaning: 'selected after full-text review',
    flow: `${n(3)} of ${n(1)} selected · ${perfect} highlighted on the next slides`,
    description: "Chosen by the review team after reading the full text. The selection reflects the team's judgment, not a ranking of the field.",
    chips: [`${perfect} highlighted`, `${n(3) - perfect} other selected papers`],
  },
]
