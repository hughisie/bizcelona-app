export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          business_role: string | null;
          phone_number: string | null;
          whatsapp_number: string | null;
          company: string | null;
          industry: string | null;
          bio: string | null;
          linkedin_url: string | null;
          profile_picture_url: string | null;
          show_in_directory: boolean;
          show_email: boolean;
          show_phone: boolean;
          show_whatsapp: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          business_role?: string | null;
          phone_number?: string | null;
          whatsapp_number?: string | null;
          company?: string | null;
          industry?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          profile_picture_url?: string | null;
          show_in_directory?: boolean;
          show_email?: boolean;
          show_phone?: boolean;
          show_whatsapp?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          business_role?: string | null;
          phone_number?: string | null;
          whatsapp_number?: string | null;
          company?: string | null;
          industry?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          profile_picture_url?: string | null;
          show_in_directory?: boolean;
          show_email?: boolean;
          show_phone?: boolean;
          show_whatsapp?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      member_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_name: string;
          skill_category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_name: string;
          skill_category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_name?: string;
          skill_category?: string | null;
          created_at?: string;
        };
      };
      member_help_requests: {
        Row: {
          id: string;
          user_id: string;
          help_type: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          help_type: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          help_type?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
          approved_by: string | null;
          approved_at: string | null;
          membership_notes: string | null;
          show_in_directory: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
          approved_by?: string | null;
          approved_at?: string | null;
          membership_notes?: string | null;
          show_in_directory?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
          approved_by?: string | null;
          approved_at?: string | null;
          membership_notes?: string | null;
          show_in_directory?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone_number: string;
          whatsapp_number: string;
          business_role: string;
          company: string;
          message: string;
          consent_given: boolean;
          status: 'submitted' | 'under_review' | 'approved' | 'rejected';
          reviewed_by: string | null;
          review_notes: string | null;
          ip_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email: string;
          phone_number: string;
          whatsapp_number: string;
          business_role: string;
          company: string;
          message: string;
          consent_given: boolean;
          status?: 'submitted' | 'under_review' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          review_notes?: string | null;
          ip_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string;
          phone_number?: string;
          whatsapp_number?: string;
          business_role?: string;
          company?: string;
          message?: string;
          consent_given?: boolean;
          status?: 'submitted' | 'under_review' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          review_notes?: string | null;
          ip_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          user_id: string;
          role: 'super_admin' | 'admin' | 'moderator';
          granted_by: string | null;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'super_admin' | 'admin' | 'moderator';
          granted_by?: string | null;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'super_admin' | 'admin' | 'moderator';
          granted_by?: string | null;
          granted_at?: string;
        };
      };
      whatsapp_links: {
        Row: {
          id: string;
          group_name: string;
          public_url: string;
          actual_whatsapp_url: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_name: string;
          public_url: string;
          actual_whatsapp_url: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_name?: string;
          public_url?: string;
          actual_whatsapp_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;
          author_id: string;
          published: boolean;
          published_at: string | null;
          featured_image_url: string | null;
          video_url: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content: string;
          author_id: string;
          published?: boolean;
          published_at?: string | null;
          featured_image_url?: string | null;
          video_url?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          content?: string;
          author_id?: string;
          published?: boolean;
          published_at?: string | null;
          featured_image_url?: string | null;
          video_url?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
