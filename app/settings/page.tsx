"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, User, Mail, Shield, Key, LogOut, Edit, Save, Eye, EyeOff } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isUpdatePinOpen, setIsUpdatePinOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: ""
  })

  useEffect(() => {
    if (!user || !profile) {
      router.push('/')
      return
    }

    // Initialize form data with user profile
    setFormData({
      name: profile.full_name || "",
      email: user.email || "",
      avatar: profile.avatar_url || ""
    })
    setLoading(false)
  }, [user, profile, router])

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.name,
          avatar_url: formData.avatar 
        })
        .eq('id', user?.id)

      if (error) throw error

      setIsEditingProfile(false)
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  const handlePinUpdate = async () => {
    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "PINs do not match. Please try again.",
        variant: "destructive"
      })
      return
    }

    if (newPin.length !== 4) {
      toast({
        title: "Error",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pin: newPin })
        .eq('id', user?.id)

      if (error) throw error

      setIsUpdatePinOpen(false)
      setNewPin("")
      setConfirmPin("")
      toast({
        title: "PIN Updated",
        description: "Your security PIN has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PIN",
        variant: "destructive"
      })
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
              <h1 className="text-3xl font-bold text-white">Account Settings</h1>
              <p className="text-gray-300">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Profile Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                >
                  {isEditingProfile ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditingProfile ? "Save" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-20 h-20 border-2 border-white/20">
                    <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-2xl">
                      {formData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-white">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="bg-white/10 border-white/20 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-white">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            disabled
                            className="bg-white/10 border-white/20 text-white mt-1 opacity-70"
                          />
                        </div>
                        <div>
                          <Label htmlFor="avatar" className="text-white">Avatar URL</Label>
                          <Input
                            id="avatar"
                            value={formData.avatar}
                            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                            className="bg-white/10 border-white/20 text-white mt-1"
                          />
                        </div>
                        <Button 
                          onClick={handleProfileUpdate} 
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                        >
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white">{formData.name}</h3>
                        <p className="text-gray-300 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {formData.email}
                        </p>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          {profile.role === 'admin' ? 'Administrator' : 'Premium User'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">Security PIN</p>
                      <p className="text-gray-300 text-sm">4-digit PIN for withdrawals</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-mono text-lg">
                      {showPin ? profile.pin_hash || "1234" : "••••"}
                    </span>
                    {profile.pin_hash && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPin(!showPin)}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    )}
                    <Dialog open={isUpdatePinOpen} onOpenChange={setIsUpdatePinOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                          {profile.pin_hash ? "Update PIN" : "Set PIN"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-white/20 text-white">
                        <DialogHeader>
                          <DialogTitle>{profile.pin_hash ? "Update Security PIN" : "Set Security PIN"}</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Enter a new 4-digit PIN for your account security.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="newPin" className="text-white">New PIN</Label>
                            <Input
                              id="newPin"
                              type="password"
                              placeholder="••••"
                              value={newPin}
                              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              className="bg-white/10 border-white/20 text-white text-center text-lg tracking-widest mt-1"
                              maxLength={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPin" className="text-white">Confirm PIN</Label>
                            <Input
                              id="confirmPin"
                              type="password"
                              placeholder="••••"
                              value={confirmPin}
                              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              className="bg-white/10 border-white/20 text-white text-center text-lg tracking-widest mt-1"
                              maxLength={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsUpdatePinOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                            Cancel
                          </Button>
                          <Button onClick={handlePinUpdate} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                            {profile.pin_hash ? "Update PIN" : "Set PIN"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-medium">Account Security Status</p>
                      <p className="text-green-300 text-sm">
                        {profile.pin_hash ? "Your account is secured with PIN protection" : "Add a PIN for additional security"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Member Since</span>
                    <span className="text-white">
                      {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Last Login</span>
                    <span className="text-white">Recently</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Account Status</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Verification</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/invest">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                    Make Investment
                  </Button>
                </Link>
                <Link href="/withdraw">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Withdraw Funds
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                  Help Center
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                  Contact Support
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                  Terms of Service
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}