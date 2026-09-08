// Hand-authored to match supabase/schema.sql, in the same shape
// `npx supabase gen types typescript` would generate — including the
// `Relationships` arrays, which @supabase/postgrest-js needs to correctly
// type nested embeds (e.g. `.select("*, profiles(full_name)")`).
// If you change the schema, update this file (or regenerate with the
// Supabase CLI once it's linked to this project).

export type Role = "owner" | "staff";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Role;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: Role;
          created_at?: string;
        };
        Update: Partial<{
          full_name: string;
          role: Role;
        }>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          points_balance: number;
          joined_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          points_balance?: number;
          joined_date?: string;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          phone: string;
          email: string | null;
          points_balance: number;
        }>;
        Relationships: [];
      };
      rewards: {
        Row: {
          id: string;
          name: string;
          points_required: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          points_required: number;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          points_required: number;
          active: boolean;
        }>;
        Relationships: [];
      };
      visits: {
        Row: {
          id: string;
          customer_id: string;
          amount_spent: number;
          points_earned: number;
          staff_id: string | null;
          visit_date: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          amount_spent: number;
          points_earned: number;
          staff_id?: string | null;
          visit_date?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "visits_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visits_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      redemptions: {
        Row: {
          id: string;
          customer_id: string;
          reward_id: string;
          points_used: number;
          staff_id: string | null;
          redeemed_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          reward_id: string;
          points_used: number;
          staff_id?: string | null;
          redeemed_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "redemptions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "redemptions_reward_id_fkey";
            columns: ["reward_id"];
            isOneToOne: false;
            referencedRelation: "rewards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "redemptions_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      customer_stats: {
        Row: {
          customer_id: string;
          total_visits: number;
          total_points_earned: number;
          last_visit: string | null;
        };
        Relationships: [];
      };
      customers_with_stats: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          points_balance: number;
          joined_date: string;
          created_at: string;
          total_visits: number;
          total_points_earned: number;
          last_visit: string | null;
          total_redemptions: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      visits_last_7_days: {
        Args: Record<string, never>;
        Returns: { day: string; visit_count: number }[];
      };
      top_loyal_customers: {
        Args: { p_limit?: number };
        Returns: {
          customer_id: string;
          name: string;
          phone: string;
          points_balance: number;
          total_visits: number;
        }[];
      };
      record_visit: {
        Args: {
          p_customer_id: string;
          p_amount_spent: number;
          p_staff_id?: string;
        };
        Returns: { visit_id: string; points_earned: number; new_balance: number }[];
      };
      redeem_reward: {
        Args: {
          p_customer_id: string;
          p_reward_id: string;
          p_staff_id?: string;
        };
        Returns: { redemption_id: string; points_used: number; new_balance: number }[];
      };
      is_owner: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerWithStats = Database["public"]["Views"]["customers_with_stats"]["Row"];
export type Reward = Database["public"]["Tables"]["rewards"]["Row"];
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type Redemption = Database["public"]["Tables"]["redemptions"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
