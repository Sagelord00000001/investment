// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { supabase } from "@/lib/supabase"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { ArrowLeft, Key, RefreshCw, Trash2, Search, Shield, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'
// import { useToast } from "@/hooks/use-toast"

// type UserPin = {
//   id: string
//   user_id: string
//   email: string
//   full_name: string | null
//   pin_hash: string | null
//   pin_status: 'active' | 'pending' | 'revoked' | 'expired' | null
//   created_at: string
//   pin_last_used_at: string | null
//   pin_expires_at: string | null
//   pin_usage_count: number | null
// }

// export default function PinManagement() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedPin, setSelectedPin] = useState<UserPin | null>(null)
//   const [isRegenerateOpen, setIsRegenerateOpen] = useState(false)
//   const [isRevokeOpen, setIsRevokeOpen] = useState(false)
//   const [isGenerateOpen, setIsGenerateOpen] = useState(false)
//   const [pins, setPins] = useState<UserPin[]>([])
//   const [loading, setLoading] = useState(true)
//   const [rateLimited, setRateLimited] = useState(false)
//   const { toast } = useToast()

//   useEffect(() => {
//     fetchUserPins()
//   }, [])

//   const fetchUserPins = async () => {
//     try {
//       setLoading(true)
//       const { data, error } = await supabase
//         .from('profiles')
//         .select(`
//           id,
//           user_id: id,
//           email,
//           full_name,
//           pin_hash,
//           pin_status,
//           created_at,
//           pin_last_used_at,
//           pin_expires_at,
//           pin_usage_count
//         `)
//         .not('pin_hash', 'is', null)
//         .order('created_at', { ascending: false })

