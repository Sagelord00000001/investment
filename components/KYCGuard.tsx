"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function KYCGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkKYC = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
        return
      }

      const { data } = await supabase
        .from('kyc_submissions')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (data?.status !== 'approved') {
        router.push('/verify-kyc')
      }
    }

    checkKYC()
  }, [router])

  return <>{children}</>
}