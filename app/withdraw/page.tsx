"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

export default function WithdrawPage() {
  const [pin, setPin] = useState("")
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to continue",
        variant: "destructive"
      })
      return
    }

    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Fetch user's PIN from database (plaintext during development)
      const { data, error } = await supabase
        .from('profiles')
        .select('pin_hash, pin_status')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        throw error || new Error("User profile not found")
      }

      // Check if PIN is active
      if (data.pin_status !== 'active') {
        toast({
          title: "PIN Not Active",
          description: "Your withdrawal PIN is not active. Please contact support.",
          variant: "destructive"
        })
        return
      }

      // Direct comparison during development (no hashing)
      if (pin === data.pin_hash) {
        setIsPinVerified(true)
        toast({
          title: "PIN Verified",
          description: "Access granted to withdrawal section",
        })
      } else {
        toast({
          title: "Invalid PIN",
          description: "Please enter the correct 4-digit PIN",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("PIN verification error:", error)
      toast({
        title: "Verification Failed",
        description: "Could not verify your PIN. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value)
    }
  }

  if (!isPinVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 absolute top-8 left-8">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <Card className="bg-black/40 backdrop-blur-md border border-red-500/30 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Secure Access Required
              </CardTitle>
              <p className="text-gray-300 text-sm">
                Enter your 4-digit PIN to access withdrawal functions
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-white text-center block">
                    Security PIN
                  </Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      type="password"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => handlePinChange(e.target.value)}
                      className="bg-white/10 border-red-500/30 text-white text-center text-2xl tracking-widest placeholder:text-gray-500 focus:border-red-400 focus:ring-red-400/20"
                      maxLength={4}
                      autoComplete="off"
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 py-3 text-lg font-semibold"
                  disabled={pin.length !== 4 || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Verify PIN
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Security Notice</p>
                    <p className="text-yellow-300 text-xs mt-1">
                      Your PIN is required for all withdrawal operations. Never share your PIN with anyone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-gray-400 text-xs hover:text-gray-300"
                  onClick={() => {
                    toast({
                      title: "Contact Support",
                      description: "Please contact support to reset your withdrawal PIN",
                    })
                  }}
                >
                  Forgot PIN?
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Withdrawal Center</h1>
              <p className="text-gray-300">Secure withdrawal management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">PIN Verified</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Withdrawal Status */}
          <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md border border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-400" />
                Withdrawal Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Lock className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Withdrawals Temporarily Disabled
                </h3>
                <p className="text-gray-300 mb-6">
                  Our withdrawal system is currently under maintenance for security upgrades. 
                  Please contact our support team for assistance with your withdrawal request.
                </p>
                
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    View Withdrawal History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Available Balance</span>
                  <span className="text-2xl font-bold text-white">$15,750.50</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Pending Withdrawals</span>
                  <span className="text-lg font-semibold text-orange-400">$0.00</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Total Withdrawn</span>
                  <span className="text-lg font-semibold text-green-400">$2,450.00</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">Security Features</h4>
                <ul className="space-y-2 text-sm text-blue-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    PIN-protected access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Email verification required
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    24-hour processing delay
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Admin approval system
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Information */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-medium mb-2">24/7 Support</h4>
                <p className="text-gray-300 text-sm">Our support team is available around the clock</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-medium mb-2">Secure Process</h4>
                <p className="text-gray-300 text-sm">All withdrawals are processed securely</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-medium mb-2">Fast Resolution</h4>
                <p className="text-gray-300 text-sm">Quick response to all withdrawal requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}