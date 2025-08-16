import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  balance: number
  total_invested: number
  total_withdrawn: number
  pin?: string
  created_at: string
  updated_at: string
}

export async function signUp(email: string, password: string, fullName: string) {
  console.log('Starting signup process...')
  
  try {
    // Sign up the user
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
      console.error('Signup error:', error)
      throw error
    }

    console.log('Signup successful:', data)

    // If user is created but not confirmed, let them know
    if (data.user && !data.session) {
      return {
        user: data.user,
        session: null,
        needsConfirmation: true,
        message: 'Please check your email for a confirmation link.'
      }
    }

    // Try to create profile manually if trigger didn't work
    if (data.user) {
      try {
        await createProfile(data.user.id, email, fullName)
      } catch (profileError) {
        console.warn('Profile creation warning:', profileError)
        // Don't fail signup if profile creation fails
      }
    }

    return {
      user: data.user,
      session: data.session,
      needsConfirmation: false,
      message: 'Account created successfully!'
    }
  } catch (error) {
    console.error('Signup process error:', error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  console.log('Starting signin process...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Signin error:', error)
      
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      }
      
      throw error
    }

    console.log('Signin successful:', data)
    return data
  } catch (error) {
    console.error('Signin process error:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Profile fetch error:', error)
    return null
  }
}

async function createProfile(userId: string, email: string, fullName: string) {
  console.log('Creating profile manually...')
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email,
          full_name: fullName,
          role: 'user',
          balance: 0,
          total_invested: 0,
          total_withdrawn: 0,
        },
      ])
      .select()

    if (error) {
      console.error('Manual profile creation error:', error)
      throw error
    }

    console.log('Profile created manually:', data)
    return data[0]
  } catch (error) {
    console.error('Profile creation failed:', error)
    throw error
  }
}

export async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  })
  
  if (error) throw error
}
