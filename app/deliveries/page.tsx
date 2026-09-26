import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDashboardKPIs } from '@/app/actions/dashboard';
import { AppShell } from '@/components/layout/AppShell';
import { DeliveriesView } from '@/components/screens/DeliveriesView';
import { Suspense } from 'react';

export default async function DeliveriesPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const kpiRes = await getDashboardKPIs();
  const kpis = kpiRes.success ? kpiRes.data : null;

  const counts = {
    pendingReceipts: kpis?.pending_receipts || 0,
    pendingDeliveries: kpis?.pending_deliveries || 0,
    internalTransfers: kpis?.internal_transfers_scheduled || 0,
    lowStock: (kpis?.low_stock_items || 0) + (kpis?.out_of_stock_items || 0),
  };

  return (
    <AppShell counts={counts}>
      <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-stone-500">LOADING DELIVERIES CONSOLE...</div>}>
        <DeliveriesView />
      </Suspense>
    </AppShell>
  );
}

