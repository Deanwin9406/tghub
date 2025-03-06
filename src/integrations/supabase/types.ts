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
      agent_activity_logs: {
        Row: {
          activity_type: string
          agent_id: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          activity_type: string
          agent_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          activity_type?: string
          agent_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      agent_assignment_requests: {
        Row: {
          agent_id: string
          commission_percentage: number
          created_at: string
          id: string
          is_exclusive: boolean | null
          notes: string | null
          owner_id: string
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          commission_percentage: number
          created_at?: string
          id?: string
          is_exclusive?: boolean | null
          notes?: string | null
          owner_id: string
          property_id: string
          status: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          commission_percentage?: number
          created_at?: string
          id?: string
          is_exclusive?: boolean | null
          notes?: string | null
          owner_id?: string
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_assignment_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_client_interactions: {
        Row: {
          agent_id: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          follow_up_date: string | null
          id: string
          interaction_type: string
          notes: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          interaction_type: string
          notes?: string | null
          scheduled_at?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          interaction_type?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_commissions: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string | null
          property_id: string
          status: Database["public"]["Enums"]["commission_status"] | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["commission_status"] | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["commission_status"] | null
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_goals: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          listings_goal: number | null
          month: number
          rentals_goal: number | null
          revenue_goal: number | null
          sales_goal: number | null
          updated_at: string
          year: number
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          listings_goal?: number | null
          month: number
          rentals_goal?: number | null
          revenue_goal?: number | null
          sales_goal?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          listings_goal?: number | null
          month?: number
          rentals_goal?: number | null
          revenue_goal?: number | null
          sales_goal?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      agent_leads: {
        Row: {
          agent_id: string | null
          budget_max: number | null
          budget_min: number | null
          client_id: string | null
          created_at: string
          id: string
          last_contacted: string | null
          next_follow_up: string | null
          notes: string | null
          preferred_locations: string[] | null
          property_type: string[] | null
          requirements: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_contacted?: string | null
          next_follow_up?: string | null
          notes?: string | null
          preferred_locations?: string[] | null
          property_type?: string[] | null
          requirements?: string | null
          source: string
          status: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          last_contacted?: string | null
          next_follow_up?: string | null
          notes?: string | null
          preferred_locations?: string[] | null
          property_type?: string[] | null
          requirements?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance_metrics: {
        Row: {
          agent_id: string
          average_days_to_close: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          properties_listed: number | null
          properties_rented: number | null
          properties_sold: number | null
          total_commission: number | null
          updated_at: string
          viewings_conducted: number | null
        }
        Insert: {
          agent_id: string
          average_days_to_close?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          properties_listed?: number | null
          properties_rented?: number | null
          properties_sold?: number | null
          total_commission?: number | null
          updated_at?: string
          viewings_conducted?: number | null
        }
        Update: {
          agent_id?: string
          average_days_to_close?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          properties_listed?: number | null
          properties_rented?: number | null
          properties_sold?: number | null
          total_commission?: number | null
          updated_at?: string
          viewings_conducted?: number | null
        }
        Relationships: []
      }
      agent_properties: {
        Row: {
          agent_id: string
          commission_percentage: number
          created_at: string
          end_date: string | null
          id: string
          is_primary_agent: boolean | null
          property_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          commission_percentage: number
          created_at?: string
          end_date?: string | null
          id?: string
          is_primary_agent?: boolean | null
          property_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          commission_percentage?: number
          created_at?: string
          end_date?: string | null
          id?: string
          is_primary_agent?: boolean | null
          property_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_schedules: {
        Row: {
          agent_id: string | null
          created_at: string
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_specializations: {
        Row: {
          agent_id: string | null
          certification_info: Json | null
          created_at: string
          id: string
          property_type: Database["public"]["Enums"]["property_type"]
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          agent_id?: string | null
          certification_info?: Json | null
          created_at?: string
          id?: string
          property_type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          agent_id?: string | null
          certification_info?: Json | null
          created_at?: string
          id?: string
          property_type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      agent_territories: {
        Row: {
          agent_id: string | null
          city: string
          created_at: string
          id: string
          is_primary: boolean | null
          postal_codes: string[] | null
          state: string
          territory_name: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          city: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          postal_codes?: string[] | null
          state: string
          territory_name: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          city?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          postal_codes?: string[] | null
          state?: string
          territory_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_follow_ups: {
        Row: {
          agent_id: string | null
          client_id: string | null
          created_at: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          property_id: string | null
          reminder_sent: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_follow_ups_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          is_private: boolean | null
          location: string | null
          name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean | null
          location?: string | null
          name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean | null
          location?: string | null
          name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string
          end_time: string
          id: string
          image_url: string | null
          location: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description: string
          end_time: string
          id?: string
          image_url?: string | null
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string
          end_time?: string
          id?: string
          image_url?: string | null
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_polls: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          is_multiple_choice: boolean
          question: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_multiple_choice?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_multiple_choice?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_polls_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_roles: {
        Row: {
          community_id: string | null
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_roles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          address_proof_url: string | null
          created_at: string
          id: string
          id_image_url: string | null
          id_number: string
          id_type: string
          notes: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address_proof_url?: string | null
          created_at?: string
          id?: string
          id_image_url?: string | null
          id_number: string
          id_type: string
          notes?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address_proof_url?: string | null
          created_at?: string
          id?: string
          id_image_url?: string | null
          id_number?: string
          id_type?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leases: {
        Row: {
          auto_renewal: boolean | null
          contract_url: string | null
          created_at: string
          deposit_amount: number
          end_date: string
          id: string
          lease_terms: Json | null
          lease_type: string | null
          monthly_rent: number
          notice_period: number | null
          property_id: string
          renewal_option: boolean | null
          security_deposit_status: string | null
          start_date: string
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auto_renewal?: boolean | null
          contract_url?: string | null
          created_at?: string
          deposit_amount: number
          end_date: string
          id?: string
          lease_terms?: Json | null
          lease_type?: string | null
          monthly_rent: number
          notice_period?: number | null
          property_id: string
          renewal_option?: boolean | null
          security_deposit_status?: string | null
          start_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auto_renewal?: boolean | null
          contract_url?: string | null
          created_at?: string
          deposit_amount?: number
          end_date?: string
          id?: string
          lease_terms?: Json | null
          lease_type?: string | null
          monthly_rent?: number
          notice_period?: number | null
          property_id?: string
          renewal_option?: boolean | null
          security_deposit_status?: string | null
          start_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          request_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          request_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          needs_approval: boolean | null
          notes: string | null
          priority: string | null
          property_id: string
          resolved_date: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          needs_approval?: boolean | null
          notes?: string | null
          priority?: string | null
          property_id: string
          resolved_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          needs_approval?: boolean | null
          notes?: string | null
          priority?: string | null
          property_id?: string
          resolved_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      management_requests: {
        Row: {
          commission_percentage: number
          created_at: string
          id: string
          message: string
          property_id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          id?: string
          message: string
          property_id: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          id?: string
          message?: string
          property_id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          category: string | null
          community_id: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          price: number | null
          seller_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          community_id: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          price?: number | null
          seller_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          community_id?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          price?: number | null
          seller_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      message_thread_participants: {
        Row: {
          thread_id: string
          user_id: string
        }
        Insert: {
          thread_id: string
          user_id: string
        }
        Update: {
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          last_message: Json | null
          participant_ids: string[]
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: Json | null
          participant_ids: string[]
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: Json | null
          participant_ids?: string[]
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          status: string | null
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          status?: string | null
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          lease_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          lease_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          lease_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          poll_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          poll_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          emergency_contact: Json | null
          first_name: string | null
          id: string
          last_name: string | null
          last_sign_in_at: string | null
          permissions: string[] | null
          phone: string | null
          role: string | null
          status: string | null
          tenant_notes: string | null
          tenant_rating: number | null
          tenant_since: string | null
          two_factor_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          emergency_contact?: Json | null
          first_name?: string | null
          id: string
          last_name?: string | null
          last_sign_in_at?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: string | null
          status?: string | null
          tenant_notes?: string | null
          tenant_rating?: number | null
          tenant_since?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          emergency_contact?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_sign_in_at?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: string | null
          status?: string | null
          tenant_notes?: string | null
          tenant_rating?: number | null
          tenant_since?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          area_size: number | null
          bathrooms: number | null
          bedrooms: number | null
          compliance_status: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          features: Json | null
          id: string
          images: string[] | null
          location_coordinates: unknown | null
          owner_id: string | null
          parking_spaces: number | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          published_at: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          title: string
          updated_at: string
          verification_status: string | null
          year_built: number | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          area_size?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          compliance_status?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          id?: string
          images?: string[] | null
          location_coordinates?: unknown | null
          owner_id?: string | null
          parking_spaces?: number | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          title: string
          updated_at?: string
          verification_status?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          area_size?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          compliance_status?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          id?: string
          images?: string[] | null
          location_coordinates?: unknown | null
          owner_id?: string | null
          parking_spaces?: number | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          title?: string
          updated_at?: string
          verification_status?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      property_features: {
        Row: {
          amenities: Database["public"]["Enums"]["property_amenity"][] | null
          created_at: string
          has_title_deed: boolean | null
          id: string
          nearby_facilities: Json | null
          neighborhood_info: Json | null
          property_id: string | null
          updated_at: string
        }
        Insert: {
          amenities?: Database["public"]["Enums"]["property_amenity"][] | null
          created_at?: string
          has_title_deed?: boolean | null
          id?: string
          nearby_facilities?: Json | null
          neighborhood_info?: Json | null
          property_id?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: Database["public"]["Enums"]["property_amenity"][] | null
          created_at?: string
          has_title_deed?: boolean | null
          id?: string
          nearby_facilities?: Json | null
          neighborhood_info?: Json | null
          property_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_main: boolean | null
          property_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_main?: boolean | null
          property_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_main?: boolean | null
          property_id?: string
        }
        Relationships: []
      }
      property_managers: {
        Row: {
          assigned_at: string
          id: string
          manager_id: string
          property_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          manager_id: string
          property_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          id?: string
          manager_id?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_appointments: {
        Row: {
          appointment_date: string
          client_id: string
          created_at: string
          id: string
          location: string | null
          notes: string | null
          property_id: string | null
          proposal_id: string | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          reminder_type: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          appointment_date: string
          client_id: string
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          property_id?: string | null
          proposal_id?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          reminder_type?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          appointment_date?: string
          client_id?: string
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          property_id?: string | null
          proposal_id?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          reminder_type?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_appointments_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_appointments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "service_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      service_proposals: {
        Row: {
          created_at: string
          estimated_days: number
          id: string
          message: string
          price: number
          request_id: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          estimated_days: number
          id?: string
          message: string
          price: number
          request_id: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          estimated_days?: number
          id?: string
          message?: string
          price?: number
          request_id?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_proposals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          budget: number | null
          category: string
          created_at: string
          description: string
          id: string
          property_id: string | null
          requester_id: string
          status: string
          target_vendor_id: string | null
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          budget?: number | null
          category: string
          created_at?: string
          description: string
          id?: string
          property_id?: string | null
          requester_id: string
          status?: string
          target_vendor_id?: string | null
          title: string
          updated_at?: string
          urgency: string
        }
        Update: {
          budget?: number | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          property_id?: string | null
          requester_id?: string
          status?: string
          target_vendor_id?: string | null
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_requests_requester_id"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_requests_target_vendor_id"
            columns: ["target_vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          email: Json
          id: string
          notifications: Json
          security: Json
          system: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: Json
          id?: string
          notifications?: Json
          security?: Json
          system?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: Json
          id?: string
          notifications?: Json
          security?: Json
          system?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_documents: {
        Row: {
          document_type: string
          document_url: string
          id: string
          metadata: Json | null
          notes: string | null
          tenant_id: string | null
          uploaded_at: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          document_type: string
          document_url: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          tenant_id?: string | null
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          tenant_id?: string | null
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_incidents: {
        Row: {
          created_at: string
          description: string
          id: string
          incident_type: string
          property_id: string | null
          reported_at: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          incident_type: string
          property_id?: string | null
          reported_at?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          incident_type?: string
          property_id?: string | null
          reported_at?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_incidents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_qr_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tenant_reviews: {
        Row: {
          created_at: string
          id: string
          lease_id: string | null
          property_id: string | null
          rating: number | null
          review_text: string | null
          reviewer_id: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lease_id?: string | null
          property_id?: string | null
          rating?: number | null
          review_text?: string | null
          reviewer_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lease_id?: string | null
          property_id?: string | null
          rating?: number | null
          review_text?: string | null
          reviewer_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_reviews_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          property_id: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          property_id?: string | null
          status: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          property_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          business_name: string
          created_at: string
          description: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          logo_url: string | null
          service_area: string | null
          services_offered: string[]
          updated_at: string
        }
        Insert: {
          business_name: string
          created_at?: string
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id: string
          is_available?: boolean | null
          logo_url?: string | null
          service_area?: string | null
          services_offered?: string[]
          updated_at?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          logo_url?: string | null
          service_area?: string | null
          services_offered?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      viewings: {
        Row: {
          agent_id: string
          client_id: string | null
          created_at: string
          duration_minutes: number | null
          feedback: Json | null
          id: string
          notes: string | null
          property_id: string
          status: Database["public"]["Enums"]["viewing_status"] | null
          updated_at: string
          viewing_date: string
        }
        Insert: {
          agent_id: string
          client_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          feedback?: Json | null
          id?: string
          notes?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["viewing_status"] | null
          updated_at?: string
          viewing_date: string
        }
        Update: {
          agent_id?: string
          client_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          feedback?: Json | null
          id?: string
          notes?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["viewing_status"] | null
          updated_at?: string
          viewing_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      follow_ups_with_details: {
        Row: {
          agent_id: string | null
          client_email: string | null
          client_first_name: string | null
          client_id: string | null
          client_last_name: string | null
          client_phone: string | null
          created_at: string | null
          follow_up_date: string | null
          id: string | null
          notes: string | null
          property_address: string | null
          property_id: string | null
          property_title: string | null
          reminder_sent: boolean | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_follow_ups_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_agent_performance_metrics: {
        Args: {
          p_agent_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          agent_id: string
          average_days_to_close: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          properties_listed: number | null
          properties_rented: number | null
          properties_sold: number | null
          total_commission: number | null
          updated_at: string
          viewings_conducted: number | null
        }
      }
      can_access_route: {
        Args: {
          user_id: string
          route: string
        }
        Returns: boolean
      }
      can_view_community: {
        Args: {
          community_id: string
          user_id: string
        }
        Returns: boolean
      }
      check_agent_goal_progress: {
        Args: {
          p_agent_id: string
          p_year: number
          p_month: number
        }
        Returns: {
          agent_id: string
          created_at: string
          id: string
          listings_goal: number | null
          month: number
          rentals_goal: number | null
          revenue_goal: number | null
          sales_goal: number | null
          updated_at: string
          year: number
        }
      }
      clean_expired_tenant_qr_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_agent_goals: {
        Args: {
          p_agent_id: string
          p_year: number
          p_month: number
        }
        Returns: {
          id: string
          agent_id: string
          year: number
          month: number
          listings_goal: number
          sales_goal: number
          rentals_goal: number
          revenue_goal: number
          created_at: string
          updated_at: string
        }[]
      }
      get_agent_analytics: {
        Args: {
          p_agent_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          properties_listed: number
          properties_sold: number
          properties_rented: number
          viewings_conducted: number
          total_commission: number
          conversion_rate: number
          average_days_to_close: number
          territory_performance: Json
          property_type_distribution: Json
        }[]
      }
      has_completed_kyc: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      has_role:
        | {
            Args: {
              role_name: string
            }
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
              role: Database["public"]["Enums"]["user_role"]
            }
            Returns: boolean
          }
      is_community_member: {
        Args: {
          community_id: string
          user_id: string
        }
        Returns: boolean
      }
      reschedule_appointment: {
        Args: {
          appointment_id: string
          new_date: string
        }
        Returns: boolean
      }
      send_appointment_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_role: {
        Args: {
          user_id: string
          required_role: string
        }
        Returns: boolean
      }
    }
    Enums: {
      commission_status:
        | "pending"
        | "approved"
        | "paid"
        | "rejected"
        | "cancelled"
      kyc_status: "pending" | "approved" | "rejected"
      maintenance_status: "pending" | "in_progress" | "completed" | "cancelled"
      message_status: "sent" | "delivered" | "read"
      payment_status: "pending" | "paid" | "overdue" | "cancelled"
      property_amenity:
        | "parking"
        | "security"
        | "generator"
        | "water_tank"
        | "air_conditioning"
        | "furnished"
        | "internet"
        | "pool"
        | "garden"
        | "staff_quarters"
      property_status:
        | "draft"
        | "available"
        | "pending"
        | "rented"
        | "sold"
        | "unavailable"
        | "maintenance"
        | "archived"
      property_type:
        | "house"
        | "apartment"
        | "condo"
        | "townhouse"
        | "land"
        | "commercial"
        | "industrial"
        | "mixed_use"
      transaction_type: "sale" | "rental" | "renewal" | "referral"
      user_role:
        | "tenant"
        | "landlord"
        | "agent"
        | "admin"
        | "manager"
        | "vendor"
        | "mod"
      viewing_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "rescheduled"
        | "no_show"
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
