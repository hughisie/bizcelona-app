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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          additional_info: string | null
          business_role: string | null
          company: string | null
          consent_contact: boolean
          consent_directory: boolean
          consent_given: boolean
          consent_guidelines: boolean
          consent_privacy: boolean
          consent_selective: boolean
          contributor_interest: boolean | null
          created_at: string | null
          email: string
          employer_business: string | null
          full_name: string
          heard_from: string | null
          hope_to_bring: string
          hopes_to_bring: string | null
          hopes_to_get: string | null
          hoping_to_get: string
          how_heard_about: string
          id: string
          industry: string | null
          industry_other: string | null
          industry_sector: string
          ip_address: string | null
          job_title: string | null
          linkedin_profile: string
          linkedin_url: string | null
          message: string | null
          review_notes: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          what_do_you_do: string
          whatsapp_number: string
        }
        Insert: {
          additional_info?: string | null
          business_role?: string | null
          company?: string | null
          consent_contact?: boolean
          consent_directory?: boolean
          consent_given?: boolean
          consent_guidelines?: boolean
          consent_privacy?: boolean
          consent_selective?: boolean
          contributor_interest?: boolean | null
          created_at?: string | null
          email: string
          employer_business?: string | null
          full_name: string
          heard_from?: string | null
          hope_to_bring: string
          hopes_to_bring?: string | null
          hopes_to_get?: string | null
          hoping_to_get: string
          how_heard_about: string
          id?: string
          industry?: string | null
          industry_other?: string | null
          industry_sector: string
          ip_address?: string | null
          job_title?: string | null
          linkedin_profile: string
          linkedin_url?: string | null
          message?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          what_do_you_do: string
          whatsapp_number: string
        }
        Update: {
          additional_info?: string | null
          business_role?: string | null
          company?: string | null
          consent_contact?: boolean
          consent_directory?: boolean
          consent_given?: boolean
          consent_guidelines?: boolean
          consent_privacy?: boolean
          consent_selective?: boolean
          contributor_interest?: boolean | null
          created_at?: string | null
          email?: string
          employer_business?: string | null
          full_name?: string
          heard_from?: string | null
          hope_to_bring?: string
          hopes_to_bring?: string | null
          hopes_to_get?: string | null
          hoping_to_get?: string
          how_heard_about?: string
          id?: string
          industry?: string | null
          industry_other?: string | null
          industry_sector?: string
          ip_address?: string | null
          job_title?: string | null
          linkedin_profile?: string
          linkedin_url?: string | null
          message?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          what_do_you_do?: string
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          clicked_at: string
          confirmed_at: string | null
          id: string
          initiator_id: string
          recipient_id: string
          reminder_sent_at: string | null
          reply_confirmed: boolean | null
        }
        Insert: {
          clicked_at?: string
          confirmed_at?: string | null
          id?: string
          initiator_id: string
          recipient_id: string
          reminder_sent_at?: string | null
          reply_confirmed?: boolean | null
        }
        Update: {
          clicked_at?: string
          confirmed_at?: string | null
          id?: string
          initiator_id?: string
          recipient_id?: string
          reminder_sent_at?: string | null
          reply_confirmed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_date: string
          external_url: string
          id: string
          is_published: boolean
          location: string | null
          organiser_id: string
          platform: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          external_url: string
          id?: string
          is_published?: boolean
          location?: string | null
          organiser_id: string
          platform: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          external_url?: string
          id?: string
          is_published?: boolean
          location?: string | null
          organiser_id?: string
          platform?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      help_tags: {
        Row: {
          created_at: string | null
          direction: string
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          direction: string
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          direction?: string
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      member_help_requests: {
        Row: {
          created_at: string | null
          description: string | null
          help_type: string
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          help_type: string
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          help_type?: string
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_help_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_help_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      member_skills: {
        Row: {
          created_at: string | null
          id: string
          skill_category: string | null
          skill_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          skill_category?: string | null
          skill_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          skill_category?: string | null
          skill_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          membership_notes: string | null
          show_in_directory: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          membership_notes?: string | null
          show_in_directory?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          membership_notes?: string | null
          show_in_directory?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      organiser_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organiser_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organiser_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organiser_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organiser_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profile_slugs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          business_role: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          headline: string | null
          id: string
          industry: string | null
          industry_other: string | null
          linkedin_url: string | null
          onboarding_completed_at: string | null
          phone_number: string | null
          profile_picture_url: string | null
          show_email: boolean | null
          show_in_directory: boolean | null
          show_phone: boolean | null
          show_whatsapp: boolean | null
          slug: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          bio?: string | null
          business_role?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          headline?: string | null
          id: string
          industry?: string | null
          industry_other?: string | null
          linkedin_url?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          show_email?: boolean | null
          show_in_directory?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          slug?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          bio?: string | null
          business_role?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          industry_other?: string | null
          linkedin_url?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          show_email?: boolean | null
          show_in_directory?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          slug?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      whatsapp_links: {
        Row: {
          actual_whatsapp_url: string
          created_at: string | null
          group_name: string
          id: string
          is_active: boolean | null
          public_url: string
          updated_at: string | null
        }
        Insert: {
          actual_whatsapp_url: string
          created_at?: string | null
          group_name: string
          id?: string
          is_active?: boolean | null
          public_url: string
          updated_at?: string | null
        }
        Update: {
          actual_whatsapp_url?: string
          created_at?: string | null
          group_name?: string
          id?: string
          is_active?: boolean | null
          public_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profile_slugs: {
        Row: {
          id: string | null
          profile_picture_url: string | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_application: {
        Args: {
          p_application_id: string
          p_notes?: string
          p_reviewer_id: string
        }
        Returns: undefined
      }
      generate_event_slug: {
        Args: { p_id: string; p_title: string }
        Returns: string
      }
      generate_profile_slug: {
        Args: { p_full_name: string; p_id: string }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_approved_member: { Args: { user_id: string }; Returns: boolean }
      is_organiser: { Args: { user_id: string }; Returns: boolean }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
      is_user_admin: { Args: { user_id_param: string }; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_ip_address?: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_user_id: string
        }
        Returns: string
      }
      reject_application: {
        Args: {
          p_application_id: string
          p_notes?: string
          p_reviewer_id: string
        }
        Returns: undefined
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
    Enums: {},
  },
} as const
