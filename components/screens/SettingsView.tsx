'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  Boxes, 
  Users,
  Layers
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { getWarehouses, getLocations } from '@/app/actions/stock';
import { Warehouse, Location } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function SettingsView() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [whRes, locRes] = await Promise.all([
        getWarehouses(),
        getLocations(),
      ]);

      if (whRes.success && whRes.data) setWarehouses(whRes.data);
      if (locRes.success && locRes.data) setLocations(locRes.data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-stone-900">
              WAREHOUSE TOPOLOGY & SYSTEM NODES
            </h1>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-stone-200 text-stone-800 border border-stone-300">
              MULTI-NODE CONFIG
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            Configure physical warehouse facilities, internal storage zones, production racks, and virtual partner locations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          isLoading={isLoading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          REFRESH TOPOLOGY
        </Button>
      </div>

      {/* Grid: Warehouses & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Warehouses */}
        <Panel
          title="PHYSICAL WAREHOUSES"
          subtitle="Primary distribution centers & facilities"
          density="none"
        >
          <Table>
            <TableHeader>
              <tr>
                <TableHead>CODE</TableHead>
                <TableHead>FACILITY NAME</TableHead>
                <TableHead>ADDRESS</TableHead>
                <TableHead>STATUS</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {warehouses.map((wh) => (
                <TableRow key={wh.id} isInteractive={false}>
                  <TableCell isMonospace className="font-bold text-stone-900">
                    <span className="px-1.5 py-0.5 bg-stone-900 text-amber-400 font-bold text-[11px]">
                      {wh.shortCode}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-stone-900 font-mono text-xs">
                    {wh.name}
                  </TableCell>
                  <TableCell className="text-stone-600 font-mono text-[11px]">
                    {wh.address || '—'}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      ACTIVE
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        {/* Locations / Bins */}
        <Panel
          title="STORAGE BINS & VIRTUAL NODES"
          subtitle="Internal racks, staging bays, and virtual external locations"
          density="none"
        >
          <Table>
            <TableHeader>
              <tr>
                <TableHead>CODE</TableHead>
                <TableHead>LOCATION NAME</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>PARENT WAREHOUSE</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {locations.map((loc) => (
                <TableRow key={loc.id} isInteractive={false}>
                  <TableCell isMonospace className="font-bold text-stone-900">
                    {loc.shortCode}
                  </TableCell>
                  <TableCell className="font-medium text-stone-900 font-mono text-xs">
                    {loc.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={loc.type} size="sm" />
                  </TableCell>
                  <TableCell isMonospace className="text-stone-600 text-[11px]">
                    {(loc as any).Warehouse?.name || (loc.type === 'INTERNAL' ? 'Main WH' : 'External Virtual')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>

      {/* System Security & Role Architecture Info */}
      <Panel title="ACCESS CONTROL & ROW-LEVEL SECURITY (RLS)" density="compact">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-900 text-xs block mb-1">
              ROLE: INVENTORY MANAGER
            </span>
            <p className="text-[11px] text-stone-600">
              Full administrative authority over product catalogs, threshold alerts, supplier/customer master data, and warehouse locations.
            </p>
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-900 text-xs block mb-1">
              ROLE: WAREHOUSE STAFF
            </span>
            <p className="text-[11px] text-stone-600">
              Operational authorization to draft receipts, perform picking/packing verification, execute internal bin transfers, and validate stock movements.
            </p>
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-900 text-xs block mb-1">
              SECURITY: CLERK JWT ENFORCED
            </span>
            <p className="text-[11px] text-stone-600">
              All Supabase PostgreSQL database transactions verify authenticated Clerk JWT claims at the database level.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