//       if (error) throw error
//       setPins(data as UserPin[] || [])
//     } catch (error) {
//       console.error("Fetch error:", error)
//       toast({
//         title: "Error",
//         description: "Failed to fetch PINs",
//         variant: "destructive"
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const generateRandomPin = (): string => {
//     return Math.floor(1000 + Math.random() * 9000).toString()
//   }

//   const handleGeneratePin = async (userId: string) => {
//     if (rateLimited) {
//       toast({
//         title: "Slow Down",
//         description: "Please wait before generating another PIN",
//         variant: "destructive"
//       })
//       return
//     }

//     try {
//       setRateLimited(true)
//       setTimeout(() => setRateLimited(false), 5000) // 5 second rate limit

//       const newPin = generateRandomPin()
//       const expiresAt = new Date()
//       expiresAt.setMonth(expiresAt.getMonth() + 6) // 6 months expiry

//       const { error } = await supabase
//         .from('profiles')
//         .update({
//           pin_hash: newPin, // Note: Hash this in production!
//           pin_status: 'active',
//           pin_expires_at: expiresAt.toISOString(),
//           pin_last_used_at: null,
//           pin_usage_count: 0
//         })
//         .eq('id', userId)

//       if (error) throw error

//       toast({
//         title: "PIN Generated",
//         description: `New PIN created successfully`,
//       })

//       fetchUserPins()
//       setIsGenerateOpen(false)
//     } catch (error) {
//       console.error("Generation error:", error)
//       toast({
//         title: "Error",
//         description: "Failed to generate PIN",
//         variant: "destructive"
//       })
//     }
//   }

//   const handleRegeneratePin = async () => {
//     if (!selectedPin || rateLimited) {
//       if (rateLimited) {
//         toast({
//           title: "Slow Down",
//           description: "Please wait before regenerating another PIN",
//           variant: "destructive"
//         })
//       }
//       return
//     }

//     try {
//       setRateLimited(true)
//       setTimeout(() => setRateLimited(false), 5000) // 5 second rate limit

//       const newPin = generateRandomPin()
//       const expiresAt = new Date()
//       expiresAt.setMonth(expiresAt.getMonth() + 6)

//       const { error } = await supabase
//         .from('profiles')
//         .update({
//           pin_hash: newPin,
//           pin_status: 'active',
//           pin_expires_at: expiresAt.toISOString(),
//           pin_last_used_at: null,
//           pin_usage_count: 0
//         })
//         .eq('id', selectedPin.user_id)

//       if (error) throw error

//       toast({
//         title: "PIN Regenerated",
//         description: `New PIN created successfully`,
//       })

//       fetchUserPins()
//       setIsRegenerateOpen(false)
//       setSelectedPin(null)
//     } catch (error) {
//       console.error("Regeneration error:", error)
//       toast({
//         title: "Error",
//         description: "Failed to regenerate PIN",
//         variant: "destructive"
//       })
//     }
//   }

//   const handleRevokePin = async () => {
//     if (!selectedPin || rateLimited) {
//       if (rateLimited) {
//         toast({
//           title: "Slow Down",
//           description: "Please wait before revoking another PIN",
//           variant: "destructive"
//         })
//       }
//       return
//     }

//     try {
//       setRateLimited(true)
//       setTimeout(() => setRateLimited(false), 5000) // 5 second rate limit

//       const { error } = await supabase
//         .from('profiles')
//         .update({
//           pin_status: 'revoked'
//         })
//         .eq('id', selectedPin.user_id)

//       if (error) throw error

//       toast({
//         title: "PIN Revoked",
//         description: `PIN revoked successfully`,
//       })

//       fetchUserPins()
//       setIsRevokeOpen(false)
//       setSelectedPin(null)
//     } catch (error) {
//       console.error("Revocation error:", error)
//       toast({
//         title: "Error",
//         description: "Failed to revoke PIN",
//         variant: "destructive"
//       })
//     }
//   }

//   const getStatusColor = (status: string | null) => {
//     switch (status) {
//       case "active": return "bg-green-500/20 text-green-400 border-green-500/30"
//       case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
//       case "expired": return "bg-red-500/20 text-red-400 border-red-500/30"
//       case "revoked": return "bg-gray-500/20 text-gray-400 border-gray-500/30"
//       default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
//     }
//   }

//   const getStatusIcon = (status: string | null) => {
//     switch (status) {
//       case "active": return <CheckCircle className="w-4 h-4" />
//       case "pending": return <Clock className="w-4 h-4" />
//       case "expired":
//       case "revoked": return <AlertTriangle className="w-4 h-4" />
//       default: return <Shield className="w-4 h-4" />
//     }
//   }

//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return "Never"
//     return new Date(dateString).toLocaleDateString()
//   }

//   const stats = [
//     {
//       title: "Total PINs",
//       value: pins.length,
//       icon: Key,
//       color: "from-blue-400 to-cyan-500"
//     },
//     {
//       title: "Active PINs",
//       value: pins.filter(pin => pin.pin_status === 'active').length,
//       icon: CheckCircle,
//       color: "from-green-400 to-emerald-500"
//     },
//     {
//       title: "Pending PINs",
//       value: pins.filter(pin => pin.pin_status === 'pending').length,
//       icon: Clock,
//       color: "from-yellow-400 to-orange-500"
//     },
//     {
//       title: "Expired/Revoked",
//       value: pins.filter(pin => ['expired', 'revoked'].includes(pin.pin_status || '')).length,
//       icon: AlertTriangle,
//       color: "from-red-400 to-pink-500"
//     }
//   ]

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
//         <div className="text-white">Loading PINs...</div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-4">
//             <Link href="/admin">
//               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
//                 <ArrowLeft className="w-5 h-5" />
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-3xl font-bold text-white">PIN Management</h1>
//               <p className="text-gray-300">Manage withdrawal PINs for users</p>
//             </div>
//           </div>
//           <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
//             {pins.length} PINs
//           </Badge>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid md:grid-cols-4 gap-6 mb-8">
//           {stats.map((stat, index) => (
//             <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-300 text-sm mb-1">{stat.title}</p>
//                     <p className="text-2xl font-bold text-white">{stat.value}</p>
//                   </div>
//                   <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
//                     <stat.icon className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Search and Generate Button */}
//         <div className="flex flex-col md:flex-row gap-4 mb-8">
//           <Card className="bg-white/5 backdrop-blur-md border-white/10 flex-grow">
//             <CardContent className="p-6">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <Input
//                   placeholder="Search by user name or email..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
//             <DialogTrigger asChild>
//               <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
//                 <Key className="w-4 h-4 mr-2" />
//                 Generate New PIN
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="bg-slate-800 border-white/20 text-white">
//               <DialogHeader>
//                 <DialogTitle>Generate New PIN</DialogTitle>
//                 <DialogDescription className="text-gray-300">
//                   Select a user to generate a new withdrawal PIN
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 {pins.length === 0 ? (
//                   <div className="text-center py-4 text-gray-400">
//                     No users available
//                   </div>
//                 ) : (
//                   <div className="max-h-96 overflow-y-auto">
//                     {pins.map((user) => (
//                       <div 
//                         key={user.id} 
//                         className="p-3 hover:bg-white/5 rounded-lg cursor-pointer"
//                         onClick={() => {
//                           handleGeneratePin(user.user_id)
//                           setIsGenerateOpen(false)
//                         }}
//                       >
//                         <p className="text-white">{user.full_name || user.email}</p>
//                         <p className="text-gray-400 text-sm">{user.email}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* PINs Table */}
//         <Card className="bg-white/5 backdrop-blur-md border-white/10">
//           <CardHeader>
//             <CardTitle className="text-white flex items-center">
//               <Key className="w-6 h-6 mr-2" />
//               User PIN Directory
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {pins.length === 0 ? (
//               <div className="text-center py-12">
//                 <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
//                 <p className="text-gray-400">No PINs have been generated yet</p>
//                 <Button 
//                   onClick={() => setIsGenerateOpen(true)}
//                   className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
//                 >
//                   Generate First PIN
//                 </Button>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-white/10">
//                       <th className="text-left py-4 px-4">User</th>
//                       <th className="text-left py-4 px-4">Status</th>
//                       <th className="text-left py-4 px-4">Created</th>
//                       <th className="text-left py-4 px-4">Last Used</th>
//                       <th className="text-left py-4 px-4">Expires</th>
//                       <th className="text-left py-4 px-4">Usage</th>
//                       <th className="text-left py-4 px-4">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {pins
//                       .filter(pin => 
//                         pin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                         pin.email.toLowerCase().includes(searchTerm.toLowerCase())
//                       )
//                       .map((pin) => (
//                         <tr key={pin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
//                           <td className="py-4 px-4">
//                             <div>
//                               <p className="text-white font-medium">{pin.full_name || "No name"}</p>
//                               <p className="text-gray-400 text-sm">{pin.email}</p>
//                             </div>
//                           </td>
//                           <td className="py-4 px-4">
//                             <Badge className={getStatusColor(pin.pin_status)}>
//                               {getStatusIcon(pin.pin_status)}
//                               <span className="ml-1 capitalize">{pin.pin_status || "unknown"}</span>
//                             </Badge>
//                           </td>
//                           <td className="py-4 px-4">
//                             <span className="text-gray-300">{formatDate(pin.created_at)}</span>
//                           </td>
//                           <td className="py-4 px-4">
//                             <span className="text-gray-300">{formatDate(pin.pin_last_used_at)}</span>
//                           </td>
//                           <td className="py-4 px-4">
//                             <span className="text-gray-300">{formatDate(pin.pin_expires_at)}</span>
//                           </td>
//                           <td className="py-4 px-4">
//                             <span className="text-white">{pin.pin_usage_count || 0} times</span>
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="flex items-center space-x-2">
//                               <Dialog 
//                                 open={isRegenerateOpen && selectedPin?.id === pin.id} 
//                                 onOpenChange={(open) => {
//                                   setIsRegenerateOpen(open)
//                                   setSelectedPin(open ? pin : null)
//                                 }}
//                               >
//                                 <DialogTrigger asChild>
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-green-500/30 text-green-400 hover:bg-green-500/10"
//                                   >
//                                     <RefreshCw className="w-3 h-3 mr-1" />
//                                     Regenerate
//                                   </Button>
//                                 </DialogTrigger>
//                                 <DialogContent className="bg-slate-800 border-white/20 text-white">
//                                   <DialogHeader>
//                                     <DialogTitle>Regenerate PIN</DialogTitle>
//                                     <DialogDescription className="text-gray-300">
//                                       This will generate a new PIN for {pin.full_name || pin.email}
//                                     </DialogDescription>
//                                   </DialogHeader>
//                                   <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
//                                     <div className="flex items-start space-x-3">
//                                       <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
//                                       <div>
//                                         <p className="text-yellow-400 text-sm font-medium">Warning</p>
//                                         <p className="text-yellow-300 text-xs mt-1">
//                                           The user will need to use the new PIN for all future withdrawals.
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                   <DialogFooter>
//                                     <Button 
//                                       variant="outline" 
//                                       onClick={() => setIsRegenerateOpen(false)} 
//                                       className="border-white/20 text-white hover:bg-white/10"
//                                     >
//                                       Cancel
//                                     </Button>
//                                     <Button 
//                                       onClick={handleRegeneratePin} 
//                                       className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
//                                       disabled={rateLimited}
//                                     >
//                                       {rateLimited ? "Please wait..." : "Confirm Regenerate"}
//                                     </Button>
//                                   </DialogFooter>
//                                 </DialogContent>
//                               </Dialog>

//                               <Dialog 
//                                 open={isRevokeOpen && selectedPin?.id === pin.id} 
//                                 onOpenChange={(open) => {
//                                   setIsRevokeOpen(open)
//                                   setSelectedPin(open ? pin : null)
//                                 }}
//                               >
//                                 <DialogTrigger asChild>
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-red-500/30 text-red-400 hover:bg-red-500/10"
//                                     disabled={pin.pin_status === 'revoked'}
//                                   >
//                                     <Trash2 className="w-3 h-3 mr-1" />
//                                     Revoke
//                                   </Button>
//                                 </DialogTrigger>
//                                 <DialogContent className="bg-slate-800 border-white/20 text-white">
//                                   <DialogHeader>
//                                     <DialogTitle>Revoke PIN</DialogTitle>
//                                     <DialogDescription className="text-gray-300">
//                                       This will revoke the PIN for {pin.full_name || pin.email}
//                                     </DialogDescription>
//                                   </DialogHeader>
//                                   <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
//                                     <div className="flex items-start space-x-3">
//                                       <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
//                                       <div>
//                                         <p className="text-red-400 text-sm font-medium">Permanent Action</p>
//                                         <p className="text-red-300 text-xs mt-1">
//                                           The user will lose withdrawal access until a new PIN is generated.
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                   <DialogFooter>
//                                     <Button 
//                                       variant="outline" 
//                                       onClick={() => setIsRevokeOpen(false)} 
//                                       className="border-white/20 text-white hover:bg-white/10"
//                                     >
//                                       Cancel
//                                     </Button>
//                                     <Button 
//                                       onClick={handleRevokePin} 
//                                       className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
//                                       disabled={rateLimited}
//                                     >
//                                       {rateLimited ? "Please wait..." : "Confirm Revoke"}
//                                     </Button>
//                                   </DialogFooter>
//                                 </DialogContent>
//                               </Dialog>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Key, RefreshCw, Trash2, Search, Shield, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

type UserPin = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  pin_hash: string | null
  pin_status: 'active' | 'pending' | 'revoked' | 'expired' | null
  created_at: string
  pin_last_used_at: string | null
  pin_expires_at: string | null
  pin_usage_count: number | null
}

type User = {
  id: string
  email: string
  full_name: string | null
}

export default function PinManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPin, setSelectedPin] = useState<UserPin | null>(null)
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false)
  const [isRevokeOpen, setIsRevokeOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [pins, setPins] = useState<UserPin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [rateLimited, setRateLimited] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserPins()
    fetchAllUsers()
  }, [])

  const fetchUserPins = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id: id,
          email,
          full_name,
          pin_hash,
          pin_status,
          created_at,
          pin_last_used_at,
          pin_expires_at,
          pin_usage_count
        `)
        .not('pin_hash', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPins(data as UserPin[] || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch PINs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data as User[] || [])
    } catch (error) {
      console.error("Fetch users error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    }
  }

  const generateRandomPin = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  const handleGeneratePin = async (userId: string) => {
    if (rateLimited) {
      toast({
        title: "Slow Down",
        description: "Please wait before generating another PIN",
        variant: "destructive"
      })
      return
    }

    try {
      setRateLimited(true)
      setTimeout(() => setRateLimited(false), 5000) // 5 second rate limit

      const newPin = generateRandomPin()
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 6) // 6 months expiry

      // In production, you should hash the PIN before storing it
      const { error } = await supabase
        .from('profiles')
        .update({
          pin_hash: newPin,
          pin_status: 'active',
          pin_expires_at: expiresAt.toISOString(),
          pin_last_used_at: null,
          pin_usage_count: 0
        })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "PIN Generated",
        description: `New PIN created successfully for user`,
      })

      fetchUserPins()
      setIsGenerateOpen(false)
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate PIN",
        variant: "destructive"
      })
    }
  }

  const handleRegeneratePin = async () => {
    if (!selectedPin || rateLimited) {
      if (rateLimited) {
        toast({
          title: "Slow Down",
          description: "Please wait before regenerating another PIN",
          variant: "destructive"
        })
      }
      return
    }

    try {
      setRateLimited(true)
      setTimeout(() => setRateLimited(false), 5000) // 5 second rate limit

      const newPin = generateRandomPin()
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 6)

      const { error } = await supabase
        .from('profiles')
        .update({
          pin_hash: newPin,
          pin_status: 'active',
          pin_expires_at: expiresAt.toISOString(),
          pin_last_used_at: null,
          pin_usage_count: 0
        })
        .eq('id', selectedPin.user_id)

      if (error) throw error

      toast({
        title: "PIN Regenerated",
        description: `New PIN created successfully for ${selectedPin.full_name || selectedPin.email}`,
      })

      fetchUserPins()
      setIsRegenerateOpen(false)
      setSelectedPin(null)
    } catch (error) {
      console.error("Regeneration error:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate PIN",
        variant: "destructive"
      })
    }
  }

  const handleRevokePin = async () => {
    if (!selectedPin || rateLimited) {
      if (rateLimited) {
        toast({
          title: "Slow Down",
          description: "Please wait before revoking another PIN",
          variant: "destructive"
        })
      }
      return
    }

    try {
      setRateLimited(true)
      setTimeout(() => setRateLimited(false), 5000) // 5 second rate limit

      const { error } = await supabase
        .from('profiles')
        .update({
          pin_status: 'revoked'
        })
        .eq('id', selectedPin.user_id)

      if (error) throw error

      toast({
        title: "PIN Revoked",
        description: `PIN revoked successfully for ${selectedPin.full_name || selectedPin.email}`,
      })

      fetchUserPins()
      setIsRevokeOpen(false)
      setSelectedPin(null)
    } catch (error) {
      console.error("Revocation error:", error)
      toast({
        title: "Error",
        description: "Failed to revoke PIN",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "expired": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "revoked": return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4" />
      case "pending": return <Clock className="w-4 h-4" />
      case "expired":
      case "revoked": return <AlertTriangle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  const stats = [
    {
      title: "Total PINs",
      value: pins.length,
      icon: Key,
      color: "from-blue-400 to-cyan-500"
    },
    {
      title: "Active PINs",
      value: pins.filter(pin => pin.pin_status === 'active').length,
      icon: CheckCircle,
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "Pending PINs",
      value: pins.filter(pin => pin.pin_status === 'pending').length,
      icon: Clock,
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Expired/Revoked",
      value: pins.filter(pin => ['expired', 'revoked'].includes(pin.pin_status || '')).length,
      icon: AlertTriangle,
      color: "from-red-400 to-pink-500"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading PINs...</div>
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
              <h1 className="text-3xl font-bold text-white">PIN Management</h1>
              <p className="text-gray-300">Manage withdrawal PINs for users</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            {pins.length} PINs
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10">
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

        {/* Search and Generate Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 flex-grow">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                <Key className="w-4 h-4 mr-2" />
                Generate New PIN
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Generate New PIN</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Select a user to generate a new withdrawal PIN
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No users available
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {users
                      .filter(user => 
                        !pins.some(pin => pin.user_id === user.id) || 
                        pins.some(pin => pin.user_id === user.id && ['revoked', 'expired'].includes(pin.pin_status || ''))
                      )
                      .map((user) => (
                        <div 
                          key={user.id} 
                          className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            handleGeneratePin(user.id)
                            setIsGenerateOpen(false)
                          }}
                        >
                          <div>
                            <p className="text-white">{user.full_name || user.email}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                          {pins.some(pin => pin.user_id === user.id && pin.pin_status === 'active') ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Has Active PIN
                            </Badge>
                          ) : pins.some(pin => pin.user_id === user.id) ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Has Expired/Revoked PIN
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              No PIN
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* PINs Table */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Key className="w-6 h-6 mr-2" />
              User PIN Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pins.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400">No PINs have been generated yet</p>
                <Button 
                  onClick={() => setIsGenerateOpen(true)}
                  className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Generate First PIN
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4">User</th>
                      <th className="text-left py-4 px-4">Status</th>
                      <th className="text-left py-4 px-4">Created</th>
                      <th className="text-left py-4 px-4">Last Used</th>
                      <th className="text-left py-4 px-4">Expires</th>
                      <th className="text-left py-4 px-4">Usage</th>
                      <th className="text-left py-4 px-4">Pin</th>
                      <th className="text-left py-4 px-4">Actions</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {pins
                      .filter(pin => 
                        pin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        pin.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((pin) => (
                        <tr key={pin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-white font-medium">{pin.full_name || "No name"}</p>
                              <p className="text-gray-400 text-sm">{pin.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(pin.pin_status)}>
                              {getStatusIcon(pin.pin_status)}
                              <span className="ml-1 capitalize">{pin.pin_status || "unknown"}</span>
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300">{formatDate(pin.created_at)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300">{formatDate(pin.pin_last_used_at)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300">{formatDate(pin.pin_expires_at)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white">{pin.pin_usage_count || 0} times</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white">{pin.pin_hash}</span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Dialog 
                                open={isRegenerateOpen && selectedPin?.id === pin.id} 
                                onOpenChange={(open) => {
                                  setIsRegenerateOpen(open)
                                  setSelectedPin(open ? pin : null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Regenerate
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-white/20 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Regenerate PIN</DialogTitle>
                                    <DialogDescription className="text-gray-300">
                                      This will generate a new PIN for {pin.full_name || pin.email}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-yellow-400 text-sm font-medium">Warning</p>
                                        <p className="text-yellow-300 text-xs mt-1">
                                          The user will need to use the new PIN for all future withdrawals.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setIsRegenerateOpen(false)} 
                                      className="border-white/20 text-white hover:bg-white/10"
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={handleRegeneratePin} 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                                      disabled={rateLimited}
                                    >
                                      {rateLimited ? "Please wait..." : "Confirm Regenerate"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog 
                                open={isRevokeOpen && selectedPin?.id === pin.id} 
                                onOpenChange={(open) => {
                                  setIsRevokeOpen(open)
                                  setSelectedPin(open ? pin : null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    disabled={pin.pin_status === 'revoked'}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Revoke
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-white/20 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Revoke PIN</DialogTitle>
                                    <DialogDescription className="text-gray-300">
                                      This will revoke the PIN for {pin.full_name || pin.email}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-red-400 text-sm font-medium">Permanent Action</p>
                                        <p className="text-red-300 text-xs mt-1">
                                          The user will lose withdrawal access until a new PIN is generated.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setIsRevokeOpen(false)} 
                                      className="border-white/20 text-white hover:bg-white/10"
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={handleRevokePin} 
                                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                                      disabled={rateLimited}
                                    >
                                      {rateLimited ? "Please wait..." : "Confirm Revoke"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
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