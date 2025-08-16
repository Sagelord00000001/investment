"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Shield, User, CheckCircle, AlertTriangle } from 'lucide-react'

export function AdminSetup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'signup' | 'promote'>('signup')
  const { toast } = useToast()

  const handleCreateUser = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please provide email and password",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Create user through Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'Admin User'
          }
        }
      })

      if (error) throw error

      if (data.user) {
        toast({
          title: "User Created!",
          description: "User account created successfully. Now promoting to admin...",
        })
        
        // Wait a moment for the profile to be created by the trigger
        setTimeout(() => {
          promoteToAdmin(data.user!.id)
        }, 2000)
      }
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const promoteToAdmin = async (userId: string) => {
    try {
      // Update user to admin role
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          balance: 50000.00,
          pin_status: 'active'
        })
        .eq('id', userId)

      if (error) throw error

      // Log the admin creation
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action: 'admin_created',
          details: {
            method: 'admin_setup_component',
            email: email,
            timestamp: new Date().toISOString()
          }
        })

      toast({
        title: "Admin Created!",
        description: `Admin user created successfully with email: ${email}`,
      })

      setStep('promote')
    } catch (error: any) {
      console.error('Error promoting to admin:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to promote user to admin",
        variant: "destructive"
      })
    }
  }

  const handlePromoteExisting = async () => {
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please provide the email of the user to promote",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Find user by email and promote
      const { data: users, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (fetchError) throw fetchError

      if (!users) {
        throw new Error('User not found')
      }

      // Update to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          balance: 50000.00,
          pin_status: 'active'
        })
        .eq('id', users.id)

      if (updateError) throw updateError

      toast({
        title: "User Promoted!",
        description: `${email} has been promoted to admin`,
      })
    } catch (error: any) {
      console.error('Error promoting user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-white">Admin Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant={step === 'signup' ? 'default' : 'outline'}
              onClick={() => setStep('signup')}
              className="flex-1"
            >
              Create New Admin
            </Button>
            <Button
              variant={step === 'promote' ? 'default' : 'outline'}
              onClick={() => setStep('promote')}
              className="flex-1"
            >
              Promote Existing
            </Button>
          </div>

          {step === 'signup' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="admin@investpro.com"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="fullName" className="text-white">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Admin User"
                />
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0"
              >
                {loading ? 'Creating...' : 'Create Admin User'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="existingEmail" className="text-white">User Email to Promote</Label>
                <Input
                  id="existingEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="user@example.com"
                />
              </div>
              <Button
                onClick={handlePromoteExisting}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              >
                {loading ? 'Promoting...' : 'Promote to Admin'}
              </Button>
            </div>
          )}

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">Setup Instructions</p>
                <p className="text-yellow-300 text-xs mt-1">
                  1. Create a new admin user OR promote an existing user<br/>
                  2. The user will get admin privileges and $50,000 balance<br/>
                  3. Use these credentials to access the admin panel
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
