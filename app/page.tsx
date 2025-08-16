"use client"

import { useEffect, useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Settings, TrendingUp, ArrowRight, Users, BarChart3, Target, PieChart } from 'lucide-react'
import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (showAuth) {
    return <AuthForm onSuccess={() => setShowAuth(false)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Professional Financial Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Currency symbols */}
        <div className="absolute top-20 left-20 text-9xl text-white/[0.02] font-bold">$</div>
        <div className="absolute top-40 right-32 text-7xl text-white/[0.02] font-bold">₿</div>
        <div className="absolute bottom-40 left-40 text-8xl text-white/[0.02] font-bold">€</div>
        <div className="absolute bottom-20 right-20 text-6xl text-white/[0.02] font-bold">¥</div>
        <div className="absolute top-1/2 left-10 text-4xl text-white/[0.02] font-bold">£</div>
        <div className="absolute top-1/3 right-10 text-4xl text-white/[0.02] font-bold">₹</div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  InvestPro
                </span>
                <div className="text-xs text-gray-400">Smart Investment Platform</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 border border-white/20"
                onClick={() => setShowAuth(true)}
              >
                Log In
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-purple-500/25"
                onClick={() => setShowAuth(true)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm mb-6">
                <Shield className="w-4 h-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-300">SECURE INVESTMENT PLATFORM</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="text-white">Smart Investing</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Invest safely and grow your portfolio with advanced tools, secure PIN-gated withdrawals, 
              and real-time balance tracking. Professional-grade investment platform for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 px-12 py-6 text-lg font-semibold shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
                onClick={() => setShowAuth(true)}
              >
                <TrendingUp className="mr-3 w-6 h-6" />
                Start Investing
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/20 text-white hover:bg-white/10 px-12 py-6 text-lg font-semibold backdrop-blur-sm"
                onClick={() => setShowAuth(true)}
              >
                <Users className="mr-3 w-6 h-6" />
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">$2.4M+</div>
                <div className="text-gray-400 text-sm">Total Invested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">15K+</div>
                <div className="text-gray-400 text-sm">Active Investors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400 text-sm">Platform Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Customer Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Professional Investment Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to grow your wealth with confidence and security
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Bank-Level Security</h3>
                <p className="text-gray-300 leading-relaxed">Military-grade encryption with multi-factor authentication and secure data storage for complete peace of mind.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/25">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">PIN-Protected Withdrawals</h3>
                <p className="text-gray-300 leading-relaxed">Advanced PIN verification system for all withdrawal operations, ensuring only you can access your funds.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Admin-Controlled System</h3>
                <p className="text-gray-300 leading-relaxed">Comprehensive admin controls with detailed user management and professional oversight tools.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-orange-500/50 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/25">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-Time Analytics</h3>
                <p className="text-gray-300 leading-relaxed">Live portfolio tracking with professional-grade charts and detailed performance metrics.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-green-500/50 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/25">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Multiple Investment Plans</h3>
                <p className="text-gray-300 leading-relaxed">Choose from Fixed, Monthly, and Custom plans tailored to your investment goals and risk tolerance.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-yellow-500/50 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-500/25">
                  <PieChart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Portfolio Management</h3>
                <p className="text-gray-300 leading-relaxed">Advanced portfolio management tools with automatic rebalancing and performance optimization.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started with InvestPro in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg shadow-purple-500/25">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Create Account</h3>
              <p className="text-gray-300 leading-relaxed">
                Sign up with your email and complete the simple verification process. 
                Your account will be ready in minutes with full security features enabled.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg shadow-cyan-500/25">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Choose Investment Plan</h3>
              <p className="text-gray-300 leading-relaxed">
                Select from our range of investment plans - Fixed, Monthly, or Custom. 
                Each plan is designed for different risk levels and investment goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg shadow-purple-500/25">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Start Growing</h3>
              <p className="text-gray-300 leading-relaxed">
                Watch your investments grow with real-time tracking, detailed analytics, 
                and secure withdrawal options whenever you need your funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/20">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Administrator Access</h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Platform administrators can access the admin portal to manage users, 
                process withdrawals, generate PINs, and monitor system activity. 
                Admin accounts have elevated privileges and additional security measures.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 px-8 py-3"
                  onClick={() => setShowAuth(true)}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Admin Login
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Request Admin Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    InvestPro
                  </span>
                  <div className="text-xs text-gray-400">Smart Investment Platform</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Professional investment platform designed for modern investors seeking growth and security.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Investment Plans</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Portfolio Tracking</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Security Features</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Mobile App</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Investment Guide</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Risk Disclosure</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 InvestPro. All rights reserved. Licensed investment platform.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
