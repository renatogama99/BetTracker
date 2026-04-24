"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useBankrollStore } from "@/store/useBankrollStore";
import { useBetsStore } from "@/store/useBetsStore";
import { BetResult } from "@/types";
import { calculateProfit } from "@/utils/calculations";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const SPORTS = ["Football", "Basketball", "Tennis", "Hockey", "Other"];
const BOOKMAKERS = ["1xBet", "Other"];

const schema = z.object({
  date: z.string().min(1),
  sport: z.string().min(1),
  event: z.string().min(2),
  bookmaker: z.string().min(1),
  odd: z.coerce.number().min(1.01),
  stake: z.coerce.number().min(0.01),
  result: z.enum(["green", "red", "void"]),
});

type FormData = z.infer<typeof schema>;

const RESULT_OPTIONS = [
  {
    value: "green" as BetResult,
    label: "Win",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/40",
  },
  {
    value: "red" as BetResult,
    label: "Loss",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/40",
  },
  {
    value: "void" as BetResult,
    label: "Void",
    icon: MinusCircle,
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/40",
  },
];

export default function EditBetPage() {
  const { user } = useAuthStore();
  const { bets, updateBet } = useBetsStore();
  const { bankroll, updateBalance } = useBankrollStore();
  const router = useRouter();
  const params = useParams();
  const [submitting, setSubmitting] = useState(false);

  const bet = bets.find((b) => b.id === params.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (bet) {
      reset({
        date: bet.date,
        sport: bet.sport,
        event: bet.event,
        bookmaker: bet.bookmaker,
        odd: bet.odd,
        stake: bet.stake,
        result: bet.result,
      });
    }
  }, [bet, reset]);

  if (!bet) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Bet not found.</p>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setSubmitting(true);

    const oldProfit = bet.profit;
    const newProfit = calculateProfit(data.stake, data.odd, data.result);
    const { error } = await updateBet(bet.id, data);

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (bankroll) {
      const diff = newProfit - oldProfit;
      await updateBalance(user.id, bankroll.current_balance + diff);
    }

    toast({ title: "Bet updated!", variant: "success" } as any);
    router.push("/bets");
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TopBar title="Edit Bet" subtitle="Modify your wager" />

      <div className="px-4 lg:px-6 py-5 max-w-lg mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>
            <div className="space-y-1.5">
              <Label>Sport</Label>
              <Controller
                name="sport"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Event / Market</Label>
            <Input {...register("event")} />
          </div>

          <div className="space-y-1.5">
            <Label>Bookmaker</Label>
            <Controller
              name="bookmaker"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKMAKERS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Odd</Label>
              <Input type="number" step="0.01" {...register("odd")} />
            </div>
            <div className="space-y-1.5">
              <Label>Stake</Label>
              <Input type="number" step="0.01" {...register("stake")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Result</Label>
            <Controller
              name="result"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {RESULT_OPTIONS.map(
                    ({ value, label, icon: Icon, color, bg }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                          field.value === value
                            ? bg
                            : "border-white/10 bg-white/5 hover:bg-white/10",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            field.value === value
                              ? color
                              : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            field.value === value
                              ? color
                              : "text-muted-foreground",
                          )}
                        >
                          {label}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              )}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Saving…" : "Update Bet"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
