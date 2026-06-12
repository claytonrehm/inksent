// schema.org structured-data builders. These power free rich results in Google:
//  - Organization/LocalBusiness → knowledge panel + local trust
//  - FAQPage                    → FAQ rich snippets under the listing
//  - JobPosting                 → free listing in the Google for Jobs widget
//                                 (notaries literally search "notary signing agent jobs")
const BASE = 'https://inksent.co'
const PHONE = '+1-619-949-3361'
const OG = `${BASE}/opengraph-image`

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${BASE}/#organization`,
  name: 'Inksent',
  alternateName: 'Inksent Signing Services',
  url: BASE,
  logo: OG,
  image: OG,
  description:
    'On-demand notary signing agent dispatch for title and escrow companies. Vetted, NNA-certified, background-checked, E&O-insured signing agents confirmed in about 30 minutes, with automatic backup if anyone cancels.',
  email: 'support@inksent.co',
  telephone: PHONE,
  priceRange: '$$',
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'San Diego County, California' },
    { '@type': 'AdministrativeArea', name: 'Riverside County, California' },
    { '@type': 'Country', name: 'United States' },
  ],
  knowsAbout: [
    'Notary signing agent',
    'Mobile notary',
    'Loan signing',
    'Real estate closings',
    'Refinance signings',
    'Title and escrow services',
  ],
  // Add social / directory profile URLs here as they're created — each is a free
  // trust + backlink signal (LinkedIn company page, Google Business Profile, etc.).
  sameAs: [] as string[],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE}/#website`,
  url: BASE,
  name: 'Inksent',
  publisher: { '@id': `${BASE}/#organization` },
}

export function faqSchema(items: readonly (readonly [string, string])[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

// Google for Jobs listing for the signing-agent recruiting funnel. Pay is stated in
// the description (a "$90 per signing" piece rate isn't a valid structured salary unit,
// so we keep it accurate in prose rather than forcing a misleading HOUR/DAY value).
export function notaryJobPostingSchema(opts: { datePosted: string; validThrough: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'Notary Signing Agent — Mobile Loan Signing (Independent Contractor)',
    description:
      '<p><strong>Inksent is hiring NNA-certified notary signing agents</strong> for mobile loan signings (purchase, refinance, HELOC, seller packages) in San Diego County and surrounding areas.</p>' +
      '<ul>' +
      '<li><strong>Pay:</strong> $90 per completed signing, paid by direct deposit after each appointment — no minimums, no membership fees.</li>' +
      '<li><strong>Jobs come to you by text:</strong> when a signing opens in a ZIP you cover, we text you the details. First to accept gets it.</li>' +
      '<li><strong>You set your own schedule and coverage area.</strong> Accept only the jobs that fit — no penalty for passing.</li>' +
      '<li><strong>Bilingual agents get more jobs.</strong></li>' +
      '</ul>' +
      '<p><strong>Requirements:</strong> a current notary commission, NNA certification (or willingness to obtain), background check, E&amp;O insurance, reliable transportation, a dual-tray printer, and a phone that receives texts.</p>' +
      '<p>Apply in about 3 minutes at inksent.co/apply.</p>',
    datePosted: opts.datePosted,
    validThrough: opts.validThrough,
    employmentType: 'CONTRACTOR',
    hiringOrganization: { '@type': 'Organization', name: 'Inksent', sameAs: BASE, logo: OG },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: 'San Diego', addressRegion: 'CA', addressCountry: 'US' },
    },
    directApply: true,
    url: `${BASE}/join`,
    industry: 'Notary / Real Estate Services',
  }
}
