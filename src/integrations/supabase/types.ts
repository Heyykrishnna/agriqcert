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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_attachments: {
        Row: {
          batch_id: string
          created_at: string
          file_hash: string | null
          filename: string
          id: string
          type: string
          url: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          file_hash?: string | null
          filename: string
          id?: string
          type: string
          url: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          file_hash?: string | null
          filename?: string
          id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_attachments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_inquiries: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          importer_id: string
          inquiry_type: string
          message: string | null
          quantity_requested: number | null
          response: string | null
          status: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          importer_id: string
          inquiry_type: string
          message?: string | null
          quantity_requested?: number | null
          response?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          importer_id?: string
          inquiry_type?: string
          message?: string | null
          quantity_requested?: number | null
          response?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_inquiries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          created_at: string
          destination_country: string
          expected_ship_date: string | null
          exporter_id: string
          harvest_date: string
          id: string
          origin_address: string | null
          origin_country: string
          origin_lat: number | null
          origin_lon: number | null
          origin_state: string | null
          packaging_type: string | null
          product_type: string
          quantity: number
          status: string
          tracking_token: string
          updated_at: string
          variety: string | null
          weight_unit: string
        }
        Insert: {
          created_at?: string
          destination_country: string
          expected_ship_date?: string | null
          exporter_id: string
          harvest_date: string
          id?: string
          origin_address?: string | null
          origin_country: string
          origin_lat?: number | null
          origin_lon?: number | null
          origin_state?: string | null
          packaging_type?: string | null
          product_type: string
          quantity: number
          status?: string
          tracking_token: string
          updated_at?: string
          variety?: string | null
          weight_unit: string
        }
        Update: {
          created_at?: string
          destination_country?: string
          expected_ship_date?: string | null
          exporter_id?: string
          harvest_date?: string
          id?: string
          origin_address?: string | null
          origin_country?: string
          origin_lat?: number | null
          origin_lon?: number | null
          origin_state?: string | null
          packaging_type?: string | null
          product_type?: string
          quantity?: number
          status?: string
          tracking_token?: string
          updated_at?: string
          variety?: string | null
          weight_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_exporter_id_fkey"
            columns: ["exporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_share_access: {
        Row: {
          access_ip: string | null
          accessed_at: string
          accessed_by_email: string | null
          document_id: string
          id: string
          user_agent: string | null
        }
        Insert: {
          access_ip?: string | null
          accessed_at?: string
          accessed_by_email?: string | null
          document_id: string
          id?: string
          user_agent?: string | null
        }
        Update: {
          access_ip?: string | null
          accessed_at?: string
          accessed_by_email?: string | null
          document_id?: string
          id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_share_access_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "profile_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tags: {
        Row: {
          created_at: string
          document_id: string
          id: string
          tag_name: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          tag_name: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "profile_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string
          document_id: string
          file_size: number | null
          file_url: string
          id: string
          notes: string | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          document_id: string
          file_size?: number | null
          file_url: string
          id?: string
          notes?: string | null
          uploaded_by?: string | null
          version_number: number
        }
        Update: {
          created_at?: string
          document_id?: string
          file_size?: number | null
          file_url?: string
          id?: string
          notes?: string | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "profile_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_certifications: {
        Row: {
          attachment_url: string | null
          batch_id: string
          certificate_number: string | null
          certification_name: string
          certification_type: string
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string
          issuer: string
          scope: string | null
          standards: string[] | null
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          batch_id: string
          certificate_number?: string | null
          certification_name: string
          certification_type: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuer: string
          scope?: string | null
          standards?: string[] | null
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          batch_id?: string
          certificate_number?: string | null
          certification_name?: string
          certification_type?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          scope?: string | null
          standards?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_certifications_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_attachments: {
        Row: {
          created_at: string
          filename: string
          id: string
          inspection_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          inspection_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          inspection_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_attachments_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          batch_id: string
          comments: string | null
          completed_date: string | null
          conclusion: string | null
          created_at: string
          exporter_id: string | null
          id: string
          inspector_id: string | null
          iso_codes: string[] | null
          moisture_percent: number | null
          organic_status: string | null
          qa_agency_id: string
          scheduled_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          comments?: string | null
          completed_date?: string | null
          conclusion?: string | null
          created_at?: string
          exporter_id?: string | null
          id?: string
          inspector_id?: string | null
          iso_codes?: string[] | null
          moisture_percent?: number | null
          organic_status?: string | null
          qa_agency_id: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          comments?: string | null
          completed_date?: string | null
          conclusion?: string | null
          created_at?: string
          exporter_id?: string | null
          id?: string
          inspector_id?: string | null
          iso_codes?: string[] | null
          moisture_percent?: number | null
          organic_status?: string | null
          qa_agency_id?: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_exporter_id_fkey"
            columns: ["exporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_qa_agency_id_fkey"
            columns: ["qa_agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_analytics: {
        Row: {
          average_price: number | null
          created_at: string
          demand_trend: string | null
          id: string
          max_price: number | null
          min_price: number | null
          product_type: string
          recorded_date: string
          region: string
          total_volume: number | null
        }
        Insert: {
          average_price?: number | null
          created_at?: string
          demand_trend?: string | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          product_type: string
          recorded_date?: string
          region: string
          total_volume?: number | null
        }
        Update: {
          average_price?: number | null
          created_at?: string
          demand_trend?: string | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          product_type?: string
          recorded_date?: string
          region?: string
          total_volume?: number | null
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          availability_status: string
          batch_id: string
          created_at: string
          currency: string
          discount_percentage: number | null
          id: string
          market_rate: number | null
          minimum_order_quantity: number | null
          msp: number | null
          negotiable: boolean | null
          price_per_unit: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          availability_status?: string
          batch_id: string
          created_at?: string
          currency?: string
          discount_percentage?: number | null
          id?: string
          market_rate?: number | null
          minimum_order_quantity?: number | null
          msp?: number | null
          negotiable?: boolean | null
          price_per_unit: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          availability_status?: string
          batch_id?: string
          created_at?: string
          currency?: string
          discount_percentage?: number | null
          id?: string
          market_rate?: number | null
          minimum_order_quantity?: number | null
          msp?: number | null
          negotiable?: boolean | null
          price_per_unit?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      pesticide_results: {
        Row: {
          created_at: string
          id: string
          inspection_id: string
          name: string
          ppm: number
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_id: string
          name: string
          ppm: number
        }
        Update: {
          created_at?: string
          id?: string
          inspection_id?: string
          name?: string
          ppm?: number
        }
        Relationships: [
          {
            foreignKeyName: "pesticide_results_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          encrypted: boolean | null
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          metadata: Json | null
          mime_type: string | null
          notification_sent: boolean | null
          share_created_at: string | null
          share_expires_at: string | null
          shared_link_token: string | null
          shared_with_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          encrypted?: boolean | null
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          notification_sent?: boolean | null
          share_created_at?: string | null
          share_expires_at?: string | null
          shared_link_token?: string | null
          shared_with_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          encrypted?: boolean | null
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          notification_sent?: boolean | null
          share_created_at?: string | null
          share_expires_at?: string | null
          shared_link_token?: string | null
          shared_with_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      soil_tests: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          lab_name: string | null
          moisture_percent: number | null
          nitrogen_ppm: number | null
          notes: string | null
          organic_matter_percent: number | null
          ph_level: number | null
          phosphorus_ppm: number | null
          potassium_ppm: number | null
          salinity_ds_m: number | null
          test_date: string
          texture: string | null
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          lab_name?: string | null
          moisture_percent?: number | null
          nitrogen_ppm?: number | null
          notes?: string | null
          organic_matter_percent?: number | null
          ph_level?: number | null
          phosphorus_ppm?: number | null
          potassium_ppm?: number | null
          salinity_ds_m?: number | null
          test_date: string
          texture?: string | null
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          lab_name?: string | null
          moisture_percent?: number | null
          nitrogen_ppm?: number | null
          notes?: string | null
          organic_matter_percent?: number | null
          ph_level?: number | null
          phosphorus_ppm?: number | null
          potassium_ppm?: number | null
          salinity_ds_m?: number | null
          test_date?: string
          texture?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "soil_tests_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      sustainable_practices: {
        Row: {
          batch_id: string
          created_at: string
          description: string | null
          id: string
          impact_metrics: Json | null
          implementation_date: string | null
          practice_name: string
          practice_type: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          description?: string | null
          id?: string
          impact_metrics?: Json | null
          implementation_date?: string | null
          practice_name: string
          practice_type: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          description?: string | null
          id?: string
          impact_metrics?: Json | null
          implementation_date?: string | null
          practice_name?: string
          practice_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sustainable_practices_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verifiable_credentials: {
        Row: {
          batch_id: string
          blockchain_anchored_at: string | null
          blockchain_block_number: number | null
          blockchain_network: string | null
          blockchain_tx_hash: string | null
          created_at: string
          credential_hash: string | null
          credential_json: Json
          holder_id: string
          id: string
          inspection_id: string
          issued_at: string
          issuer_did: string
          qr_token: string
          revocation_reason: string | null
          revocation_status: string
          revoked_at: string | null
        }
        Insert: {
          batch_id: string
          blockchain_anchored_at?: string | null
          blockchain_block_number?: number | null
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          credential_hash?: string | null
          credential_json: Json
          holder_id: string
          id?: string
          inspection_id: string
          issued_at?: string
          issuer_did: string
          qr_token: string
          revocation_reason?: string | null
          revocation_status?: string
          revoked_at?: string | null
        }
        Update: {
          batch_id?: string
          blockchain_anchored_at?: string | null
          blockchain_block_number?: number | null
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          credential_hash?: string | null
          credential_json?: Json
          holder_id?: string
          id?: string
          inspection_id?: string
          issued_at?: string
          issuer_did?: string
          qr_token?: string
          revocation_reason?: string | null
          revocation_status?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifiable_credentials_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifiable_credentials_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifiable_credentials_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          batch_id: string
          conditions: string | null
          created_at: string
          data_source: string | null
          humidity_percent: number | null
          id: string
          location_lat: number | null
          location_lon: number | null
          rainfall_mm: number | null
          recorded_date: string
          temperature_celsius: number | null
          updated_at: string
          wind_speed_kmh: number | null
        }
        Insert: {
          batch_id: string
          conditions?: string | null
          created_at?: string
          data_source?: string | null
          humidity_percent?: number | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          rainfall_mm?: number | null
          recorded_date: string
          temperature_celsius?: number | null
          updated_at?: string
          wind_speed_kmh?: number | null
        }
        Update: {
          batch_id?: string
          conditions?: string | null
          created_at?: string
          data_source?: string | null
          humidity_percent?: number | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          rainfall_mm?: number | null
          recorded_date?: string
          temperature_celsius?: number | null
          updated_at?: string
          wind_speed_kmh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_document_expiry_notifications: {
        Args: never
        Returns: {
          days_until_expiry: number
          document_id: string
          document_name: string
          expiry_date: string
          user_email: string
        }[]
      }
      generate_tracking_token: { Args: never; Returns: string }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "exporter" | "qa_agency" | "importer" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["exporter", "qa_agency", "importer", "admin"],
    },
  },
} as const
