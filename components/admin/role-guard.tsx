"use client"

import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager'
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  requiredRole = 'admin', 
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
        return
      }

      if (profile && !hasRequiredRole(profile.role, requiredRole)) {
        router.push(fallbackPath)
        return
      }
    }
  }, [user, profile, loading, router, requiredRole, fallbackPath])

  const hasRequiredRole = (userRole: string, required: string): boolean => {
    if (required === 'admin') {
      return userRole === 'admin'
    }
    if (required === 'manager') {
      return userRole === 'admin' || userRole === 'manager'
    }
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
          <p className="text-gray-300 mb-4">Please sign in to access this page.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (profile && !hasRequiredRole(profile.role, requiredRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300 mb-4">
            You need {requiredRole} privileges to access this page.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Current role: {profile.role}
          </p>
          <Link href={fallbackPath}>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
