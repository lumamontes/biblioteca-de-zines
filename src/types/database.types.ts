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
      authors: {
        Row: {
          bio: string | null
          created_at: string | null
          id: number
          name: string
          slug: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: number
          name: string
          slug?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: number
          name?: string
          slug?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      form_uploads: {
        Row: {
          author_name: string | null
          author_url: string | null
          author_email: string | null
          collection_title: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: number
          is_published: boolean | null
          pdf_url: string | null
          active_page_generation: string | null
          processing_status: "pending" | "processing" | "completed" | "failed" | null
          processed_pdf_url: string | null
          tags: Json | null
          title: string
          total_pages: number | null
          published_year: number | null
          uuid: string | null
        }
        Insert: {
          author_name?: string | null
          author_url?: string | null
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          active_page_generation?: string | null
          processing_status?: "pending" | "processing" | "completed" | "failed" | null
          processed_pdf_url?: string | null
          tags?: Json | null
          title: string
          total_pages?: number | null
          uuid?: string | null
        }
        Update: {
          author_name?: string | null
          author_url?: string | null
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          active_page_generation?: string | null
          processing_status?: "pending" | "processing" | "completed" | "failed" | null
          processed_pdf_url?: string | null
          tags?: Json | null
          title?: string
          total_pages?: number | null
          uuid?: string | null
        }
        Relationships: []
      }
      form_upload_pages: {
        Row: {
          created_at: string
          form_upload_id: number
          generation_id: string
          id: number
          image_url: string
          page_number: number
        }
        Insert: {
          created_at?: string
          form_upload_id: number
          generation_id: string
          id?: number
          image_url: string
          page_number: number
        }
        Update: {
          created_at?: string
          form_upload_id?: number
          generation_id?: string
          id?: number
          image_url?: string
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_upload_pages_form_upload_id_fkey"
            columns: ["form_upload_id"]
            isOneToOne: false
            referencedRelation: "form_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      library_zines: {
        Row: {
          collection_title: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: number
          import_status: "pending" | "processing" | "completed" | "failed" | null
          is_published: boolean | null
          pdf_url: string | null
          active_page_generation: string
          source_upload_id: number | null
          slug: string | null
          tags: Json | null
          title: string
          total_pages: number | null
          year: number | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          import_status?: "pending" | "processing" | "completed" | "failed" | null
          is_published?: boolean | null
          pdf_url?: string | null
          active_page_generation?: string
          source_upload_id?: number | null
          slug?: string | null
          tags?: Json | null
          title: string
          total_pages?: number | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          import_status?: "pending" | "processing" | "completed" | "failed" | null
          is_published?: boolean | null
          pdf_url?: string | null
          active_page_generation?: string
          source_upload_id?: number | null
          slug?: string | null
          tags?: Json | null
          title?: string
          total_pages?: number | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_library_zines"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "library_zines_authors"
            referencedColumns: ["zine_id"]
          },
          {
            foreignKeyName: "library_zines_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: true
            referencedRelation: "form_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      library_zines_authors: {
        Row: {
          author_id: number
          created_at: string | null
          id: number
          zine_id: number
        }
        Insert: {
          author_id: number
          created_at?: string | null
          id?: number
          zine_id: number
        }
        Update: {
          author_id?: number
          created_at?: string | null
          id?: number
          zine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_authors"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_library_zines"
            columns: ["zine_id"]
            isOneToOne: false
            referencedRelation: "library_zines"
            referencedColumns: ["id"]
          },
        ]
      }
      zine_pages: {
        Row: {
          created_at: string | null
          generation_id: string
          id: number
          image_url: string
          page_number: number
          zine_id: number
        }
        Insert: {
          created_at?: string | null
          generation_id?: string
          id?: number
          image_url: string
          page_number: number
          zine_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          image_url?: string
          page_number?: number
          zine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "zine_pages_zine_id_fkey"
            columns: ["zine_id"]
            isOneToOne: false
            referencedRelation: "library_zines"
            referencedColumns: ["id"]
          },
        ]
      }
      zine_processing_jobs: {
        Row: {
          attempt_count: number
          created_at: string
          id: number
          last_error: string | null
          lease_until: string | null
          next_attempt_at: string
          status: "pending" | "processing" | "completed" | "failed"
          updated_at: string
          zine_id: number
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: number
          last_error?: string | null
          lease_until?: string | null
          next_attempt_at?: string
          status?: "pending" | "processing" | "completed" | "failed"
          updated_at?: string
          zine_id: number
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: number
          last_error?: string | null
          lease_until?: string | null
          next_attempt_at?: string
          status?: "pending" | "processing" | "completed" | "failed"
          updated_at?: string
          zine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "zine_processing_jobs_zine_id_fkey"
            columns: ["zine_id"]
            isOneToOne: true
            referencedRelation: "library_zines"
            referencedColumns: ["id"]
          },
        ]
      }
      zines: {
        Row: {
          author_name: string | null
          author_url: string | null
          collection_title: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: number
          is_published: boolean | null
          pdf_url: string | null
          tags: Json | null
          title: string
          uuid: string | null
        }
        Insert: {
          author_name?: string | null
          author_url?: string | null
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          tags?: Json | null
          title: string
          uuid?: string | null
        }
        Update: {
          author_name?: string | null
          author_url?: string | null
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          tags?: Json | null
          title?: string
          uuid?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
