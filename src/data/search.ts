/** Search and screening process, from the working group's "Search Process" notes. */

export const reviewWindow = { start: 'Jul 1, 2025', end: 'Jun 30, 2026' }

export const search = {
  database: 'PubMed',
  /** Shown on the slide, one clause per line. */
  queryLines: [
    '(Visual Analytics OR Data Visualization OR Dashboard',
    '   OR data visualization[MeSH Terms])',
    'AND (Health OR Healthcare OR Medicine OR Public Health',
    '   OR primary care OR hospital OR clinical informatics)',
    'AND "2025/07/01":"2026/06/30"[Date - Publication]',
    'AND journal IN (J Biomed Inform, Appl Clin Inform,',
    '   Int J Med Inform, J Am Med Inform Assoc, JAMIA Open,',
    '   Methods Inf Med, ACI Open, Yearb Med Inform,',
    '   IEEE Trans Vis Comput Graph)',
  ],
  journals: 9,
  results: 70,
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

/** What the full-text review weighed. */
export const rubric = ['Novelty', 'Importance', 'Presentability']
