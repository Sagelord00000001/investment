"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, DollarSign, CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  pin_verified: boolean
  admin_notes: string | null
  requested_at: string
  processed_at: string | null
  profiles?: {
    full_name: string | null
    email: string
    balance: number
  }
}

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [isProcessOpen, setIsProcessOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const router = useRouter()

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
      fetchWithdrawals()
    }
  }, [user, profile, router])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles (
            full_name,
            email,
            balance
          )
        `)
        .order('requested_at', { ascending: false })

      if (error) throw error
      setWithdrawals(data || [])
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      toast({
        title: "Error",
        description: "Failed to load withdrawals",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProcessWithdrawal = async (approve: boolean) => {
    if (!selectedWithdrawal || !user) return

    try {
      const newStatus = approve ? 'approved' : 'rejected'
      
      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedWithdrawal.id)

      if (withdrawalError) throw withdrawalError

      if (approve && selectedWithdrawal.profiles) {
        // Deduct from user balance if approved
        const newBalance = selectedWithdrawal.profiles.balance - selectedWithdrawal.amount
        
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', selectedWithdrawal.user_id)

        if (balanceError) throw balanceError

        // Create transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: selectedWithdrawal.user_id,
            type: 'withdrawal',
            amount: -selectedWithdrawal.amount,
            balance_before: selectedWithdrawal.profiles.balance,
            balance_after: newBalance,
            reference_id: selectedWithdrawal.id,
            description: `Withdrawal ${approve ? 'approved' : 'rejected'} by admin`
          })
      }

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: selectedWithdrawal.user_id,
          action: `withdrawal_${newStatus}`,
          details: { 
            admin_id: user.id,
            withdrawal_id: selectedWithdrawal.id,
            amount: selectedWithdrawal.amount,
            notes: adminNotes,
            timestamp: new Date().toISOString() 
          }
        })

      toast({
        title: `Withdrawal ${approve ? 'Approved' : 'Rejected'}`,
        description: `Withdrawal request has been ${newStatus}`,
        variant: approve ? "default" : "destructive"
      })

      setIsProcessOpen(false)
      setSelectedWithdrawal(null)
      setAdminNotes("")
      fetchWithdrawals()
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive"
      })
    }
  }

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = 
      withdrawal.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || withdrawal.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "approved":
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0)
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 text-red-400 mx-auto mb-4" />
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
        <div className="text-white text-xl">Loading withdrawals...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Withdrawal Management</h1>
              <p className="text-gray-300">Process and manage withdrawal requests</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            {stats.pending} Pending
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-gray-300 text-sm">Total Requests</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-gray-300 text-sm">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-gray-300 text-sm">Approved</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              <p className="text-gray-300 text-sm">Rejected</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">${stats.totalAmount.toLocaleString()}</p>
              <p className="text-gray-300 text-sm">Total Amount</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by user name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
                <Button 
                  onClick={fetchWithdrawals}
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawals Table */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              Withdrawal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">User</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Amount</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Requested</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">PIN Verified</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.length > 0 ? (
                    filteredWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">
                              {withdrawal.profiles?.full_name || 'No name'}
                            </p>
                            <p className="text-gray-400 text-sm">{withdrawal.profiles?.email}</p>
                            <p className="text-gray-400 text-xs">
                              Balance: ${withdrawal.profiles?.balance.toLocaleString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white font-medium text-lg">
                            ${withdrawal.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(withdrawal.status)}>
                            {getStatusIcon(withdrawal.status)}
                            <span className="ml-1 capitalize">{withdrawal.status}</span>
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300 text-sm">
                            {new Date(withdrawal.requested_at).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={withdrawal.pin_verified ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                            {withdrawal.pin_verified ? "Verified" : "Not Verified"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {withdrawal.status === 'pending' ? (
                            <Dialog open={isProcessOpen && selectedWithdrawal?.id === withdrawal.id} onOpenChange={(open) => {
                              setIsProcessOpen(open)
                              if (open) {
                                setSelectedWithdrawal(withdrawal)
                                setAdminNotes("")
                              } else {
                                setSelectedWithdrawal(null)
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Process
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-white/20 text-white">
                                <DialogHeader>
                                  <DialogTitle>Process Withdrawal Request</DialogTitle>
                                  <DialogDescription className="text-gray-300">
                                    Review and approve or reject this withdrawal request.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-400">User:</span>
                                        <span className="text-white ml-2">{withdrawal.profiles?.full_name || withdrawal.profiles?.email}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Amount:</span>
                                        <span className="text-white ml-2">${withdrawal.amount.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Current Balance:</span>
                                        <span className="text-white ml-2">${withdrawal.profiles?.balance.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">PIN Status:</span>
                                        <span className={`ml-2 ${withdrawal.pin_verified ? 'text-green-400' : 'text-red-400'}`}>
                                          {withdrawal.pin_verified ? 'Verified' : 'Not Verified'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-white text-sm font-medium">Admin Notes</label>
                                    <Textarea
                                      placeholder="Add notes about this decision..."
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      className="bg-white/10 border-white/20 text-white mt-1"
                                      rows={3}
                                    />
                                  </div>
                                  {withdrawal.profiles && withdrawal.amount > withdrawal.profiles.balance && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                      <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-red-400 text-sm font-medium">Insufficient Balance</p>
                                          <p className="text-red-300 text-xs mt-1">
                                            User balance (${withdrawal.profiles.balance.toLocaleString()}) is less than withdrawal amount (${withdrawal.amount.toLocaleString()})
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter className="space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handleProcessWithdrawal(false)}
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button 
                                    onClick={() => handleProcessWithdrawal(true)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                                    disabled={withdrawal.profiles && withdrawal.amount > withdrawal.profiles.balance}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="text-center">
                              <span className="text-gray-400 text-sm">
                                {withdrawal.processed_at ? 
                                  `Processed ${new Date(withdrawal.processed_at).toLocaleDateString()}` : 
                                  'Processed'
                                }
                              </span>
                              {withdrawal.admin_notes && (
                                <p className="text-gray-400 text-xs mt-1">
                                  Note: {withdrawal.admin_notes}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No withdrawal requests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
