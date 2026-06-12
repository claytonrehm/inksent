// Renders a schema.org JSON-LD block. Structured data lets Google show rich
// results — org knowledge panel, FAQ rich snippets, and Google-for-Jobs listings —
// all free organic visibility. Server component; emits a single <script> tag.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user input is interpolated raw.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
