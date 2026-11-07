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
    tagline: 'Explainable visual analytics for one of the most consequential choices in IVF: which embryo to transfer.',
    innovations: [
      {
        title: 'Follows the clinical workflow',
        detail:
          'Five dedicated views mirror how embryologists grade: fertilization, developmental timing, morphology, blastocyst quality, and comparison.',
      },
      {
        title: 'New visual encoding',
        detail:
          'Cell shape plots superimpose centrally aligned cell outlines, color-coded by symmetry, so morphology is judged at a glance without occluding the image.',
      },
      {
        title: 'Explainable, not a black box',
        detail:
          'A classifier on human-interpretable features predicts live birth, with SHAP explanations and clinician overrides for every automated assessment.',
      },
    ],
    stats: [
      { value: '0.83', label: 'AUC for live birth (0.70 among transfer-eligible embryos)' },
      { value: '5', label: 'workflow-aligned views' },
      { value: '4', label: 'embryologists in the user study' },
    ],
  },
]
