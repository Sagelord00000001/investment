"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, Target, Clock } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

type InvestmentPlan = {
  id: string
  name: string
  description: string
  plan_type: 'fixed' | 'monthly' | 'custom'
  min_amount: number
  max_amount: number
  duration_days: number
  expected_returns: number
  risk_level: string
  is_active: boolean
}

type Investment = {
  id: string
  user_id: string
  plan_id: string
  amount: number
  status: 'active' | 'completed' | 'cancelled'
  returns_percentage: number | null
  start_date: string
  end_date: string | null
  created_at: string
  investment_plans: {
    name: string
    plan_type: 'fixed' | 'monthly' | 'custom'
  }
}

export default function InvestPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([])
  const [userInvestments, setUserInvestments] = useState<Investment[]>([])
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchInvestmentPlans(),
      fetchUserInvestments(),
      fetchUserBalance()
    ])
    setLoading(false)
  }

  const fetchInvestmentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw error
      setInvestmentPlans(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch investment plans",
        variant: "destructive"
      })
    }
  }

  const fetchUserInvestments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_plans:plan_id (name, plan_type)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUserInvestments(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch investments",
        variant: "destructive"
      })
    }
  }

  const fetchUserBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserBalance(data?.balance || 0)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch balance",
        variant: "destructive"
      })
    }
  }

  const handleInvestment = async () => {
    if (!selectedPlan || !amount) {
      toast({
        title: "Error",
        description: "Please select a plan and enter an amount",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error(authError?.message || "Not authenticated")

      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount)) throw new Error("Invalid amount")
      if (numericAmount > userBalance) throw new Error("Insufficient funds")

      const plan = investmentPlans.find(p => p.name === selectedPlan)
      if (!plan || !plan.id) throw new Error("Selected plan not found")

      if (numericAmount < plan.min_amount || numericAmount > plan.max_amount) {
        throw new Error(`Amount must be between $${plan.min_amount} and $${plan.max_amount}`)
      }

      // Create transaction
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          amount: numericAmount,
          status: 'active',
          returns_percentage: plan.expected_returns,
          start_date: new Date().toISOString()
        })

      if (investmentError) throw investmentError

      // Update balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: userBalance - numericAmount })
        .eq('id', user.id)

      if (balanceError) throw balanceError

      // Success
      toast({
        title: "Investment Successful!",
        description: `$${numericAmount.toFixed(2)} invested in ${plan.name} (${plan.plan_type} plan). New balance: $${(userBalance - numericAmount).toFixed(2)}`,
      })

      // Refresh data
      await fetchData()
      setIsConfirmOpen(false)
      setAmount("")
      setSelectedPlan("")

    } catch (error) {
      console.error("Investment error:", error)
      const errorMessage = error instanceof Error ? error.message : "Investment failed"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getReturnsColor = (returns: number | null) => {
    if (returns === null) return "text-gray-400"
    return returns >= 0 ? "text-green-400" : "text-red-400"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Investment Center</h1>
              <p className="text-gray-300">Balance: ${userBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  New Investment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="plan" className="text-white mb-2 block">Investment Plan</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select an investment plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {investmentPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.name} className="text-white hover:bg-white/10">
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-gray-400">{plan.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlan && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    {investmentPlans.map((plan) => 
                      plan.name === selectedPlan && (
                        <div key={plan.id} className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Min Amount:</span>
                            <span className="text-white ml-2">${plan.min_amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Max Amount:</span>
                            <span className="text-white ml-2">${plan.max_amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white ml-2">{plan.duration_days} days</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Expected Returns:</span>
                            <span className="text-green-400 ml-2">{plan.expected_returns}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Risk Level:</span>
                            <span className="text-white ml-2 capitalize">{plan.risk_level}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Plan Type:</span>
                            <span className="text-white ml-2 capitalize">{plan.plan_type}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="amount" className="text-white mb-2 block">Investment Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 py-3"
                      disabled={!selectedPlan || !amount}
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Invest Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-white/20 text-white">
                    <DialogHeader>
                      <DialogTitle>Confirm Investment</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Please review your investment details before confirming.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-white">{selectedPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan Type:</span>
                        <span className="text-white capitalize">
                          {investmentPlans.find(p => p.name === selectedPlan)?.plan_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">${amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Balance:</span>
                        <span className="text-white">${userBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">New Balance:</span>
                        <span className="text-white">
                          ${(userBalance - parseFloat(amount || '0')).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                        Cancel
                      </Button>
                      <Button onClick={handleInvestment} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                        Confirm Investment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Available Plans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investmentPlans.map((plan) => (
                  <div key={plan.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <h4 className="font-semibold text-white mb-2">{plan.name}</h4>
                    <p className="text-gray-300 text-sm mb-3">{plan.description}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white capitalize">{plan.plan_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Returns:</span>
                        <span className="text-green-400">{plan.expected_returns}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{plan.duration_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk:</span>
                        <span className="text-white capitalize">{plan.risk_level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Your Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userInvestments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                You don't have any investments yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Start Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Returns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userInvestments.map((investment) => (
                      <tr key={investment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-white">
                          {investment.investment_plans?.name || "Unknown Plan"}
                        </td>
                        <td className="py-4 px-4 text-white capitalize">
                          {investment.investment_plans?.plan_type || "-"}
                        </td>
                        <td className="py-4 px-4 text-white">
                          ${investment.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {formatDate(investment.start_date)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(investment.status)}>
                            {investment.status}
                          </Badge>
                        </td>
                        <td className={`py-4 px-4 font-medium ${getReturnsColor(investment.returns_percentage)}`}>
                          {investment.returns_percentage ? `${investment.returns_percentage}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}