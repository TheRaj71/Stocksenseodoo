export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Category: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Contact: {
        Row: {
          createdAt: string
          email: string | null
          id: string
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["ContactType"]
        }
        Insert: {
          createdAt?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["ContactType"]
        }
        Update: {
          createdAt?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["ContactType"]
        }
        Relationships: []
      }
      Location: {
        Row: {
          createdAt: string
          id: string
          name: string
          shortCode: string
          type: Database["public"]["Enums"]["LocationType"]
          warehouseId: string | null
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          shortCode: string
          type?: Database["public"]["Enums"]["LocationType"]
          warehouseId?: string | null
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          shortCode?: string
          type?: Database["public"]["Enums"]["LocationType"]
          warehouseId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Location_warehouseId_fkey"
            columns: ["warehouseId"]
            isOneToOne: false
            referencedRelation: "Warehouse"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          active: boolean
          categoryId: string
          createdAt: string
          id: string
          name: string
          reorderPoint: number
          reorderQty: number
          sku: string
          unitCost: number
          uomId: string
        }
        Insert: {
          active?: boolean
          categoryId: string
          createdAt?: string
          id?: string
          name: string
          reorderPoint?: number
          reorderQty?: number
          sku: string
          unitCost?: number
          uomId: string
        }
        Update: {
          active?: boolean
          categoryId?: string
          createdAt?: string
          id?: string
          name?: string
          reorderPoint?: number
          reorderQty?: number
          sku?: string
          unitCost?: number
          uomId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Product_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Product_uomId_fkey"
            columns: ["uomId"]
            isOneToOne: false
            referencedRelation: "UnitOfMeasure"
            referencedColumns: ["id"]
          },
        ]
      }
      StockDocument: {
        Row: {
          contactId: string | null
          createdAt: string
          destLocationId: string
          doneDate: string | null
          id: string
          notes: string | null
          operationType: string | null
          reference: string
          responsibleId: string | null
          scheduleDate: string
          sourceLocationId: string
          status: Database["public"]["Enums"]["DocumentStatus"]
          type: Database["public"]["Enums"]["DocumentType"]
        }
        Insert: {
          contactId?: string | null
          createdAt?: string
          destLocationId: string
          doneDate?: string | null
          id?: string
          notes?: string | null
          operationType?: string | null
          reference: string
          responsibleId?: string | null
          scheduleDate: string
          sourceLocationId: string
          status?: Database["public"]["Enums"]["DocumentStatus"]
          type: Database["public"]["Enums"]["DocumentType"]
        }
        Update: {
          contactId?: string | null
          createdAt?: string
          destLocationId?: string
          doneDate?: string | null
          id?: string
          notes?: string | null
          operationType?: string | null
          reference?: string
          responsibleId?: string | null
          scheduleDate?: string
          sourceLocationId?: string
          status?: Database["public"]["Enums"]["DocumentStatus"]
          type?: Database["public"]["Enums"]["DocumentType"]
        }
        Relationships: [
          {
            foreignKeyName: "StockDocument_contactId_fkey"
            columns: ["contactId"]
            isOneToOne: false
            referencedRelation: "Contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockDocument_destLocationId_fkey"
            columns: ["destLocationId"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockDocument_responsibleId_fkey"
            columns: ["responsibleId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockDocument_sourceLocationId_fkey"
            columns: ["sourceLocationId"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
        ]
      }
      StockItem: {
        Row: {
          id: string
          locationId: string
          onHand: number
          productId: string
          reserved: number
          updatedAt: string
        }
        Insert: {
          id?: string
          locationId: string
          onHand?: number
          productId: string
          reserved?: number
          updatedAt?: string
        }
        Update: {
          id?: string
          locationId?: string
          onHand?: number
          productId?: string
          reserved?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "StockItem_locationId_fkey"
            columns: ["locationId"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockItem_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      StockMoveLine: {
        Row: {
          createdAt: string
          documentId: string
          id: string
          productId: string
          quantity: number
        }
        Insert: {
          createdAt?: string
          documentId: string
          id?: string
          productId: string
          quantity: number
        }
        Update: {
          createdAt?: string
          documentId?: string
          id?: string
          productId?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "StockMoveLine_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "StockDocument"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockMoveLine_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      UnitOfMeasure: {
        Row: {
          id: string
          name: string
          symbol: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          clerkId: string | null
          createdAt: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["Role"]
        }
        Insert: {
          clerkId?: string | null
          createdAt?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["Role"]
        }
        Update: {
          clerkId?: string | null
          createdAt?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["Role"]
        }
        Relationships: []
      }
      Warehouse: {
        Row: {
          address: string | null
          createdAt: string
          id: string
          name: string
          shortCode: string
        }
        Insert: {
          address?: string | null
          createdAt?: string
          id?: string
          name: string
          shortCode: string
        }
        Update: {
          address?: string | null
          createdAt?: string
          id?: string
          name?: string
          shortCode?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ContactType: "VENDOR" | "CUSTOMER"
      DocumentStatus: "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELLED"
      DocumentType: "RECEIPT" | "DELIVERY" | "INTERNAL_TRANSFER" | "ADJUSTMENT"
      LocationType: "INTERNAL" | "VENDOR" | "CUSTOMER"
      Role: "ADMIN" | "INVENTORY_MANAGER" | "WAREHOUSE_STAFF"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
