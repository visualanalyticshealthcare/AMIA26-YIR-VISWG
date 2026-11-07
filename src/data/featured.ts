/**
 * The two highlighted papers, each with its own slide.
 * Bibliographic fields come from records.json; the "notable aspects" copy is written from the papers themselves.
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
    tagline: 'A public dashboard that presents untargeted wastewater sequencing results for community monitoring.',
    innovations: [
      {
        title: 'Sequencing-based monitoring',
        detail:
          'Described by the authors as the first public dashboard built on untargeted genomic sequencing rather than single-pathogen PCR, reporting on dozens of human viruses.',
      },
      {
        title: 'Three audience tiers',
        detail:
          'Trend lines and level indicators for the public, all-site aggregates for health officials, and variant and genomic detail for experts.',
      },
      {
        title: 'Reported use cases',
        detail:
          'The authors report an Mpox detection in El Paso weeks before the first clinical case, and a measles detection months before the West Texas outbreak.',
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
    tagline: 'A visual analytics system that supports embryologists in assessing embryo development from time-lapse microscopy.',
    innovations: [
      {
        title: 'Cell shape plots',
        detail:
          'Segmented cell outlines are centered, superimposed, and colored by deviation from a reference circle; symmetric cells converge to a single ring.',
      },
      {
        title: 'Uncertainty encoding',
        detail:
          'A stage timeline in which regular steps indicate consistent detection and scattered points indicate uncertainty; ring plots summarize pronuclei counts across frames.',
      },
      {
        title: 'Consistent visual encoding',
        detail:
          'Small-multiple embryo tiles with task-specific summary glyphs, and a red-gray-blue scheme for features associated with lower or higher viability.',
      },
    ],
    stats: [
      { value: '9,800', label: 'time-lapse images in the 4-embryo case study' },
      { value: '0.83', label: 'reported AUC for predicting live birth' },
      { value: '4', label: 'embryologists in the user study' },
    ],
  },
]
