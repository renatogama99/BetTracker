"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-[#0a0a14] flex">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
