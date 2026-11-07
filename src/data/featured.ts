/**
 * The two most representative papers, each with its own slide.
 * Bibliographic fields come from records.json; the "why it stands out" copy is written from the papers themselves.
 * Covers are first-page renders (src/assets/papers), shown for commentary in the review.
 */
import embryoCover from '../assets/papers/embryoprofiler-cover.png'
import seqCover from '../assets/papers/seqboard-cover.png'
import { records, type PaperRecord } from './records'

export interface Innovation {
  title: string
  detail: string
}

export interface Featured {
  id: string
  record: PaperRecord
  /** Volume / issue / pages, as printed on the paper. */
  citation: string
  cover: string
  /** One-line answer to "why this paper?". */
  tagline: string
  innovations: Innovation[]
  stats: { value: string; label: string }[]
  /** Public link to the tool itself, when there is one. */
  live?: string
}

const byPmid = (pmid: number) => {
  const r = records.find((x) => x.pmid === pmid)
  if (!r) throw new Error(`PMID ${pmid} missing from records.json`)
  return r
}

export const featured: Featured[] = [
  {
    id: 'seqboard',
    record: byPmid(42243631),
    citation: '2026;33(8):1446–1456',
    cover: seqCover,
    live: 'https://dashboard.tephi.texas.gov/public-dashboard',
    tagline: 'Turns untargeted wastewater sequencing into an early-warning dashboard anyone can read.',
    innovations: [
      {
        title: 'First of its kind',
        detail:
          'The first public dashboard built on agnostic genomic sequencing instead of single-pathogen PCR, covering dozens of human viruses at once.',
      },
      {
        title: 'One dataset, three audiences',
        detail:
          'A 3-tier design: trend lines and level indicators for the public, all-site aggregates for health officials, variants and genomic context for experts.',
      },
      {
        title: 'Proven in the field',
        detail:
          'Flagged Mpox in El Paso weeks before the first clinical case, and measles months before the West Texas outbreak.',
      },
    ],
    stats: [
      { value: '15', label: 'Texas cities, 35–40 sites' },
      { value: '4,500', label: 'users by Sep 2025' },
      { value: 'Open', label: 'source code on GitHub' },
    ],
  },
  {
    id: 'embryoprofiler',
    record: byPmid(41348784),
    citation: '2026;32(1):1262–1272',
    cover: embryoCover,
    tagline: 'Visual design that lets embryologists judge embryo morphology and machine uncertainty at a glance.',
    innovations: [
      {
        title: 'Cell shape plots',
        detail:
          'A new encoding: segmented cell outlines are centered and superimposed, colored by deviation from an ideal reference circle, so a healthy embryo collapses into one clean blue ring.',
      },
      {
        title: 'Uncertainty made visible',
        detail:
          'A stair-step stage timeline where clean steps mean confident detection and scattered bright points flag doubt; ring plots show pronuclei counts across frames.',
      },
      {
        title: 'One consistent visual language',
        detail:
          'Small-multiple embryo tiles with task-specific summary glyphs and a red-gray-blue viability scheme, reinforced by background color for pre-attentive scanning.',
      },
    ],
    stats: [
      { value: '9,800', label: 'time-lapse images summarized in one 4-embryo case' },
      { value: '0.83', label: 'AUC for live birth from interpretable features' },
      { value: '4', label: 'embryologists in the user study' },
    ],
  },
]
