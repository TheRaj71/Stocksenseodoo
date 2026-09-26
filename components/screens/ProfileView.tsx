'use client';

import React from 'react';
import { User, Shield, Key, Mail, Building, LogOut, CheckCircle2 } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ProfileViewProps {
  dbUser?: any;
}

export function ProfileView({ dbUser }: ProfileViewProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const role = dbUser?.role || user?.publicMetadata?.role || 'WAREHOUSE_STAFF';

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-stone-300">
        <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-stone-900">
          OPERATOR WORKSTATION PROFILE
        </h1>
        <p className="text-xs font-mono text-stone-500 mt-0.5">
          Active session identity and permissions assigned across the StockSense system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Card */}
        <div className="md:col-span-1 space-y-3">
          <Panel title="AUTHENTICATED IDENTITY" density="compact">
            <div className="space-y-3 font-mono text-xs">
              <div className="w-16 h-16 bg-stone-900 text-amber-400 font-mono font-bold text-xl flex items-center justify-center border-2 border-stone-800">
                {user?.firstName ? user.firstName.charAt(0) : 'OP'}
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  {user?.fullName || dbUser?.name || 'Warehouse Operator'}
                </h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress || dbUser?.email}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <span className="text-[10px] uppercase text-stone-500 font-semibold block mb-1">
                  ASSIGNED SYSTEM ROLE
                </span>
                <Badge variant={role === 'ADMIN' ? 'OVERSTOCK' : 'READY'} size="sm">
                  {String(role).replace('_', ' ')}
                </Badge>
              </div>

              <Button
                variant="danger"
                size="sm"
                className="w-full mt-4"
                onClick={() => signOut({ redirectUrl: '/sign-in' })}
                icon={<LogOut className="w-3.5 h-3.5" />}
              >
                SIGN OUT OF SESSION
              </Button>
            </div>
          </Panel>
        </div>

        {/* Permissions & DB Sync Status */}
        <div className="md:col-span-2 space-y-4">
          <Panel title="DATABASE SYNCHRONIZATION STATUS" density="compact">
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-300 text-emerald-900">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  POSTGRESQL RLS SESSION ACTIVE
                </span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 font-bold">
                  SYNCED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                <div className="p-2 bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">CLERK USER ID:</span>
                  <span className="font-bold text-stone-900 truncate block">{user?.id || '—'}</span>
                </div>
                <div className="p-2 bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">INTERNAL DB ID:</span>
                  <span className="font-bold text-stone-900 truncate block">{dbUser?.id || '—'}</span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="ROLE CAPABILITIES MATRIX" density="none">
            <div className="divide-y divide-stone-200 font-mono text-xs">
              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">Draft Receipts & Deliveries</span>
                  <span className="text-[11px] text-stone-500">Create inbound and outbound order documents</span>
                </div>
                <Badge variant="DONE" size="sm">PERMITTED</Badge>
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">Validate Stock Movements</span>
                  <span className="text-[11px] text-stone-500">Commit physical receipts/shipments to ledger</span>
                </div>
                <Badge variant="DONE" size="sm">PERMITTED</Badge>
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">Cycle Counts & Stock Adjustments</span>
                  <span className="text-[11px] text-stone-500">Correct bin inventory balances</span>
                </div>
                <Badge variant="DONE" size="sm">PERMITTED</Badge>
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">Modify Product Catalog & SKU Rules</span>
                  <span className="text-[11px] text-stone-500">Add or deactivate SKUs, edit reorder thresholds</span>
                </div>
                <Badge variant={role === 'WAREHOUSE_STAFF' ? 'WAITING' : 'DONE'} size="sm">
                  {role === 'WAREHOUSE_STAFF' ? 'MANAGER ONLY' : 'PERMITTED'}
                </Badge>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

