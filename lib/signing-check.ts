import Anthropic from '@anthropic-ai/sdk'

// AI signing-package QC. Sends the loan PDF to Claude and returns a structured
// "no-miss" report: every place a signer must sign/initial/date/notarize, the
// notarization count, and anything that would get the package kicked back.
//
// Privacy: the PDF is held in memory for the single request and never stored.
// The Anthropic API does not train on API inputs.

export const SIGNING_CHECK_MODEL = 'claude-sonnet-4-6'

export function hasSigningCheck(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

export interface SignLocation {
  page: number
  who: string
  action: 'sign' | 'initial' | 'date' | 'notarize'
  document: string
}
export interface SigningIssue {
  severity: 'high' | 'medium' | 'low'
  page: number | null
  issue: string
}
export interface SigningReport {
  summary: string
  riskLevel: 'low' | 'medium' | 'high'
  totals: { signatures: number; initials: number; dates: number; notarizations: number }
  locations: SignLocation[]
  issues: SigningIssue[]
  recommendations: string[]
}

const REPORT_TOOL: Anthropic.Tool = {
  name: 'report_findings',
  description: 'Return the structured signing-package QC report.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: '1–2 sentence overview of the package and its readiness.' },
      riskLevel: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Risk that the package gets kicked back.' },
      totals: {
        type: 'object',
        properties: {
          signatures: { type: 'number' },
          initials: { type: 'number' },
          dates: { type: 'number' },
          notarizations: { type: 'number' },
        },
        required: ['signatures', 'initials', 'dates', 'notarizations'],
      },
      locations: {
        type: 'array',
        description: 'Every place a signer must act.',
        items: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            who: { type: 'string', description: 'e.g. Borrower, Co-Borrower, Seller, Notary' },
            action: { type: 'string', enum: ['sign', 'initial', 'date', 'notarize'] },
            document: { type: 'string', description: 'Name of the form/document.' },
          },
          required: ['page', 'who', 'action', 'document'],
        },
      },
      issues: {
        type: 'array',
        description: 'Problems that could cause a kickback: blank required fields, missing/likely-wrong dates, missing pages, name/date mismatches, unsigned lender sections, etc.',
        items: {
          type: 'object',
          properties: {
            severity: { type: 'string', enum: ['high', 'medium', 'low'] },
            page: { type: ['number', 'null'] },
            issue: { type: 'string' },
          },
          required: ['severity', 'page', 'issue'],
        },
      },
      recommendations: { type: 'array', items: { type: 'string' }, description: 'Concrete things the notary should double-check at the table.' },
    },
    required: ['summary', 'riskLevel', 'totals', 'locations', 'issues', 'recommendations'],
  },
}

const SYSTEM = `You are an expert loan-signing quality-control reviewer for notary signing agents. You receive a real-estate loan-closing document package (purchase, refinance, HELOC, etc.) as a PDF. Your job is to produce a precise "no-miss" report so the signing agent never misses a signature and the package never gets kicked back by the lender or title company.

Carefully scan EVERY page and identify:
- Every place the borrower, co-borrower, seller, or other party must SIGN, INITIAL, or DATE.
- Every place that requires NOTARIZATION (acknowledgment or jurat) — count these precisely; the agent needs the count for their journal.
- Problems that cause kickbacks: blank required fields, missing or likely-incorrect dates, pages that appear missing from a sequence, names that don't match across forms, lender/title sections left unsigned, and right-of-rescission dates on refinances.

Be thorough and specific (cite page numbers). When unsure, flag it as an issue rather than omit it. Then call report_findings with the structured result. Do not output prose outside the tool call.`

export async function analyzeSigningPackage(pdfBase64: string): Promise<SigningReport> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: SIGNING_CHECK_MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    tools: [REPORT_TOOL],
    tool_choice: { type: 'tool', name: 'report_findings' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          { type: 'text', text: 'Review this loan-signing package and return the structured QC report.' },
        ],
      },
    ],
  })
  const block = msg.content.find((b) => b.type === 'tool_use')
  if (!block || block.type !== 'tool_use') throw new Error('No structured report returned')
  return block.input as SigningReport
}
