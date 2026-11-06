/**
 * The literature-funnel stages. All numbers are PLACEHOLDERS: replace them with the real counts.
 * Each stage becomes one impress.js step, placed deeper (more negative z) inside the 3D funnel.
 */
export interface Stage {
  id: string
  label: string
  count: number
  description: string
  /** Short chips shown under the description (sources, criteria, ...). */
  tags?: string[]
}

export const stages: Stage[] = [
  {
    id: 'identified',
    label: 'Identified',
    count: 3200,
    description: 'Records retrieved from bibliographic databases and venue proceedings.',
    tags: ['PubMed', 'IEEE VIS', 'ACM DL', 'JAMIA / JBI', 'arXiv'],
  },
  {
    id: 'deduplicated',
    label: 'After de-duplication',
    count: 2150,
    description: 'Duplicate records across sources merged.',
  },
  {
    id: 'screened',
    label: 'Title & abstract screened',
    count: 420,
    description: 'Kept papers where visual analytics is central and the domain is health or biomedicine.',
    tags: ['Visual analytics', 'Health data', 'Evaluated system'],
  },
  {
    id: 'fulltext',
    label: 'Full-text reviewed',
    count: 96,
    description: 'Full papers assessed for novelty, rigor, and impact.',
  },
  {
    id: 'shortlist',
    label: 'Shortlisted',
    count: 24,
    description: 'Working-group discussion and voting.',
  },
  {
    id: 'selected',
    label: 'Selected',
    count: 8,
    description: 'Papers featured in this Year in Review.',
  },
]
