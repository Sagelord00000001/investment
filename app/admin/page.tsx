"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Key, TrendingUp, Shield, Settings, Home, UserCheck, BarChart3, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface DashboardStats {
  totalUsers: number
  totalInvestments: number
  totalBalance: number
  activePins: number
  pendingWithdrawals: number
  systemHealth: number
}

interface ChartData {
  name: string
  users: number
  investments: number
}

interface ActivityLog {
  id: string
  action: string
  details: any
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInvestments: 0,
    totalBalance: 0,
    activePins: 0,
    pendingWithdrawals: 0,
    systemHealth: 99.9
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    if (profile && profile.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges to access this page.",
        variant: "destructive"
      })
      router.push('/dashboard')
      return
    }

    if (profile?.role === 'admin') {
      fetchDashboardData()
    }
  }, [user, profile, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all dashboard data in parallel
      const [
        usersResult,
        investmentsResult,
        withdrawalsResult,
        activityResult
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('investments').select('*'),
        supabase.from('withdrawals').select('*'),
        supabase
          .from('activity_logs')
          .select(`
            *,
            profiles (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      if (usersResult.error) throw usersResult.error
      if (investmentsResult.error) throw investmentsResult.error
      if (withdrawalsResult.error) throw withdrawalsResult.error
      if (activityResult.error) throw activityResult.error

      const users = usersResult.data || []
      const investments = investmentsResult.data || []
      const withdrawals = withdrawalsResult.data || []
      const activities = activityResult.data || []

      // Calculate stats
      const totalBalance = users.reduce((sum, user) => sum + Number(user.balance || 0), 0)
      const totalInvestmentAmount = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
      const activePins = users.filter(user => user.pin_status === 'active').length
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length

      setStats({
        totalUsers: users.length,
        totalInvestments: totalInvestmentAmount,
        totalBalance: totalBalance,
        activePins: activePins,
        pendingWithdrawals: pendingWithdrawals,
        systemHealth: 99.9
      })

      // Generate chart data (last 7 days)
      const chartData = generateChartData(users, investments)
      setChartData(chartData)

      setRecentActivity(activities)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (users: any[], investments: any[]): ChartData[] => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const usersOnDate = users.filter(user => 
        user.created_at && user.created_at.startsWith(dateStr)
      ).length
      
      const investmentsOnDate = investments.filter(inv => 
        inv.created_at && inv.created_at.startsWith(dateStr)
      ).length

      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        users: usersOnDate,
        investments: investmentsOnDate
      })
    }
    return last7Days
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
      case "user_login":
        return <UserCheck className="w-4 h-4" />
      case "investment_created":
        return <TrendingUp className="w-4 h-4" />
      case "pin_generated":
        return <Key className="w-4 h-4" />
      case "withdrawal_requested":
        return <DollarSign className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case "user_registered":
      case "investment_created":
        return "text-green-400 bg-green-400/10"
      case "withdrawal_requested":
        return "text-yellow-400 bg-yellow-400/10"
      case "user_login":
        return "text-blue-400 bg-blue-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const NavItems = () => (
    <>
      <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 text-white">
        <BarChart3 className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link href="/admin/users" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <Users className="w-5 h-5" />
        <span>User Management</span>
      </Link>
      <Link href="/admin/pins" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <Key className="w-5 h-5" />
        <span>PIN Management</span>
      </Link>
      <Link href="/admin/kyc-reviews" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
      <UserCheck className="w-5 h-5" />
      <span>KYC Approvals</span>
    </Link>
      <Link href="/admin/withdrawals" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <DollarSign className="w-5 h-5" />
        <span>Withdrawals</span>
      </Link>
      <Link href="/admin/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
      
      <div className="border-t border-white/10 my-4"></div>
      
      <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
        <Home className="w-5 h-5" />
        <span>User Dashboard</span>
      </Link>
    </>
  )

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300 mb-4">You need admin privileges to access this page.</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-black/20 backdrop-blur-md border-r border-white/10">
            <div className="flex items-center px-4 py-6">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <NavItems />
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <main className="px-4 py-8 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-gray-300">System overview and management</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                    Administrator
                  </Badge>
                  <Button 
                    onClick={fetchDashboardData}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center text-sm text-green-400">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +12%
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center text-sm text-green-400">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +8.2%
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Total Balance</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalBalance)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <Key className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center text-sm text-green-400">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +5.1%
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Active PINs</p>
                    <p className="text-2xl font-bold text-white">{stats.activePins}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center text-sm text-yellow-400">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      {stats.pendingWithdrawals > 0 ? `${stats.pendingWithdrawals} Pending` : 'All Clear'}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">System Health</p>
                    <p className="text-2xl font-bold text-white">{stats.systemHealth}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Activity Chart */}
              <div className="lg:col-span-2">
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Platform Activity (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="#06B6D4" 
                            strokeWidth={3}
                            dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                            name="New Users"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="investments" 
                            stroke="#8B5CF6" 
                            strokeWidth={3}
                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            name="New Investments"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                            <div className={`p-2 rounded-lg ${getActivityColor(activity.action)}`}>
                              {getActivityIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium">
                                {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {activity.profiles?.full_name || activity.profiles?.email || 'System'}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {new Date(activity.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 mt-8">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Link href="/admin/users">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 py-6">
                      <Users className="w-5 h-5 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/admin/pins">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 py-6">
                      <Key className="w-5 h-5 mr-2" />
                      Manage PINs
                    </Button>
                  </Link>
                  <Link href="/admin/withdrawals">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 py-6">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Process Withdrawals
                    </Button>
                  </Link>
                  <Button 
                    onClick={fetchDashboardData}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-6"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
