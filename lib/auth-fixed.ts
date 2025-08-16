import { supabase } from './supabase'
import { Database } from './supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function signUp(email: string, password: string, fullName: string) {
  try {
    console.log('Starting signup for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error('Supabase signup error:', error)
      throw error
    }

    console.log('Signup successful:', data.user?.id)

    // If user was created successfully
    if (data.user) {
      console.log('User created, waiting for trigger...')
      
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Try to get the profile (should exist from trigger)
      let profile = await getProfileDirect(data.user.id)
      console.log('Profile from trigger:', profile ? 'exists' : 'missing')
      
      // If no profile exists, create it manually as fallback
      if (!profile) {
        console.log('Creating profile manually as fallback...')
        profile = await createProfileDirect(data.user.id, email, fullName)
        console.log('Manual profile creation:', profile ? 'success' : 'failed')
      }
      
      // Log the registration activity if profile exists
      if (profile) {
        await logActivity(data.user.id, 'user_registered', {
          email,
          full_name: fullName,
          timestamp: new Date().toISOString(),
          method: 'signup'
        })
        console.log('Registration logged successfully')
      }
    }

    return data
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

// Direct profile operations that bypass RLS issues
export async function getProfileDirect(userId: string): Promise<Profile | null> {
  try {
    console.log('Getting profile for user:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    console.log('Profile fetched:', data ? 'found' : 'not found')
    return data
  } catch (error) {
    console.error('Exception in getProfileDirect:', error)
    return null
  }
}

export async function createProfileDirect(userId: string, email: string, fullName: string): Promise<Profile | null> {
  try {
    console.log('Creating profile directly for:', userId, email)
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: 'user',
        balance: 0.00,
        pin_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile directly:', error)
      return null
    }

    console.log('Profile created directly:', data)
    return data
  } catch (error) {
    console.error('Exception in createProfileDirect:', error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Signing in user:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Ensure profile exists after login
    if (data.user) {
      console.log('User signed in, checking profile...')
      
      let profile = await getProfileDirect(data.user.id)
      
      // Create profile if it doesn't exist (shouldn't happen but safety net)
      if (!profile) {
        console.log('No profile found, creating one...')
        profile = await createProfileDirect(
          data.user.id, 
          data.user.email!, 
          data.user.user_metadata?.full_name || 'User'
        )
      }
      
      // Update last login if profile exists
      if (profile) {
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
        
        await logActivity(data.user.id, 'user_login', {
          timestamp: new Date().toISOString()
        })
        
        console.log('Login completed successfully')
      }
    }

    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Use the direct version to avoid recursion
export async function getProfile(userId: string): Promise<Profile | null> {
  return getProfileDirect(userId)
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
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

    if (error) {
      console.error('Error logging activity:', error)
    }
  } catch (error) {
    console.error('Error in logActivity:', error)
  }
}

// Admin-specific functions
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateUserBalance(userId: string, balance: number) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ balance })
    .eq('id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Check if current user is admin (uses the non-recursive function)
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin')
    
    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }
    
    return data || false
  } catch (error) {
    console.error('Exception checking admin status:', error)
    return false
  }
}
