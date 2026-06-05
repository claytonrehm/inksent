import TwilioTest from './TwilioTest'

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center">{n}</div>
      <div className="pb-8 border-b border-gray-100 w-full">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-600 space-y-2">{children}</div>
      </div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-gray-100 text-violet-700 px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>
}

export default function SetupPage() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrations Setup</h1>
      <p className="text-gray-500 text-sm mb-10">Complete these steps to activate SMS dispatch and invoice emails.</p>

      <div className="space-y-0">
        {/* Twilio */}
        <div className="mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Twilio — SMS Dispatch</p>
        </div>
        <Step n={1} title="Create a Twilio account">
          <p>Go to <strong>twilio.com</strong> and sign up for a free account. No credit card needed to start — free trial includes $15 credit.</p>
        </Step>
        <Step n={2} title="Get a phone number">
          <p>In Twilio Console → Phone Numbers → Buy a Number. Search for a local or toll-free number. Cost: ~$1/month.</p>
          <p>Copy the number in E.164 format, e.g. <Code>+16195550100</Code></p>
        </Step>
        <Step n={3} title="Copy your credentials">
          <p>From your Twilio Console dashboard, copy:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong>Account SID</strong> — starts with <Code>AC</Code></li>
            <li><strong>Auth Token</strong> — click the eye icon to reveal</li>
          </ul>
        </Step>
        <Step n={4} title="Update your .env.local">
          <p>Open <Code>~/notary-dispatch/.env.local</Code> and replace the placeholder values:</p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono mt-2 overflow-x-auto">{`TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1xxxxxxxxxx`}</pre>
          <p className="text-gray-500 mt-2">Restart your dev server after saving (<Code>npm run dev</Code>).</p>
        </Step>
        <Step n={5} title="Send a test SMS">
          <p>Use the button below to verify everything is wired up:</p>
          <TwilioTest />
        </Step>

        {/* Resend */}
        <div className="mt-6 mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Resend — Invoice Emails</p>
        </div>
        <Step n={6} title="Create a Resend account">
          <p>Go to <strong>resend.com</strong> — free up to 3,000 emails/month. Sign up and create an API key.</p>
        </Step>
        <Step n={7} title="Add your domain">
          <p>In Resend → Domains → Add Domain, enter <strong>inksent.co</strong>. Resend gives you DNS records to add in Cloudflare. Takes 5 minutes.</p>
          <p className="text-gray-500">Until the domain is verified, Resend can only send to your own email address (fine for testing).</p>
        </Step>
        <Step n={8} title="Add API key to .env.local">
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono mt-2">{`RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx`}</pre>
        </Step>

        {/* When deployed */}
        <div className="mt-6 mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">When you deploy to Vercel</p>
        </div>
        <Step n={9} title="Add env vars to Vercel">
          <p>Go to your Vercel project → Settings → Environment Variables. Add every value from your <Code>.env.local</Code> file. The app won&apos;t send SMS or email in production until these are set.</p>
          <p className="mt-2">Also update: <Code>NEXT_PUBLIC_BASE_URL=https://inksent.co</Code></p>
        </Step>
      </div>
    </div>
  )
}
