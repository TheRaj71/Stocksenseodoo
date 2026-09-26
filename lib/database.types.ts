export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      Category: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      Contact: {
        Row: {
          active: boolean
          createdAt: string
          email: string | null
          id: string
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["ContactType"]
        }
        Insert: {
          active?: boolean
          createdAt?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["ContactType"]
        }
        Update: {
          active?: boolean
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
          active: boolean
          barcode: string | null
          capacity: number | null
          createdAt: string
          id: string
          name: string
          shortCode: string
          type: Database["public"]["Enums"]["LocationType"]
          warehouseId: string | null
        }
        Insert: {
          active?: boolean
          barcode?: string | null
          capacity?: number | null
          createdAt?: string
          id?: string
          name: string
          shortCode: string
          type?: Database["public"]["Enums"]["LocationType"]
          warehouseId?: string | null
        }
        Update: {
          active?: boolean
          barcode?: string | null
          capacity?: number | null
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
          maxQuantity: number | null
          minQuantity: number | null
          name: string
          preferredSupplierId: string | null
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
          maxQuantity?: number | null
          minQuantity?: number | null
          name: string
          preferredSupplierId?: string | null
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
          maxQuantity?: number | null
          minQuantity?: number | null
          name?: string
          preferredSupplierId?: string | null
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
            foreignKeyName: "Product_preferredSupplierId_fkey"
            columns: ["preferredSupplierId"]
            isOneToOne: false
            referencedRelation: "Contact"
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
          destLocationId: string | null
          doneDate: string | null
          id: string
          notes: string | null
          operationType: string | null
          reference: string
          responsibleId: string | null
          scheduleDate: string
          sourceLocationId: string | null
          status: Database["public"]["Enums"]["DocumentStatus"]
          type: Database["public"]["Enums"]["DocumentType"]
          validatedAt: string | null
        }
        Insert: {
          contactId?: string | null
          createdAt?: string
          destLocationId?: string | null
          doneDate?: string | null
          id?: string
          notes?: string | null
          operationType?: string | null
          reference: string
          responsibleId?: string | null
          scheduleDate: string
          sourceLocationId?: string | null
          status?: Database["public"]["Enums"]["DocumentStatus"]
          type: Database["public"]["Enums"]["DocumentType"]
          validatedAt?: string | null
        }
        Update: {
          contactId?: string | null
          createdAt?: string
          destLocationId?: string | null
          doneDate?: string | null
          id?: string
          notes?: string | null
          operationType?: string | null
          reference?: string
          responsibleId?: string | null
          scheduleDate?: string
          sourceLocationId?: string | null
          status?: Database["public"]["Enums"]["DocumentStatus"]
          type?: Database["public"]["Enums"]["DocumentType"]
          validatedAt?: string | null
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
          productId: string
          quantity: number
          reserved: number
          updatedAt: string
        }
        Insert: {
          id?: string
          locationId: string
          productId: string
          quantity?: number
          reserved?: number
          updatedAt?: string
        }
        Update: {
          id?: string
          locationId?: string
          productId?: string
          quantity?: number
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
          destLocationId: string | null
          documentId: string
          id: string
          productId: string
          quantity: number
          sourceLocationId: string | null
        }
        Insert: {
          createdAt?: string
          destLocationId?: string | null
          documentId: string
          id?: string
          productId: string
          quantity: number
          sourceLocationId?: string | null
        }
        Update: {
          createdAt?: string
          destLocationId?: string | null
          documentId?: string
          id?: string
          productId?: string
          quantity?: number
          sourceLocationId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "StockMoveLine_destLocationId_fkey"
            columns: ["destLocationId"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "StockMoveLine_sourceLocationId_fkey"
            columns: ["sourceLocationId"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
        ]
      }
      UnitOfMeasure: {
        Row: {
          abbreviation: string | null
          id: string
          name: string
          symbol: string
        }
        Insert: {
          abbreviation?: string | null
          id?: string
          name: string
          symbol: string
        }
        Update: {
          abbreviation?: string | null
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
      contact_type: "supplier" | "customer"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_type: ["supplier", "customer"],
      ContactType: ["VENDOR", "CUSTOMER"],
      DocumentStatus: ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"],
      DocumentType: ["RECEIPT", "DELIVERY", "INTERNAL_TRANSFER", "ADJUSTMENT"],
      LocationType: ["INTERNAL", "VENDOR", "CUSTOMER"],
      Role: ["ADMIN", "INVENTORY_MANAGER", "WAREHOUSE_STAFF"],
    },
  },
} as const
