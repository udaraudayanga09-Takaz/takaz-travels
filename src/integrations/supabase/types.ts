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
      additional_places: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          media_urls: string[]
          name: string
          published: boolean
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          media_urls?: string[]
          name: string
          published?: boolean
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          media_urls?: string[]
          name?: string
          published?: boolean
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          days: number
          end_date: string
          guest_email: string
          guest_name: string
          id: string
          listing_id: string
          listing_title: string
          listing_type: string
          payment_intent_id: string | null
          start_date: string
          status: string
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          days: number
          end_date: string
          guest_email: string
          guest_name: string
          id?: string
          listing_id: string
          listing_title: string
          listing_type: string
          payment_intent_id?: string | null
          start_date: string
          status?: string
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          days?: number
          end_date?: string
          guest_email?: string
          guest_name?: string
          id?: string
          listing_id?: string
          listing_title?: string
          listing_type?: string
          payment_intent_id?: string | null
          start_date?: string
          status?: string
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      listing_blocked_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          listing_id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          listing_id: string
          owner_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          listing_id?: string
          owner_id?: string
        }
        Relationships: []
      }
      listing_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: []
      }
      map_pins: {
        Row: {
          blurb: string | null
          created_at: string
          cx: number
          cy: number
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          cx: number
          cy: number
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          blurb?: string | null
          created_at?: string
          cx?: number
          cy?: number
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          listing_id: string | null
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          listing_id?: string | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          listing_id?: string | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          created_at: string
          document_url: string | null
          email: string
          full_name: string
          id: string
          location_label: string | null
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          phone: string | null
          published: boolean
          reject_reason: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          email: string
          full_name: string
          id?: string
          location_label?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          phone?: string | null
          published?: boolean
          reject_reason?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          document_url?: string | null
          email?: string
          full_name?: string
          id?: string
          location_label?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          phone?: string | null
          published?: boolean
          reject_reason?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      place_likes: {
        Row: {
          created_at: string
          id: string
          place_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          kind: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          kind?: string
          label: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          kind?: string
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profile_identity_docs: {
        Row: {
          created_at: string
          idp_url: string | null
          licence_verified: boolean
          passport_url: string | null
          updated_at: string
          user_id: string
          verified_tourist: boolean
        }
        Insert: {
          created_at?: string
          idp_url?: string | null
          licence_verified?: boolean
          passport_url?: string | null
          updated_at?: string
          user_id: string
          verified_tourist?: boolean
        }
        Update: {
          created_at?: string
          idp_url?: string | null
          licence_verified?: boolean
          passport_url?: string | null
          updated_at?: string
          user_id?: string
          verified_tourist?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_bank_accounts: {
        Row: {
          account_holder_enc: string
          account_last4: string | null
          account_number_enc: string
          bank_name_enc: string
          created_at: string
          id: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          account_holder_enc: string
          account_last4?: string | null
          account_number_enc: string
          bank_name_enc: string
          created_at?: string
          id?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          account_holder_enc?: string
          account_last4?: string | null
          account_number_enc?: string
          bank_name_enc?: string
          created_at?: string
          id?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_listings: {
        Row: {
          avg_rating: number
          city: string | null
          created_at: string
          daily_rate: number
          description: string | null
          details: Json
          id: string
          kind: string
          location_label: string | null
          owner_id: string
          photos: string[]
          review_count: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          city?: string | null
          created_at?: string
          daily_rate?: number
          description?: string | null
          details?: Json
          id?: string
          kind: string
          location_label?: string | null
          owner_id: string
          photos?: string[]
          review_count?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          city?: string | null
          created_at?: string
          daily_rate?: number
          description?: string | null
          details?: Json
          id?: string
          kind?: string
          location_label?: string | null
          owner_id?: string
          photos?: string[]
          review_count?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_places: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          media_urls: string[]
          name: string
          parent_slug: string
          published: boolean
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          media_urls?: string[]
          name: string
          parent_slug: string
          published?: boolean
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          media_urls?: string[]
          name?: string
          parent_slug?: string
          published?: boolean
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          published: boolean
          rating: number
          text: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          published?: boolean
          rating?: number
          text: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          published?: boolean
          rating?: number
          text?: string
        }
        Relationships: []
      }
      top_destinations: {
        Row: {
          bookings_count: number
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          trip_rank: number | null
          updated_at: string
        }
        Insert: {
          bookings_count?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          trip_rank?: number | null
          updated_at?: string
        }
        Update: {
          bookings_count?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          trip_rank?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      travel_blogs: {
        Row: {
          author_name: string
          body: string
          cover_url: string | null
          created_at: string
          id: string
          instagram_url: string | null
          place_slug: string | null
          published: boolean
          title: string
          twitter_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          author_name: string
          body: string
          cover_url?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          place_slug?: string | null
          published?: boolean
          title: string
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          author_name?: string
          body?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          place_slug?: string | null
          published?: boolean
          title?: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      trip_plans: {
        Row: {
          contact_email: string
          contact_name: string | null
          created_at: string
          end_date: string | null
          handled: boolean
          id: string
          notes: string | null
          party_size: number | null
          regions: Json
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          contact_email: string
          contact_name?: string | null
          created_at?: string
          end_date?: string | null
          handled?: boolean
          id?: string
          notes?: string | null
          party_size?: number | null
          regions?: Json
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          contact_email?: string
          contact_name?: string | null
          created_at?: string
          end_date?: string | null
          handled?: boolean
          id?: string
          notes?: string | null
          party_size?: number | null
          regions?: Json
          start_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_places: {
        Row: {
          body: string | null
          cover_url: string | null
          created_at: string
          created_by: string
          cx: number | null
          cy: number | null
          id: string
          likes_count: number
          name: string
          region: string | null
          slug: string
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          cover_url?: string | null
          created_at?: string
          created_by: string
          cx?: number | null
          cy?: number | null
          id?: string
          likes_count?: number
          name: string
          region?: string | null
          slug: string
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string
          cx?: number | null
          cy?: number | null
          id?: string
          likes_count?: number
          name?: string
          region?: string | null
          slug?: string
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_verification: {
        Args: never
        Returns: {
          idp_url: string
          licence_verified: boolean
          passport_url: string
          verified_tourist: boolean
        }[]
      }
      get_unavailable_dates: {
        Args: { _listing_id: string }
        Returns: string[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      upsert_bank_account: {
        Args: {
          _account_holder: string
          _account_number: string
          _bank_name: string
          _key: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "tourist" | "partner" | "admin"
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
      app_role: ["tourist", "partner", "admin"],
    },
  },
} as const
