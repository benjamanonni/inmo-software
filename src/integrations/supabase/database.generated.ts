
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "account_clients": {
                  Row: {
                    "account_id": string,"client_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "account_id": string,"client_id": number
                  }
                  Update: {
                    "account_id"?: string,"client_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "account_clients_account_id_fkey"
      columns: ["account_id"]
isOneToOne: false
      referencedRelation: "accounts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "account_clients_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id"]
    }
                  ]
                },"accounts": {
                  Row: {
                    "enabled": boolean,"id": string,"role": string
                  }
                  ComputedFields: never
                  Insert: {
                    "enabled"?: boolean,"id": string,"role": string
                  }
                  Update: {
                    "enabled"?: boolean,"id"?: string,"role"?: string
                  }
                  Relationships: [
                    
                  ]
                },"clients": {
                  Row: {
                    "created_at": string,"email": string,"id": number,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: number,"name": string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: number,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"contract_clients": {
                  Row: {
                    "client_id": number,"contract_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "client_id": number,"contract_id": number
                  }
                  Update: {
                    "client_id"?: number,"contract_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "contract_clients_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "contract_clients_contract_id_fkey"
      columns: ["contract_id"]
isOneToOne: false
      referencedRelation: "contracts"
      referencedColumns: ["id"]
    }
                  ]
                },"contract_lots": {
                  Row: {
                    "contract_id": number,"lot_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "contract_id": number,"lot_id": string
                  }
                  Update: {
                    "contract_id"?: number,"lot_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "contract_lots_contract_id_fkey"
      columns: ["contract_id"]
isOneToOne: false
      referencedRelation: "contracts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "contract_lots_lot_id_fkey"
      columns: ["lot_id"]
isOneToOne: false
      referencedRelation: "lots"
      referencedColumns: ["id"]
    }
                  ]
                },"contracts": {
                  Row: {
                    "currency": string,"demo_scenario": boolean,"deposit": number,"id": number,"reference": string,"signed_on": string,"total": number
                  }
                  ComputedFields: never
                  Insert: {
                    "currency": string,"demo_scenario"?: boolean,"deposit": number,"id"?: number,"reference": string,"signed_on": string,"total": number
                  }
                  Update: {
                    "currency"?: string,"demo_scenario"?: boolean,"deposit"?: number,"id"?: number,"reference"?: string,"signed_on"?: string,"total"?: number
                  }
                  Relationships: [
                    
                  ]
                },"installments": {
                  Row: {
                    "amount": number,"demo_state": string,"due_on": string,"id": number,"number": number,"plan_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"demo_state"?: string,"due_on": string,"id"?: number,"number": number,"plan_id": number
                  }
                  Update: {
                    "amount"?: number,"demo_state"?: string,"due_on"?: string,"id"?: number,"number"?: number,"plan_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "installments_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                },"lots": {
                  Row: {
                    "area": number | null,"block": string | null,"demo_state": string,"id": string,"property_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "area"?: number | null,"block"?: string | null,"demo_state": string,"id": string,"property_id": string
                  }
                  Update: {
                    "area"?: number | null,"block"?: string | null,"demo_state"?: string,"id"?: string,"property_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lots_property_id_fkey"
      columns: ["property_id"]
isOneToOne: false
      referencedRelation: "properties"
      referencedColumns: ["id"]
    }
                  ]
                },"payment_allocations": {
                  Row: {
                    "amount": number,"installment_id": number,"payment_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"installment_id": number,"payment_id": number
                  }
                  Update: {
                    "amount"?: number,"installment_id"?: number,"payment_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_allocations_installment_id_fkey"
      columns: ["installment_id"]
isOneToOne: false
      referencedRelation: "installments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payment_allocations_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                },"payment_events": {
                  Row: {
                    "actor": string,"after_value": NonNullable<Json>,"before_value": Json | null,"created_at": string,"id": string,"operation": string,"payment_id": number,"reason": string,"request_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor": string,"after_value": NonNullable<Json>,"before_value"?: Json | null,"created_at"?: string,"id"?: string,"operation": string,"payment_id": number,"reason": string,"request_id": string
                  }
                  Update: {
                    "actor"?: string,"after_value"?: NonNullable<Json>,"before_value"?: Json | null,"created_at"?: string,"id"?: string,"operation"?: string,"payment_id"?: number,"reason"?: string,"request_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_events_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "actor": string,"amount": number,"contract_id": number,"created_at": string,"id": number,"method": string,"paid_on": string,"request_id": string,"voided": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "actor": string,"amount": number,"contract_id": number,"created_at"?: string,"id"?: number,"method": string,"paid_on": string,"request_id": string,"voided"?: boolean
                  }
                  Update: {
                    "actor"?: string,"amount"?: number,"contract_id"?: number,"created_at"?: string,"id"?: number,"method"?: string,"paid_on"?: string,"request_id"?: string,"voided"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_contract_id_fkey"
      columns: ["contract_id"]
isOneToOne: false
      referencedRelation: "contracts"
      referencedColumns: ["id"]
    }
                  ]
                },"plans": {
                  Row: {
                    "contract_id": number,"created_at": string,"id": number,"label": string
                  }
                  ComputedFields: never
                  Insert: {
                    "contract_id": number,"created_at"?: string,"id"?: number,"label": string
                  }
                  Update: {
                    "contract_id"?: number,"created_at"?: string,"id"?: number,"label"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plans_contract_id_fkey"
      columns: ["contract_id"]
isOneToOne: false
      referencedRelation: "contracts"
      referencedColumns: ["id"]
    }
                  ]
                },"properties": {
                  Row: {
                    "created_at": string,"description": string,"id": string,"operation": string,"published": boolean,"subtitle": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description": string,"id": string,"operation": string,"published"?: boolean,"subtitle"?: string,"title": string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string,"id"?: string,"operation"?: string,"published"?: boolean,"subtitle"?: string,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"property_photos": {
                  Row: {
                    "alt": string,"id": string,"object_path": string | null,"position": number,"property_id": string,"reference_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt": string,"id"?: string,"object_path"?: string | null,"position"?: number,"property_id": string,"reference_url"?: string | null
                  }
                  Update: {
                    "alt"?: string,"id"?: string,"object_path"?: string | null,"position"?: number,"property_id"?: string,"reference_url"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "property_photos_property_id_fkey"
      columns: ["property_id"]
isOneToOne: false
      referencedRelation: "properties"
      referencedColumns: ["id"]
    }
                  ]
                },"receipts": {
                  Row: {
                    "created_at": string,"id": string,"mime_type": string,"object_path": string,"payment_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"mime_type": string,"object_path": string,"payment_id": number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"mime_type"?: string,"object_path"?: string,"payment_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "receipts_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "provision_buyer_link":
{ Args: { "p_account": string,"p_client": number }; Returns: undefined
                           },
"register_payment":
{ Args: { "p_allocations": Json,"p_amount": number,"p_contract": number,"p_method": string,"p_paid_on": string,"p_request": string }; Returns: number
                           },
"set_account_enabled":
{ Args: { "p_account": string,"p_enabled": boolean }; Returns: undefined
                           },
"void_payment":
{ Args: { "p_payment": number,"p_reason": string,"p_request": string }; Returns: string
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
