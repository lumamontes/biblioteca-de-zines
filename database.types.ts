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
          email: string | null
          id: number
          name: string
          name_fts: unknown | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name: string
          name_fts?: unknown | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string
          name_fts?: unknown | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      form_uploads: {
        Row: {
          author_email: string | null
          author_name: string | null
          author_url: string | null
          collection_title: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: number
          is_published: boolean | null
          pdf_url: string | null
          published_year: string | null
          tags: Json | null
          title: string
          uuid: string | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          author_url?: string | null
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          published_year?: string | null
          tags?: Json | null
          title: string
          uuid?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          author_url?: string | null
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          published_year?: string | null
          tags?: Json | null
          title?: string
          uuid?: string | null
        }
        Relationships: []
      }
      library_zines: {
        Row: {
          collection_title: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: number
          is_published: boolean | null
          pdf_url: string | null
          send_email: boolean | null
          slug: string | null
          tags: Json | null
          title: string
          title_fts: unknown | null
          updated_at: string | null
          uuid: string | null
          year: string | null
        }
        Insert: {
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          send_email?: boolean | null
          slug?: string | null
          tags?: Json | null
          title: string
          title_fts?: unknown | null
          updated_at?: string | null
          uuid?: string | null
          year?: string | null
        }
        Update: {
          collection_title?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_published?: boolean | null
          pdf_url?: string | null
          send_email?: boolean | null
          slug?: string | null
          tags?: Json | null
          title?: string
          title_fts?: unknown | null
          updated_at?: string | null
          uuid?: string | null
          year?: string | null
        }
        Relationships: []
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