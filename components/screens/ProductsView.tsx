'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Boxes, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  History, 
  MapPin, 
  Edit, 
  Check, 
  X,
  Package,
  Layers
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '@/components/ui/Table';
import { StockProgressBar } from '@/components/ui/StockProgressBar';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  getCategories, 
  getUnitsOfMeasure,
  getProductStockByLocation 
} from '@/app/actions/products';
import { getProductMovementHistory, getLocations } from '@/app/actions/stock';
import { ProductWithDetails, Category, UnitOfMeasure, StockLocationQuantity, Location } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ProductsView() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter');
  const targetSku = searchParams.get('sku');

  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(targetSku || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(initialFilter === 'low_stock');

  // Selected Product Detail Drawer state
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [locationBreakdown, setLocationBreakdown] = useState<StockLocationQuantity[]>([]);
  const [moveHistory, setMoveHistory] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // New Product Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    sku: '',
    categoryId: '',
    uomId: '',
    unitCost: 0,
    minQuantity: 10,
    maxQuantity: 100,
    reorderPoint: 10,
    reorderQty: 50,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, uomRes, locRes] = await Promise.all([
        getProducts({
          category_id: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          has_low_stock: lowStockOnly,
        }),
        getCategories(),
        getUnitsOfMeasure(),
        getLocations(),
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        if (!createForm.categoryId && catRes.data.length > 0) {
          setCreateForm((f) => ({ ...f, categoryId: catRes.data![0].id }));
        }
      }
      if (uomRes.success && uomRes.data) {
        setUoms(uomRes.data);
        if (!createForm.uomId && uomRes.data.length > 0) {
          setCreateForm((f) => ({ ...f, uomId: uomRes.data![0].id }));
        }
      }
      if (locRes.success && locRes.data) {
        setLocations(locRes.data);
      }
    } catch (err) {
      console.error('Error loading products data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, lowStockOnly]);

  // Handle opening product detail
  const handleSelectProduct = async (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setIsLoadingDetails(true);
    try {
      const [stockLocRes, historyRes] = await Promise.all([
        getProductStockByLocation(product.id),
        getProductMovementHistory(product.id, 15),
      ]);

      if (stockLocRes.success && stockLocRes.data) {
        setLocationBreakdown(stockLocRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setMoveHistory(historyRes.data);
      }
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Submit create product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createForm.name || !createForm.sku) {
      setFormError('Product Name and SKU are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createProduct({
        name: createForm.name,
        sku: createForm.sku.toUpperCase().trim(),
        categoryId: createForm.categoryId,
        uomId: createForm.uomId,
        unitCost: Number(createForm.unitCost),
        minQuantity: Number(createForm.minQuantity),
        maxQuantity: Number(createForm.maxQuantity),
        reorderPoint: Number(createForm.reorderPoint),
        reorderQty: Number(createForm.reorderQty),
        active: true,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to create product');
      } else {
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          sku: '',
          categoryId: categories[0]?.id || '',
          uomId: uoms[0]?.id || '',
          unitCost: 0,
          minQuantity: 10,
          maxQuantity: 100,
          reorderPoint: 10,
          reorderQty: 50,
        });
        loadProducts();
      }
    } catch (err) {
      setFormError('Unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-stone-900">
              PRODUCT MASTER CATALOG & STOCK LEDGER
            </h1>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-stone-200 text-stone-700 border border-stone-300">
              {products.length} ITEMS
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500 mt-0.5">
            Manage SKU codes, unit costs, location stock balances, and automated reordering thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProducts}
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
            CREATE NEW SKU
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Panel density="compact">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="w-full md:w-80">
            <Input
              isMonospace
              placeholder="SEARCH NAME OR SCAN SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              rightElement={
                searchQuery && (
                  <button onClick={() => { setSearchQuery(''); loadProducts(); }}>
                    <X className="w-3.5 h-3.5 text-stone-400 hover:text-stone-700" />
                  </button>
                )
              }
            />
          </div>

          {/* Category Selector */}
          <div className="w-full md:w-56">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>

          {/* Low Stock Toggle Button */}
          <button
            type="button"
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1 text-xs font-mono font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer w-full md:w-auto ${
              lowStockOnly
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>LOW STOCK ALERT ONLY</span>
          </button>
        </div>
      </Panel>

      {/* Main Grid: Products Table + Optional Detail Panel */}
      <div className={`grid grid-cols-1 ${selectedProduct ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
        {/* Products Table Container */}
        <div className={selectedProduct ? 'lg:col-span-2' : 'col-span-1'}>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>SKU</TableHead>
                <TableHead>PRODUCT NAME</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead align="right">UNIT COST</TableHead>
                <TableHead align="right">TOTAL STOCK</TableHead>
                <TableHead>MIN / MAX</TableHead>
                <TableHead>STATUS</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableEmptyState colSpan={8} message="No products matching current filter criteria." />
              ) : (
                products.map((p) => {
                  const isLow = p.minQuantity && (p.stock_quantity ?? 0) < p.minQuantity;
                  const isOut = (p.stock_quantity ?? 0) === 0;
                  const isSelected = selectedProduct?.id === p.id;

                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={isSelected ? 'bg-amber-100/60 border-l-4 border-l-amber-600' : ''}
                    >
                      <TableCell isMonospace className="font-bold text-stone-900 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 bg-stone-900 text-amber-400 font-bold text-[11px] border border-stone-800">
                          {p.sku}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-stone-900">
                        {p.name}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-stone-600">
                        {p.Category?.name || '—'}
                      </TableCell>
                      <TableCell isMonospace className="text-stone-600 text-[11px]">
                        {p.UnitOfMeasure?.symbol || 'pcs'}
                      </TableCell>
                      <TableCell align="right" isMonospace className="text-stone-700">
                        {formatCurrency(Number(p.unitCost) || 0)}
                      </TableCell>
                      <TableCell align="right" className="min-w-[140px]">
                        <StockProgressBar
                          current={p.stock_quantity ?? 0}
                          min={p.minQuantity}
                          max={p.maxQuantity}
                          unit={p.UnitOfMeasure?.symbol || 'pcs'}
                        />
                      </TableCell>
                      <TableCell isMonospace className="text-[11px] text-stone-500">
                        {p.minQuantity ?? 0} / {p.maxQuantity ?? '—'}
                      </TableCell>
                      <TableCell>
                        {isOut ? (
                          <Badge variant="OUT_OF_STOCK" size="sm" showDot />
                        ) : isLow ? (
                          <Badge variant="LOW_STOCK" size="sm" showDot />
                        ) : (
                          <Badge variant="DONE" size="sm">
                            IN STOCK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Selected Product Detail Side Panel */}
        {selectedProduct && (
          <div className="space-y-4">
            <Panel
              title={`SKU DETAIL: ${selectedProduct.sku}`}
              density="compact"
              statusBorder={
                (selectedProduct.stock_quantity ?? 0) === 0
                  ? 'CANCELLED'
                  : selectedProduct.minQuantity && (selectedProduct.stock_quantity ?? 0) < selectedProduct.minQuantity
                  ? 'WAITING'
                  : 'DONE'
              }
              action={
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-stone-400 hover:text-stone-900 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              }
            >
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{selectedProduct.name}</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Category: {selectedProduct.Category?.name} | UOM: {selectedProduct.UnitOfMeasure?.symbol} ({selectedProduct.UnitOfMeasure?.name})
                  </p>
                </div>

                {/* Stock summary card */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-stone-50 border border-stone-200">
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Total Available</span>
                    <span className="text-lg font-bold text-stone-900">
                      {selectedProduct.stock_quantity ?? 0} {selectedProduct.UnitOfMeasure?.symbol}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-500 font-semibold block">Reorder Level</span>
                    <span className="text-lg font-bold text-amber-700">
                      Min: {selectedProduct.minQuantity || 0}
                    </span>
                  </div>
                </div>

                {/* Location Breakdown */}
                <div className="border-t border-stone-200 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      STOCK BREAKDOWN BY LOCATION
                    </span>
                  </div>

                  {locationBreakdown.length === 0 ? (
                    <div className="p-2 bg-stone-100 text-stone-500 text-[11px] text-center">
                      No stock currently allocated to internal bins.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {locationBreakdown.map((loc) => (
                        <div
                          key={loc.location_id}
                          className="flex items-center justify-between p-1.5 bg-white border border-stone-200"
                        >
                          <span className="text-stone-800 font-medium">
                            {loc.warehouse_name} / {loc.location_name}
                          </span>
                          <span className="font-bold text-stone-900">
                            {loc.quantity} {selectedProduct.UnitOfMeasure?.symbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Move History Audit Log */}
                <div className="border-t border-stone-200 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-1.5">
                    <span className="flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-stone-600" />
                      RECENT MOVEMENTS
                    </span>
                  </div>

                  {moveHistory.length === 0 ? (
                    <div className="p-2 bg-stone-100 text-stone-500 text-[11px] text-center">
                      No transactions recorded for this item yet.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {moveHistory.map((m) => (
                        <div key={m.id} className="p-1.5 bg-stone-50 border border-stone-200 text-[11px]">
                          <div className="flex items-center justify-between text-stone-700 font-semibold">
                            <span>{m.StockDocument?.reference || 'Direct Adj'}</span>
                            <span className="text-stone-900 font-bold">Qty: {m.quantity}</span>
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5 flex justify-between">
                            <span>
                              {m.source_location?.name || 'Vendor'} → {m.destination_location?.name || 'Customer'}
                            </span>
                            <span>{formatDate(m.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="REGISTER NEW PRODUCT / SKU"
        subtitle="Catalog master entry with automated threshold rules"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              CANCEL [ESC]
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateProduct}
            >
              CREATE PRODUCT [ENTER]
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProduct} className="space-y-3 font-mono text-xs">
          {formError && (
            <div className="p-2 bg-red-100 border border-red-400 text-red-800 font-semibold text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="SKU / Item Code *"
              isMonospace
              placeholder="e.g. STL-ROD-12"
              value={createForm.sku}
              onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
              required
            />

            <Input
              label="Product Name *"
              placeholder="e.g. Steel Rods 12mm Galvanized"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Product Category *"
              value={createForm.categoryId}
              onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Unit of Measure (UOM) *"
              value={createForm.uomId}
              onChange={(e) => setCreateForm({ ...createForm, uomId: e.target.value })}
            >
              {uoms.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol || u.abbreviation})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-200 pt-3">
            <Input
              label="Unit Cost ($)"
              type="number"
              step="0.01"
              value={createForm.unitCost}
              onChange={(e) => setCreateForm({ ...createForm, unitCost: Number(e.target.value) })}
            />

            <Input
              label="Min Threshold (Low Alert)"
              type="number"
              value={createForm.minQuantity}
              onChange={(e) => setCreateForm({ ...createForm, minQuantity: Number(e.target.value) })}
            />

            <Input
              label="Max Threshold (Overstock)"
              type="number"
              value={createForm.maxQuantity}
              onChange={(e) => setCreateForm({ ...createForm, maxQuantity: Number(e.target.value) })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

