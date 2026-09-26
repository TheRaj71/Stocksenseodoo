import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                StockSense
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to StockSense
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Powerful inventory management system for multi-warehouse operations
          </p>
          
          <Show when="signed-out">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <SignUpButton mode="modal">
                <button className="rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700">
                  Get Started
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-gray-700">You're signed in! 🎉</p>
              <Link 
                href="/dashboard"
                className="rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            </div>
          </Show>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Multi-Warehouse</h3>
              <p className="text-sm text-gray-600">Manage multiple warehouses and locations</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Real-time Tracking</h3>
              <p className="text-sm text-gray-600">Track stock movements in real-time</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Complete Audit Trail</h3>
              <p className="text-sm text-gray-600">Full history of all stock operations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
