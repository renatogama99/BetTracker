"use client"

import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  count?: number
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  )
}

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-8 w-8 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-5 w-16" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-7 w-28" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
        <SkeletonBlock className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  )
}
