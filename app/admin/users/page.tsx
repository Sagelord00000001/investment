"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Users, Key, Mail, Edit, Trash2, Plus, Search, Filter, Shield, DollarSign } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  balance: number
  pin_status: 'pending' | 'active' | 'expired' | 'revoked'
  created_at: string
  last_login: string | null
  status: string
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isGeneratePinOpen, setIsGeneratePinOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [editBalance, setEditBalance] = useState("")
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user')
  const [users, setUsers] = useState<User[]>([])
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
      fetchUsers()
    }
  }, [user, profile, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGeneratePin = async () => {
    if (!selectedUser || newPin.length !== 4) {
      toast({
        title: "Error",
        description: "Please enter a valid 4-digit PIN",
        variant: "destructive"
      })
      return
    }

    try {
      // Hash the PIN before storing (in production, use proper hashing)
      const pinHash = btoa(newPin) // Simple encoding for demo

      const { error } = await supabase
        .from('profiles')
        .update({ 
          pin_hash: pinHash,
          pin_status: 'active' 
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: selectedUser.id,
          action: 'pin_generated',
          details: { admin_id: user?.id, timestamp: new Date().toISOString() }
        })

      toast({
        title: "PIN Generated",
        description: `New PIN generated for ${selectedUser.full_name || selectedUser.email}`,
      })

      setIsGeneratePinOpen(false)
      setNewPin("")
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error generating PIN:', error)
      toast({
        title: "Error",
        description: "Failed to generate PIN",
        variant: "destructive"
      })
    }
  }

  const handleSendPin = async (user: User) => {
    try {
      // In a real app, this would send an email
      toast({
        title: "PIN Sent",
        description: `PIN notification sent to ${user.email}`,
      })

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'pin_sent',
          details: { admin_id: user?.id, timestamp: new Date().toISOString() }
        })
    } catch (error) {
      console.error('Error sending PIN:', error)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const balance = parseFloat(editBalance)
      if (isNaN(balance)) {
        toast({
          title: "Error",
          description: "Please enter a valid balance amount",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          balance: balance,
          role: editRole
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: selectedUser.id,
          action: 'user_updated',
          details: { 
            admin_id: user?.id, 
            changes: { balance, role: editRole },
            timestamp: new Date().toISOString() 
          }
        })

      toast({
        title: "User Updated",
        description: `User information updated successfully`,
      })

      setIsEditUserOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPinStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "expired":
      case "revoked":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "user":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

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
        <div className="text-white text-xl">Loading users...</div>
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
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-gray-300">Manage users, balances, and PIN access</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            {filteredUsers.length} Users
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={fetchUsers}
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

        {/* Users Table */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              User Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">User</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Balance</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">PIN Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Joined</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">
                          ${Number(user.balance).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getPinStatusColor(user.pin_status)}>
                          {user.pin_status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-300 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Dialog open={isEditUserOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setIsEditUserOpen(open)
                            if (open) {
                              setSelectedUser(user)
                              setEditBalance(user.balance.toString())
                              setEditRole(user.role)
                            } else {
                              setSelectedUser(null)
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-white/20 text-white">
                              <DialogHeader>
                                <DialogTitle>Edit User: {user.full_name || user.email}</DialogTitle>
                                <DialogDescription className="text-gray-300">
                                  Update user information and permissions.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="balance" className="text-white">Balance ($)</Label>
                                  <Input
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    value={editBalance}
                                    onChange={(e) => setEditBalance(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="role" className="text-white">Role</Label>
                                  <Select value={editRole} onValueChange={(value: 'user' | 'admin') => setEditRole(value)}>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                      <SelectItem value="user" className="text-white">User</SelectItem>
                                      <SelectItem value="admin" className="text-white">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditUserOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateUser} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">
                                  Update User
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isGeneratePinOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setIsGeneratePinOpen(open)
                            if (open) setSelectedUser(user)
                            else setSelectedUser(null)
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              >
                                <Key className="w-3 h-3 mr-1" />
                                PIN
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-white/20 text-white">
                              <DialogHeader>
                                <DialogTitle>Generate PIN for {user.full_name || user.email}</DialogTitle>
                                <DialogDescription className="text-gray-300">
                                  Create a new 4-digit security PIN for this user.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="pin" className="text-white">4-Digit PIN</Label>
                                  <Input
                                    id="pin"
                                    type="text"
                                    placeholder="1234"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="bg-white/10 border-white/20 text-white text-center text-lg tracking-widest mt-1"
                                    maxLength={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsGeneratePinOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                                  Cancel
                                </Button>
                                <Button onClick={handleGeneratePin} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                                  Generate PIN
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendPin(user)}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Send
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-gray-300 text-sm">Total Users</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                ${users.reduce((sum, user) => sum + Number(user.balance), 0).toLocaleString()}
              </p>
              <p className="text-gray-300 text-sm">Total Balance</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => user.pin_status === 'active').length}
              </p>
              <p className="text-gray-300 text-sm">Active PINs</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => user.role === 'admin').length}
              </p>
              <p className="text-gray-300 text-sm">Administrators</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
