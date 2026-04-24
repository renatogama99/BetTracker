"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { TrendingUp, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signIn, signUp } = useAuthStore()
  const router = useRouter()

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(data.email, data.password)
      setLoading(false)
      if (error) {
        toast({ title: 'Sign up error', description: error, variant: 'destructive' })
      } else {
        // Supabase may require email confirmation — show confirmation screen
        setEmailSent(true)
      }
    } else {
      const { error } = await signIn(data.email, data.password)
      setLoading(false)
      if (error) {
        if (error.toLowerCase().includes('email not confirmed')) {
          toast({
            title: 'Email not confirmed',
            description: 'Please check your inbox and confirm your email first.',
            variant: 'destructive',
          })
        } else if (error.toLowerCase().includes('invalid login') || error.toLowerCase().includes('invalid credentials')) {
          toast({ title: 'Wrong email or password', variant: 'destructive' })
        } else {
          toast({ title: 'Sign in error', description: error, variant: 'destructive' })
        }
      } else {
        router.push('/dashboard')
      }
    }
  }

  // Email confirmation sent screen
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a14]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We sent a confirmation link to{' '}
            <span className="text-foreground font-medium">{getValues('email')}</span>.
            Click the link to activate your account.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Already confirmed?
          </p>
          <Button
            className="w-full"
            onClick={() => { setEmailSent(false); setMode('signin') }}
          >
            Sign In
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a14]">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 mb-3 shadow-lg shadow-blue-500/25">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BankrollPro</h1>
          <p className="text-muted-foreground text-sm mt-1">Sports Betting Tracker</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-card">
          {/* Toggle */}
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  className="pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Manage your bankroll. Track every bet.
        </p>
      </motion.div>
    </div>
  )
}
