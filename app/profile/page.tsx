import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDashboardKPIs } from '@/app/actions/dashboard';
import { getCurrentUserFromDB } from '@/app/actions/sync-user';
import { AppShell } from '@/components/layout/AppShell';
import { ProfileView } from '@/components/screens/ProfileView';

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const [kpiRes, dbUser] = await Promise.all([
    getDashboardKPIs(),
    getCurrentUserFromDB(),
  ]);

  const kpis = kpiRes.success ? kpiRes.data : null;

  const counts = {
    pendingReceipts: kpis?.pending_receipts || 0,
    pendingDeliveries: kpis?.pending_deliveries || 0,
    internalTransfers: kpis?.internal_transfers_scheduled || 0,
    lowStock: (kpis?.low_stock_items || 0) + (kpis?.out_of_stock_items || 0),
  };

  return (
    <AppShell counts={counts}>
      <ProfileView dbUser={dbUser} />
    </AppShell>
  );
}

