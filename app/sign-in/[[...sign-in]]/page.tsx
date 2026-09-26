import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-stone-100 font-sans">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-mono font-bold text-lg tracking-wider text-white">
          <span className="w-3 h-3 bg-amber-500 inline-block" />
          <span>STOCKSENSE</span>
          <span className="text-[10px] text-stone-400 font-normal px-1.5 py-0.5 bg-stone-800 border border-stone-700">
            WAREHOUSE TERMINAL LOGIN
          </span>
        </Link>
        <p className="mt-1 text-xs font-mono text-stone-400">
          Enter your authorized operator credentials or use OTP reset.
        </p>
      </div>

      <div className="w-full max-w-md bg-stone-900 border-2 border-stone-800 p-2 shadow-2xl">
        <SignIn
          appearance={{
            elements: {
              card: 'bg-transparent shadow-none p-4',
              headerTitle: 'text-stone-100 font-mono text-base font-bold uppercase tracking-wider',
              headerSubtitle: 'text-stone-400 font-mono text-xs',
              socialButtonsBlockButton: 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700 rounded-none font-mono text-xs',
              formButtonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs rounded-none border border-amber-700 font-bold tracking-wider',
              formFieldInput: 'bg-stone-950 border-stone-700 text-stone-100 font-mono text-xs rounded-none focus:border-amber-500',
              formFieldLabel: 'text-stone-300 font-mono text-[11px] uppercase tracking-wider',
              footerActionLink: 'text-amber-500 hover:text-amber-400 font-mono text-xs',
              identityPreviewText: 'text-stone-200 font-mono text-xs',
              identityPreviewEditButton: 'text-amber-500 font-mono text-xs',
            },
          }}
        />
      </div>

      <div className="mt-6 text-center font-mono text-[11px] text-stone-500 space-y-1">
        <div>TERMINAL ID: <span className="text-stone-400">WS-WH01-CENTRAL</span></div>
        <div>ROW LEVEL SECURITY &bull; AUDIT LEDGER ACTIVE</div>
      </div>
    </div>
  );
}
