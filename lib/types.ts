// Shared TypeScript types for StockSense application
import { Database } from './database.types';

// Database table types
export type Product = Database['public']['Tables']['Product']['Row'];
export type ProductInsert = Database['public']['Tables']['Product']['Insert'];
export type ProductUpdate = Database['public']['Tables']['Product']['Update'];

export type Category = Database['public']['Tables']['Category']['Row'];
export type CategoryInsert = Database['public']['Tables']['Category']['Insert'];

export type UnitOfMeasure = Database['public']['Tables']['UnitOfMeasure']['Row'];
export type UnitOfMeasureInsert = Database['public']['Tables']['UnitOfMeasure']['Insert'];

export type Warehouse = Database['public']['Tables']['Warehouse']['Row'];
export type WarehouseInsert = Database['public']['Tables']['Warehouse']['Insert'];
export type WarehouseUpdate = Database['public']['Tables']['Warehouse']['Update'];

export type Location = Database['public']['Tables']['Location']['Row'];
export type LocationInsert = Database['public']['Tables']['Location']['Insert'];
export type LocationUpdate = Database['public']['Tables']['Location']['Update'];

export type Contact = Database['public']['Tables']['Contact']['Row'];
export type ContactInsert = Database['public']['Tables']['Contact']['Insert'];
export type ContactUpdate = Database['public']['Tables']['Contact']['Update'];

export type StockDocument = Database['public']['Tables']['StockDocument']['Row'];
export type StockDocumentInsert = Database['public']['Tables']['StockDocument']['Insert'];
export type StockDocumentUpdate = Database['public']['Tables']['StockDocument']['Update'];

export type StockMoveLine = Database['public']['Tables']['StockMoveLine']['Row'];
export type StockMoveLineInsert = Database['public']['Tables']['StockMoveLine']['Insert'];
export type StockMoveLineUpdate = Database['public']['Tables']['StockMoveLine']['Update'];

export type StockItem = Database['public']['Tables']['StockItem']['Row'];
export type StockItemInsert = Database['public']['Tables']['StockItem']['Insert'];
export type StockItemUpdate = Database['public']['Tables']['StockItem']['Update'];

// Enums
export type DocumentType = Database['public']['Enums']['DocumentType'];
export type DocumentStatus = Database['public']['Enums']['DocumentStatus'];
export type ContactType = Database['public']['Enums']['ContactType'];
export type UserRole = Database['public']['Enums']['Role'];
export type LocationType = Database['public']['Enums']['LocationType'];

// Extended types with relations
export interface ProductWithDetails extends Product {
  Category?: Category | null;
  UnitOfMeasure?: UnitOfMeasure | null;
  stock_quantity?: number;
}

export interface StockDocumentWithDetails extends StockDocument {
  Contact?: Contact | null;
  source_location?: Location | null;
  destination_location?: Location | null;
  lines?: StockMoveLineWithDetails[];
}

export interface StockMoveLineWithDetails extends StockMoveLine {
  Product?: Product | null;
  source_location?: Location | null;
  destination_location?: Location | null;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter types
export interface ProductFilters {
  category_id?: string;
  search?: string; // searches name and sku
  is_active?: boolean;
  has_low_stock?: boolean;
}

export interface DocumentFilters {
  document_type?: DocumentType;
  status?: DocumentStatus;
  warehouse_id?: string;
  source_location_id?: string;
  destination_location_id?: string;
  contact_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface StockLocationQuantity {
  location_id: string;
  location_name: string;
  warehouse_name: string;
  quantity: number;
}

// Dashboard KPI types
export interface DashboardKPIs {
  total_products: number;
  total_stock_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_receipts: number;
  pending_deliveries: number;
  internal_transfers_scheduled: number;
}

// Stock alert type
export interface StockAlert {
  product_id: string;
  product_name: string;
  sku: string;
  current_quantity: number;
  min_quantity: number;
  max_quantity: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
}
