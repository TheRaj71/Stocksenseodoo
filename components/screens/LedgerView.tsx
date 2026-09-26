'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Sliders,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '@/components/ui/Table';
import { getRecentStockMovements } from '@/app/actions/dashboard';
import { getProducts } from '@/app/actions/products';
import { formatDate } from '@/lib/utils';

export function LedgerView() {
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const loadMovements = async () => {
    setIsLoading(true);
    try {
      const res = await getRecentStockMovements();
      if (res.success && res.data) {
        setMovements(res.data);
      }
    } catch (err) {
      console.error('Error loading movements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const filteredMovements = movements.filter((m) => {
    if (typeFilter !== 'ALL' && m.StockDocument?.type !== typeFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const sku = m.Product?.sku?.toLowerCase() || '';
      const name = m.Product?.name?.toLowerCase() || '';
      const ref = m.StockDocument?.reference?.toLowerCase() || '';
      return sku.includes(q) || name.includes(q) || ref.includes(q);
    }
    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Document Ref', 'Type', 'SKU', 'Product Name', 'From Location', 'To Location', 'Quantity'];
    const rows = filteredMovements.map((m) => [
      m.createdAt,
      m.StockDocument?.reference || 'Direct',
      m.StockDocument?.type || 'ADJUSTMENT',
      m.Product?.sku || '',
      `"${m.Product?.name || ''}"`,
      m.source_location?.name || 'Vendor',
      m.destination_location?.name || 'Customer',
      m.quantity,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-stone-900">
              IMMUTABLE STOCK LEDGER & AUDIT TRAIL
            </h1>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-stone-200 text-stone-800 border border-stone-300">
              {filteredMovements.length} MOVES
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            Complete sequential log of all verified stock increments, decrements, bin transfers, and cycle counts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMovements}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            REFRESH
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            EXPORT CSV LEDGER
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel density="compact">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              isMonospace
              placeholder="FILTER BY SKU, NAME, OR REF..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">ALL TRANSACTION TYPES</option>
              <option value="RECEIPT">RECEIPTS (IN)</option>
              <option value="DELIVERY">DELIVERIES (OUT)</option>
              <option value="INTERNAL_TRANSFER">TRANSFERS</option>
              <option value="ADJUSTMENT">ADJUSTMENTS</option>
            </Select>
          </div>
        </div>
      </Panel>

      {/* Ledger Table */}
      <Panel title="STOCK TRANSACTION JOURNAL" density="none">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>TIMESTAMP</TableHead>
              <TableHead>DOCUMENT REF</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>PRODUCT NAME</TableHead>
              <TableHead>SOURCE (FROM)</TableHead>
              <TableHead>DEST (TO)</TableHead>
              <TableHead align="right">QUANTITY</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableEmptyState
                colSpan={8}
                message="No stock transaction records match the filter."
              />
            ) : (
              filteredMovements.map((m) => {
                const docType = m.StockDocument?.type || 'ADJUSTMENT';
                const fromLocation = m.source_location?.name || (docType === 'RECEIPT' ? 'Vendor Intake' : '—');
                const toLocation = m.destination_location?.name || (docType === 'DELIVERY' ? 'Customer Dispatch' : '—');

                return (
                  <TableRow key={m.id} isInteractive={false}>
                    <TableCell isMonospace className="text-[11px] text-stone-500 whitespace-nowrap">
                      {formatDate(m.createdAt, true)}
                    </TableCell>
                    <TableCell isMonospace className="font-bold text-stone-900">
                      {m.StockDocument?.reference || 'ADJ-MANUAL'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={docType} size="sm" />
                    </TableCell>
                    <TableCell isMonospace className="font-bold text-stone-900">
                      <span className="px-1.5 py-0.5 bg-stone-900 text-amber-400 font-bold text-[11px]">
                        {m.Product?.sku || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-stone-900">
                      {m.Product?.name || '—'}
                    </TableCell>
                    <TableCell isMonospace className="text-[11px] text-stone-600">
                      {fromLocation}
                    </TableCell>
                    <TableCell isMonospace className="text-[11px] text-stone-600">
                      {toLocation}
                    </TableCell>
                    <TableCell align="right" isMonospace className="font-bold text-stone-900 text-sm">
                      {docType === 'DELIVERY' ? (
                        <span className="text-red-700">-{m.quantity}</span>
                      ) : docType === 'RECEIPT' ? (
                        <span className="text-emerald-700">+{m.quantity}</span>
                      ) : (
                        <span>{m.quantity}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

