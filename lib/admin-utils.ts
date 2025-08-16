import { supabase } from './supabase'
import { logActivity } from './auth'

export async function createAdminUser(email: string, fullName?: string) {
  try {
    // First, check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) throw authError
    
    const existingUser = authUsers.users.find(user => user.email === email)
    
    if (!existingUser) {
      throw new Error(`User with email ${email} not found. Please create the user account first.`)
    }

    // Update the user's profile to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        balance: 50000.00,
        pin_status: 'active'
      })
      .eq('id', existingUser.id)
      .select()
      .single()

    if (error) throw error

    // Log the admin creation
    await logActivity(existingUser.id, 'admin_created', {
      method: 'admin_utils',
      initial_balance: 50000.00,
      created_by: 'system'
    })

    return data
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}

export async function checkAdminStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) throw error
    
    return data.role === 'admin' || data.role === 'manager'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function promoteUserToAdmin(userId: string, currentAdminId: string) {
  try {
    // First verify the current user is admin
    const isCurrentUserAdmin = await checkAdminStatus(currentAdminId)
    if (!isCurrentUserAdmin) {
      throw new Error('Only admins can promote users to admin')
    }

    // Update the user's role
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    // Log the promotion
    await logActivity(userId, 'user_promoted_to_admin', {
      promoted_by: currentAdminId,
      timestamp: new Date().toISOString()
    })

    return data
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    throw error
  }
}
