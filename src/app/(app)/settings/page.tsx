"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useBankrollStore } from "@/store/useBankrollStore";
import { formatCurrency } from "@/utils/calculations";
import { motion } from "framer-motion";
import {
  LogOut,
  Moon,
  Settings,
  Shield,
  Sun,
  User,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const { bankroll, fetchBankroll, setupInitialBankroll } = useBankrollStore();
  const router = useRouter();

  const [isDark, setIsDark] = useState(true);
  const [initialBalance, setInitialBalance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchBankroll(user.id);
  }, [user, fetchBankroll]);

  useEffect(() => {
    if (bankroll) {
      setInitialBalance(String(bankroll.initial_balance));
    }
  }, [bankroll]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, [isDark]);

  const handleSaveBankroll = async () => {
    if (!user || !initialBalance || Number(initialBalance) <= 0) return;
    setSaving(true);
    await setupInitialBankroll(user.id, Number(initialBalance));
    toast({ title: "Bankroll updated!", variant: "success" } as any);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TopBar title="Settings" subtitle="Account & preferences" />

      <div className="px-4 lg:px-6 py-5 max-w-lg mx-auto space-y-4">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold">Profile</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Bankroll setup */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Wallet className="h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold">Bankroll Setup</p>
          </div>

          {bankroll && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current balance</span>
              <span className="font-semibold text-blue-400">
                {formatCurrency(bankroll.current_balance)}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Initial Bankroll (€)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="1000.00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSaveBankroll}
            disabled={saving || !initialBalance || Number(initialBalance) <= 0}
          >
            {saving
              ? "Saving…"
              : bankroll
                ? "Update Bankroll"
                : "Setup Bankroll"}
          </Button>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Moon className="h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold">Appearance</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
              <span className="text-sm text-muted-foreground">
                {isDark ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <Switch checked={isDark} onCheckedChange={setIsDark} />
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold">Account</p>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center pb-4">
          BankrollPro v1.0 · Made for bettors
        </p>
      </div>
    </motion.div>
  );
}
