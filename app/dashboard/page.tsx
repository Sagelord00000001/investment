"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, PieChart, Plus, Home, TrendingDown, Settings, Shield, LogOut, Menu, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }
    
    if (user) {
      fetchInvestments()
    }
  }, [user, authLoading, router])

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl font-medium">Loading dashboard...</div>
      </div>
    )
  }

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const activeInvestments = investments.filter(inv => inv.status === 'active').length
  const avgReturn = investments.length > 0 
    ? (investments.reduce((sum, inv) => sum + (inv.returns_percentage || 0), 0) / investments.length).toFixed(2)
    : '0'

  const stats = [
    {
      title: "Total Balance",
      value: `$${Number(profile.balance).toLocaleString()}`,
      icon: DollarSign,
      change: "+12.5%"
    },
    {
      title: "Invested Amount",
      value: `$${totalInvested.toLocaleString()}`,
      icon: TrendingUp,
      change: `${activeInvestments} active`
    },
    {
      title: "Average Return",
      value: `${avgReturn}%`,
      icon: PieChart,
      change: "On investments"
    }
  ]

  const NavItems = () => (
    <nav className="flex flex-col gap-2">
      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium transition-all">
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link href="/invest" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-all">
        <TrendingUp className="w-5 h-5" />
        <span>Make Investment</span>
      </Link>
      <Link href="/withdraw" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-all">
        <TrendingDown className="w-5 h-5" />
        <span>Withdraw Funds</span>
      </Link>
      <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-all">
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
      
      {profile.role === 'admin' && (
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-all">
          <Shield className="w-5 h-5" />
          <span>Admin Panel</span>
        </Link>
      )}
      
      <div className="border-t border-border my-2 pt-2">
        <Button 
          onClick={handleSignOut}
          variant="ghost"
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full justify-start text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 md:fixed md:inset-y-0 md:border-r md:border-border md:bg-muted/30">
        <div className="flex items-center gap-3 px-6 py-8 border-b border-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <span className="text-lg font-semibold text-foreground">InvestPro</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <NavItems />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 border-b border-border bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-base font-semibold text-foreground">InvestPro</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 px-0">
            <div className="py-6 px-4">
              <NavItems />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 lg:ml-72">
        <div className="pt-20 md:pt-0 px-4 md:px-8 py-8 md:py-10 max-w-7xl mx-auto w-full">
          {/* Welcome Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                  {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
                <p className="text-muted-foreground text-sm mt-1">{profile.full_name || 'User'} • {profile.role === 'admin' ? 'Administrator' : 'Premium Account'}</p>
              </div>
            </div>
            <Badge className="w-fit" variant="outline">Account Active</Badge>
          </div>

          {/* Primary Balance Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">Current Account Balance</p>
                  <p className="text-5xl font-bold text-foreground">${Number(profile.balance).toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30">
                  <DollarSign className="w-10 h-10 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Investments Section */}
          {investments.length > 0 && (
            <Card className="mb-10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Your Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Plan Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.slice(0, 5).map((inv) => (
                        <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4 capitalize text-sm font-medium text-foreground">{inv.plan_type}</td>
                          <td className="py-4 px-4 text-sm text-foreground font-medium">${Number(inv.amount).toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <Badge variant={inv.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right text-sm">
                            <span className="font-medium text-green-600">{inv.returns_percentage || 0}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Grow Your Portfolio?</h3>
              <p className="text-muted-foreground mb-6">Start investing with our professional plans and watch your wealth grow</p>
              <Link href="/invest">
                <Button className="gap-2 px-8">
                  <Plus className="w-4 h-4" />
                  New Investment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
