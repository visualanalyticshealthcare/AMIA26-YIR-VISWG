/** Search and screening process, from the working group's "Search Process" notes. */

export const reviewWindow = { start: 'Jul 1, 2025', end: 'Jun 30, 2026' }

/** The whole space: every visualization / dashboard paper in the window, before any health or venue filter. */
export const broadSearch = {
  query: '(Data Visualization OR Dashboard) AND "2025/07/01":"2026/06/30"[dp]',
  results: 6700,
  label: '6,700+',
}

export const search = {
  database: 'PubMed',
  /** Shown on the slide, one clause per line. */
  queryLines: [
    '(Visual Analytics OR Data Visualization OR Dashboard',
    '   OR data visualization[MeSH Terms])',
    'AND (Health OR Healthcare OR Medicine OR Public Health',
    '   OR primary care OR hospital OR clinical informatics)',
    'AND "2025/07/01":"2026/06/30"[dp]',
    'AND journal IN (JBI, ACI, IJMI, JAMIA, JAMIA Open,',
    '   MIM, ACI Open, IMIA Yearbook, IEEE TVCG)',
  ],
  journals: 9,
}

export const inclusion = [
  'Relates to visual analytics: "the science of analytical reasoning facilitated by interactive visual interfaces"',
  'Focus is on visualization / visual analytics',
  'Involves interactive visualization',
  'Relates to health care, clinical care, medicine, nursing, or similar',
]

export const exclusion = [
  'Static visualization / infographics',
  'Imaging or dashboards where the focus is mainly AI / ML',
]

export const rounds = [
  { name: 'Phase 1 · Title & abstract', detail: 'Manual include / exclude against the criteria' },
  { name: 'Phase 2 · Full text', detail: 'Read in full; select the strongest papers of the year' },
]

/** What the full-text review weighed, one sentence each. */
export const rubric = [
  {
    name: 'Novelty',
    detail: 'A genuinely new visualization technique or type of analysis, not an existing tool applied to new data.',
  },
  {
    name: 'Importance',
    detail: 'The significance of the health problem and the potential impact on care or public health.',
  },
  {
    name: 'Presentability',
    detail: 'Clear visual design backed by convincing evaluation or real-world use, worth showcasing to the field.',
  },
]
