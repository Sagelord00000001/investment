import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'admin'
          balance: number
          pin_hash: string | null
          pin_status: 'pending' | 'active' | 'expired' | 'revoked'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'admin'
          balance?: number
          pin_hash?: string | null
          pin_status?: 'pending' | 'active' | 'expired' | 'revoked'
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin'
          balance?: number
          pin_hash?: string | null
          pin_status?: 'pending' | 'active' | 'expired' | 'revoked'
          avatar_url?: string | null
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          plan_type: 'fixed' | 'monthly' | 'custom'
          amount: number
          status: 'active' | 'completed' | 'cancelled'
          returns_percentage: number | null
          start_date: string
          end_date: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          plan_type: 'fixed' | 'monthly' | 'custom'
          amount: number
          status?: 'active' | 'completed' | 'cancelled'
          returns_percentage?: number | null
          start_date?: string
          end_date?: string | null
        }
        Update: {
          plan_type?: 'fixed' | 'monthly' | 'custom'
          amount?: number
          status?: 'active' | 'completed' | 'cancelled'
          returns_percentage?: number | null
          end_date?: string | null
        }
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          pin_verified: boolean
          admin_notes: string | null
          requested_at: string
          processed_at: string | null
        }
        Insert: {
          user_id: string
          amount: number
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          pin_verified?: boolean
          admin_notes?: string | null
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          pin_verified?: boolean
          admin_notes?: string | null
          processed_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: any | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          action: string
          details?: any | null
          ip_address?: string | null
        }
        Update: {
          action?: string
          details?: any | null
        }
      }
    }
  }
}
