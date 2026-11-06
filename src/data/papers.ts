/** The final selected papers. PLACEHOLDERS: replace with the real selections. */
export interface Paper {
  title: string
  authors: string
  venue: string
  theme: string
}

export const papers: Paper[] = Array.from({ length: 8 }, (_, i) => ({
  title: `Selected paper ${i + 1}: title goes here`,
  authors: 'First Author, et al.',
  venue: 'Venue 2026',
  theme: ['Clinical decision support', 'Population health', 'EHR cohorts', 'Genomics', 'Patient-facing', 'LLM + VA', 'Imaging', 'Evaluation'][i]!,
}))
