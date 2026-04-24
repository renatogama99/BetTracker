"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { user, loading, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!loading) {
      if (user) router.push('/dashboard')
      else router.push('/auth')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700"
        >
          <TrendingUp className="h-8 w-8 text-white" />
        </motion.div>
        <p className="text-muted-foreground text-sm">Loading BankrollPro…</p>
      </motion.div>
    </div>
  )
}
