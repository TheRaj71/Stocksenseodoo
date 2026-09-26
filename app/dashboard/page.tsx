import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">StockSense Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Your inventory management hub</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
            <p className="mt-2 text-3xl font-bold text-orange-600">—</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Pending Receipts</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">—</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Pending Deliveries</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">—</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
          <p className="mt-2 text-gray-600">
            The full inventory management system is being built. Features include:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Multi-warehouse & location management</li>
            <li>• Product catalog with categories & UoM</li>
            <li>• Receipts, Deliveries, Internal Transfers</li>
            <li>• Stock adjustments & complete audit trail</li>
            <li>• Real-time stock tracking with alerts</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
