'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeftRight, 
  Plus, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  MapPin, 
  Trash2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusStepper, DocStepStatus } from '@/components/ui/StatusStepper';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '@/components/ui/Table';
import { 
  getInternalTransfers, 
  createInternalTransfer, 
  addInternalTransferLine, 
  validateInternalTransfer, 
  getLocations 
} from '@/app/actions/stock';
import { getProducts } from '@/app/actions/products';
import { StockDocumentWithDetails, ProductWithDetails, Location } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function TransfersView() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const actionParam = searchParams.get('action');

  const [transfers, setTransfers] = useState<StockDocumentWithDetails[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<StockDocumentWithDetails | null>(null);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccessMsg, setValidationSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(actionParam === 'new');
  const [createForm, setCreateForm] = useState({
    sourceLocationId: '',
    destLocationId: '',
    scheduleDate: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
  const [lineForm, setLineForm] = useState({
    productId: '',
    quantity: 1,
  });
  const [lineError, setLineError] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [transRes, prodRes, locRes] = await Promise.all([
        getInternalTransfers(),
        getProducts(),
        getLocations(),
      ]);

      if (transRes.success && transRes.data) {
        setTransfers(transRes.data);
        if (targetId) {
          const matched = transRes.data.find((t) => t.id === targetId);
          if (matched) setSelectedTransfer(matched);
        } else if (!selectedTransfer && transRes.data.length > 0) {
          setSelectedTransfer(transRes.data[0]);
        }
      }

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
        if (!lineForm.productId && prodRes.data.length > 0) {
          setLineForm((f) => ({ ...f, productId: prodRes.data![0].id }));
        }
      }

      if (locRes.success && locRes.data) {
        const internalLocs = locRes.data.filter((l) => l.type === 'INTERNAL');
        setLocations(internalLocs);
        if (internalLocs.length >= 2) {
          if (!createForm.sourceLocationId) {
            setCreateForm((f) => ({
              ...f,
              sourceLocationId: internalLocs[0].id,
              destLocationId: internalLocs[1].id,
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error loading transfers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [targetId]);

  // Validate Transfer
  const handleValidate = async () => {
    if (!selectedTransfer) return;
    setIsValidating(true);
    setValidationSuccessMsg(null);
    try {
      const res = await validateInternalTransfer(selectedTransfer.id);
      if (res.success && res.data) {
        setValidationSuccessMsg(`Internal Transfer ${selectedTransfer.reference} committed! Stock moved between locations.`);
        loadAllData();
      } else {
        alert(res.error || 'Failed to validate transfer');
      }
    } catch (err) {
      alert('Error validating transfer');
    } finally {
      setIsValidating(false);
    }
  };

  // Create Transfer
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createForm.sourceLocationId === createForm.destLocationId) {
      alert('Source and destination locations must be different.');
      return;
    }

    try {
      const res = await createInternalTransfer({
        sourceLocationId: createForm.sourceLocationId,
        destLocationId: createForm.destLocationId,
        scheduleDate: new Date(createForm.scheduleDate).toISOString(),
        notes: createForm.notes,
      });

      if (res.success && res.data) {
        setIsCreateModalOpen(false);
        loadAllData();
        setSelectedTransfer(res.data as any);
      } else {
        alert(res.error || 'Failed to create transfer');
      }
    } catch (err) {
      alert('Error creating transfer');
    }
  };

  // Add Line
  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer) return;
    setLineError(null);

    try {
      const res = await addInternalTransferLine(selectedTransfer.id, {
        productId: lineForm.productId,
        quantity: Number(lineForm.quantity),
      });

      if (res.success) {
        setIsAddLineModalOpen(false);
        loadAllData();
      } else {
        setLineError(res.error || 'Failed to add transfer line (check stock at source)');
      }
    } catch (err) {
      setLineError('Unexpected error adding transfer item');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-stone-900">
              INTERNAL STOCK TRANSFERS
            </h1>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-stone-200 text-stone-800 border border-stone-300">
              BIN-TO-BIN RELOCATION
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            Relocate stock across bins, production lines, and quality control holding areas. Total company balance remains constant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            REFRESH
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            NEW INTERNAL TRANSFER
          </Button>
        </div>
      </div>

      {validationSuccessMsg && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">{validationSuccessMsg}</span>
          </div>
          <button onClick={() => setValidationSuccessMsg(null)}>
            <X className="w-4 h-4 text-stone-400 hover:text-stone-800" />
          </button>
        </div>
      )}

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Transfers List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {transfers.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-stone-500 bg-white border border-stone-200">
                [ NO INTERNAL TRANSFERS FOUND ]
              </div>
            ) : (
              transfers.map((t) => {
                const isSelected = selectedTransfer?.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTransfer(t);
                      setValidationSuccessMsg(null);
                    }}
                    className={`p-3 border transition-all cursor-pointer font-mono text-xs ${
                      isSelected
                        ? 'bg-white border-stone-900 border-l-[4px] border-l-stone-900 ring-1 ring-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{t.reference}</span>
                      <Badge variant={t.status} size="sm" showDot />
                    </div>

                    <div className="mt-1 text-stone-700 font-semibold text-[11px] flex items-center gap-1.5">
                      <span>{t.source_location?.name || 'Stock'}</span>
                      <ArrowLeftRight className="w-3 h-3 text-stone-400" />
                      <span>{t.destination_location?.name || 'Production'}</span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                      <span>Date: {formatDate(t.scheduleDate)}</span>
                      <span>{t.lines?.length || 0} product(s)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detail Console */}
        <div className="lg:col-span-7">
          {selectedTransfer ? (
            <Panel
              title={`TRANSFER CONSOLE: ${selectedTransfer.reference}`}
              density="none"
              statusBorder={selectedTransfer.status as any}
              action={
                selectedTransfer.status === 'DRAFT' && (
                  <Button
                    size="xs"
                    variant="primary"
                    isLoading={isValidating}
                    onClick={handleValidate}
                    disabled={(selectedTransfer.lines?.length || 0) === 0}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    VALIDATE & MOVE STOCK
                  </Button>
                )
              }
            >
              <div className="p-3 bg-stone-50 border-b border-stone-200">
                <StatusStepper currentStatus={selectedTransfer.status as DocStepStatus} />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-stone-200 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">From Location</span>
                    <span className="font-bold text-stone-900">{selectedTransfer.source_location?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">To Location</span>
                    <span className="font-bold text-stone-900">{selectedTransfer.destination_location?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Scheduled</span>
                    <span className="text-stone-900">{formatDate(selectedTransfer.scheduleDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Validated</span>
                    <span className="text-stone-900">{selectedTransfer.validatedAt ? formatDate(selectedTransfer.validatedAt, true) : 'Draft'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-stone-700">
                    ITEMS TO RELOCATE ({selectedTransfer.lines?.length || 0})
                  </span>
                  {selectedTransfer.status === 'DRAFT' && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setIsAddLineModalOpen(true)}
                      icon={<Plus className="w-3 h-3" />}
                    >
                      ADD ITEM
                    </Button>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>SKU</TableHead>
                      <TableHead>PRODUCT</TableHead>
                      <TableHead align="right">QUANTITY</TableHead>
                      <TableHead>UOM</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {(!selectedTransfer.lines || selectedTransfer.lines.length === 0) ? (
                      <TableEmptyState
                        colSpan={4}
                        message="No items added to this transfer yet. Click 'ADD ITEM' to select products."
                      />
                    ) : (
                      selectedTransfer.lines.map((line) => (
                        <TableRow key={line.id} isInteractive={false}>
                          <TableCell isMonospace className="font-bold text-stone-900">
                            <span className="px-1.5 py-0.5 bg-stone-900 text-amber-400 font-bold text-[11px]">
                              {line.Product?.sku || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-stone-900">
                            {line.Product?.name || '—'}
                          </TableCell>
                          <TableCell align="right" isMonospace className="font-bold text-stone-900 text-sm">
                            {line.quantity}
                          </TableCell>
                          <TableCell isMonospace className="text-stone-600 text-[11px]">
                            {(line.Product as any)?.UnitOfMeasure?.abbreviation || 'pcs'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Panel>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-stone-500 bg-white border border-stone-200">
              [ SELECT A TRANSFER ON THE LEFT TO VIEW DETAILS ]
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="CREATE INTERNAL STOCK TRANSFER"
        subtitle="Move items between warehouse bins"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateTransfer}>
              CREATE TRANSFER
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTransfer} className="space-y-3 font-mono text-xs">
          <Select
            label="Source Location (From) *"
            value={createForm.sourceLocationId}
            onChange={(e) => setCreateForm({ ...createForm, sourceLocationId: e.target.value })}
            required
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.shortCode}]
              </option>
            ))}
          </Select>

          <Select
            label="Destination Location (To) *"
            value={createForm.destLocationId}
            onChange={(e) => setCreateForm({ ...createForm, destLocationId: e.target.value })}
            required
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.shortCode}]
              </option>
            ))}
          </Select>

          <Input
            label="Scheduled Date & Time *"
            type="datetime-local"
            value={createForm.scheduleDate}
            onChange={(e) => setCreateForm({ ...createForm, scheduleDate: e.target.value })}
            required
          />

          <Input
            label="Internal Notes / Transfer Reason"
            placeholder="e.g. Move raw steel to Production Line B"
            value={createForm.notes}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Add Line Modal */}
      <Modal
        isOpen={isAddLineModalOpen}
        onClose={() => setIsAddLineModalOpen(false)}
        title="ADD ITEM TO TRANSFER"
        subtitle={`Transfer: ${selectedTransfer?.reference}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddLineModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddLine}>
              ADD ITEM
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLine} className="space-y-3 font-mono text-xs">
          {lineError && (
            <div className="p-2 bg-red-100 border border-red-400 text-red-800 font-semibold text-xs">
              {lineError}
            </div>
          )}

          <Select
            label="Select Product / SKU *"
            value={lineForm.productId}
            onChange={(e) => setLineForm({ ...lineForm, productId: e.target.value })}
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.sku}] {p.name} (Total: {p.stock_quantity ?? 0} {(p as any).UnitOfMeasure?.symbol || 'pcs'})
              </option>
            ))}
          </Select>

          <Input
            label="Quantity to Move *"
            type="number"
            min="1"
            value={lineForm.quantity}
            onChange={(e) => setLineForm({ ...lineForm, quantity: Number(e.target.value) })}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
