"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Calendar, Target, Plus, Home, Wallet, CreditCard, Settings, Shield, LogOut, Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    fetchInvestments()
  }, [user, router])

  const fetchInvestments = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvestments(data || [])
    } catch (error) {
      console.error('Error fetching investments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const activeInvestments = investments.filter(inv => inv.status === 'active').length
  const lastActivity = investments.length > 0 ? new Date(investments[0].created_at).toLocaleDateString() : 'No activity'

  const stats = [
    {
      title: "Total Invested",
      value: `$${totalInvested.toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "Active Investments",
      value: activeInvestments.toString(),
      icon: Calendar,
      color: "from-blue-400 to-cyan-500"
    },
    {
      title: "Plan Type",
      value: profile.role === 'admin' ? 'Administrator' : 'Premium',
      icon: Target,
      color: "from-purple-400 to-pink-500"
    }
  ]

  const NavItems = () => (
    <>
      <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 text-white">
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link href="/invest" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <TrendingUp className="w-5 h-5" />
        <span>Invest</span>
      </Link>
      <Link href="/withdraw" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <Wallet className="w-5 h-5" />
        <span>Withdraw</span>
      </Link>
      <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
      
      {profile.role === 'admin' && (
        <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
          <Shield className="w-5 h-5" />
          <span>Admin Panel</span>
        </Link>
      )}
      
      <Button 
        onClick={handleSignOut}
        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all bg-transparent border-0 justify-start w-full"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </Button>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Professional Financial Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-8xl text-white/2 font-bold">$</div>
        <div className="absolute top-32 right-32 text-6xl text-white/2 font-bold">₿</div>
        <div className="absolute bottom-40 left-40 text-7xl text-white/2 font-bold">€</div>
        <div className="absolute bottom-20 right-20 text-5xl text-white/2 font-bold">¥</div>
        <div className="absolute top-1/2 left-10 text-4xl text-white/2 font-bold">£</div>
        <div className="absolute top-1/3 right-10 text-4xl text-white/2 font-bold">₹</div>
      </div>

      <div className="flex relative z-10">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-black/20 backdrop-blur-md border-r border-white/10">
            <div className="flex items-center px-4 py-6">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                InvestPro
              </span>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <NavItems />
            </nav>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                InvestPro
              </span>
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-black/90 backdrop-blur-md border-white/10">
                <nav className="flex flex-col space-y-2 mt-8">
                  <NavItems />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <main className="px-4 py-8 lg:px-8 mt-16 lg:mt-0">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-white/20">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-lg">
                      {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Welcome back, {profile.full_name || 'User'}!</h1>
                    <p className="text-gray-300">{profile.role === 'admin' ? 'Administrator' : 'Premium User'}</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 mt-4 sm:mt-0">
                  Account Active
                </Badge>
              </div>
            </div>

            {/* Balance Card */}
            <Card className="mb-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Current Balance</p>
                    <p className="text-4xl font-bold text-white">${Number(profile.balance).toLocaleString()}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Button */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Ready to invest?</h3>
                <p className="text-gray-300 mb-6">Start growing your portfolio with our professional investment tools.</p>
                <Link href="/invest">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 px-8 py-3">
                    <Plus className="w-5 h-5 mr-2" />
                    Make a New Investment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
