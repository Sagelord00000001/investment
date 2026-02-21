import { supabase } from './supabase'
import { Database } from './supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
  
    // The profile should be created automatically by the trigger
    if (data.user) {
      // Only try to ensure profile if user is confirmed or confirmation not required
      if (data.user.email_confirmed_at || !data.user.confirmation_sent_at) {
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        try {
          await ensureProfile(data.user.id, email, fullName)
          
          // Log the registration activity
          await logActivity(data.user.id, 'user_registered', {
            email,
            full_name: fullName,
            timestamp: new Date().toISOString()
          })
        } catch (profileError) {
          console.warn('Profile creation warning:', profileError)
        }
      }
    }
    
    return data
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  
    // Ensure profile exists after login and log the activity
    if (data.user) {
      try {
        await ensureProfile(data.user.id, data.user.email!, data.user.user_metadata?.full_name)
        
        // Update last login and log activity
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
        
        await logActivity(data.user.id, 'user_login', {
          timestamp: new Date().toISOString()
        })
      } catch (profileError) {
        console.warn('Profile handling warning during sign in:', profileError)
      }
    }
    
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.warn('Error signing out:', error)
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.warn('Error getting current user:', error)
    return null
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

export async function ensureProfile(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  try {
    // First try to get existing profile
    let profile = await getProfile(userId)
    
    if (!profile) {
      // Create profile if it doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName || null,
          balance: 0.00,
          role: 'user'
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error('Error creating profile:', error)
        // Try one more time to get the profile in case it was created by trigger
        profile = await getProfile(userId)
        if (!profile) {
          throw error
        }
      } else {
        profile = data
      }
    }
    
    return profile
  } catch (error) {
    console.error('Error in ensureProfile:', error)
    return null
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

export async function logActivity(userId: string | null, action: string, details?: any) {
  if (!userId) return
  
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        details,
      })

    if (error) console.error('Error logging activity:', error)
  } catch (error) {
    console.error('Error in logActivity:', error)
  }
}

// Admin-specific functions
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

export async function updateUserBalance(userId: string, balance: number) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ balance })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user balance:', error)
    throw error
  }
}

export async function resendConfirmation(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    if (error) throw error
  } catch (error) {
    console.error('Error resending confirmation:', error)
    throw error
  }
}
