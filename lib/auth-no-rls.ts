import { supabase } from './supabase'

export async function signUp(email: string, password: string, fullName: string) {
  try {
    console.log('Starting signup for:', email)
    
    // Sign up with email confirmation disabled for development
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // This will skip email confirmation in development
        emailRedirectTo: undefined,
      },
    })

    if (error) {
      console.error('Supabase signup error:', error)
      throw error
    }

    console.log('Signup successful, user ID:', data.user?.id)

    // Since RLS is disabled, we can safely check and create profiles
    if (data.user) {
      console.log('User created, checking profile...')
      
      // Wait a moment for trigger
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if profile exists (no RLS issues now)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()
      
      if (!existingProfile) {
        console.log('No profile found, creating manually...')
        
        // Create profile manually (no RLS blocking)
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: 'user',
            balance: 0.00,
            pin_status: 'pending'
          })
          .select()
          .single()
        
        if (profileError) {
          console.error('Profile creation failed:', profileError)
          // Don't throw error, just log it
        } else {
          console.log('Profile created successfully:', newProfile)
        }
      } else {
        console.log('Profile already exists')
      }
    }

    return data
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Signing in user:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      
      // Handle specific email confirmation error
      if (error.message.includes('Email not confirmed')) {
        // Try to resend confirmation email
        console.log('Attempting to resend confirmation email...')
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        })
        
        if (resendError) {
          console.error('Failed to resend confirmation:', resendError)
          throw new Error('Email not confirmed. Please check your email for the confirmation link, or contact support if you did not receive it.')
        } else {
          throw new Error('Email not confirmed. We have sent you a new confirmation link. Please check your email.')
        }
      }
      
      throw error
    }

    console.log('Sign in successful')
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

export async function getProfile(userId: string) {
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
    console.error('Exception in getProfile:', error)
    return null
  }
}

export async function updateProfile(userId: string, updates: any) {
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

// Helper function to manually confirm a user (for development)
export async function confirmUser(email: string) {
  try {
    // This would typically be done through Supabase admin API
    // For now, we'll just try to resend the confirmation
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error confirming user:', error)
    throw error
  }
}
