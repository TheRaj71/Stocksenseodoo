import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Sliders, 
  History, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  ScanLine,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Console Navigation */}
      <header className="h-12 bg-stone-950 border-b border-stone-800 flex items-center justify-between px-4 sm:px-6 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-sm tracking-wider text-white">
            <span className="w-2.5 h-2.5 bg-amber-500 inline-block" />
            <span>STOCKSENSE</span>
            <span className="text-[10px] text-stone-400 font-normal px-1.5 py-0.2 bg-stone-800 border border-stone-700">
              IMS OPS CONSOLE v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>POSTGRESQL &bull; RLS ONLINE</span>
          </div>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-mono font-bold tracking-wider cursor-pointer">
                SIGN IN
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 text-xs font-mono font-bold tracking-wider cursor-pointer">
                REGISTER
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 text-xs font-mono font-bold tracking-wider"
            >
              LAUNCH CONSOLE &rarr;
            </Link>
            <UserButton />
          </Show>
        </div>
      </header>

      {/* Main Console Hero */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center">
        <div className="border-2 border-stone-800 bg-stone-950 p-6 sm:p-10 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5">
              <span className="font-bold">WAREHOUSE INVENTORY SYSTEM</span> &bull; REPLACING REGISTERS & SPREADSHEETS
            </div>
            <h1 className="text-2xl sm:text-4xl font-mono font-bold uppercase tracking-tight text-white">
              HIGH-THROUGHPUT STOCK & LEDGER MANAGEMENT
            </h1>
            <p className="text-xs sm:text-sm font-mono text-stone-400 max-w-3xl leading-relaxed">
              Real-time operational terminal for inventory managers and warehouse picking/shelving staff.
              Provides atomic stock increments on vendor receipt, inventory sufficiency checks on customer dispatch,
              and immutable audit logs for every bin transfer and physical cycle count.
            </p>
          </div>

          {/* Call to Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-800">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 font-mono text-xs sm:text-sm font-bold tracking-wider flex items-center gap-2 cursor-pointer">
                  <span>LOG IN TO WORKSTATION</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-mono text-xs sm:text-sm font-bold tracking-wider cursor-pointer">
                  REQUEST ACCESS
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link href="/dashboard">
                <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 font-mono text-xs sm:text-sm font-bold tracking-wider flex items-center gap-2 cursor-pointer">
                  <span>ENTER OPERATIONS DASHBOARD</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </Show>
          </div>

          {/* Operational Module Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-stone-800">
            <div className="p-3 bg-stone-900 border border-stone-800 font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <ArrowDownLeft className="w-4 h-4" />
                <span>RECEIPTS (INBOUND)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Vendor PO matching, line item shelving, automated stock ledger increment upon validation.
              </p>
            </div>

            <div className="p-3 bg-stone-900 border border-stone-800 font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>DELIVERIES (OUTBOUND)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Customer shipment picking, stock availability validation, automatic balance reduction.
              </p>
            </div>

            <div className="p-3 bg-stone-900 border border-stone-800 font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sky-400">
                <ArrowLeftRight className="w-4 h-4" />
                <span>INTERNAL TRANSFERS</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Relocate materials between warehouse bays, production floors, and QC holding zones.
              </p>
            </div>

            <div className="p-3 bg-stone-900 border border-stone-800 font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-purple-400">
                <Sliders className="w-4 h-4" />
                <span>STOCK ADJUSTMENTS</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Physical count reconciliation with live delta calculator and discrepancy audit logging.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="h-10 bg-stone-950 border-t border-stone-800 flex items-center justify-between px-4 sm:px-6 text-[11px] font-mono text-stone-500 select-none shrink-0">
        <div>STOCKSENSE IMS &bull; BUILT FOR WAREHOUSE TEAMS</div>
        <div>TERMINAL ENCODING: UTF-8 &bull; TABULAR NUMS MONO</div>
      </footer>
    </div>
  );
}
