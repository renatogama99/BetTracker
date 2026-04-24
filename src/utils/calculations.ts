import {
  BankrollEvolutionPoint,
  Bet,
  BetResult,
  ConfidenceLevel,
  MonthlyProfitPoint,
} from "@/types";
import { format } from "date-fns";

export function calculateProfit(
  stake: number,
  odd: number,
  result: BetResult,
): number {
  switch (result) {
    case "green":
      return parseFloat((stake * (odd - 1)).toFixed(2));
    case "red":
      return -stake;
    case "void":
      return 0;
  }
}

export function calculateROI(bets: Bet[]): number {
  const totalStaked = bets.reduce((sum, b) => sum + b.stake, 0);
  const totalProfit = bets.reduce((sum, b) => sum + b.profit, 0);
  if (totalStaked === 0) return 0;
  return parseFloat(((totalProfit / totalStaked) * 100).toFixed(2));
}

export function calculateWinrate(bets: Bet[]): number {
  const settled = bets.filter((b) => b.result !== "void");
  const wins = settled.filter((b) => b.result === "green");
  if (settled.length === 0) return 0;
  return parseFloat(((wins.length / settled.length) * 100).toFixed(1));
}

const CONFIDENCE_PERCENTAGES: Record<ConfidenceLevel, number> = {
  1: 0.03,
  2: 0.05,
  3: 0.1,
  4: 0.15,
  5: 0.2,
};

export function calculateStake(
  balance: number,
  confidence: ConfidenceLevel,
): number {
  return parseFloat((balance * CONFIDENCE_PERCENTAGES[confidence]).toFixed(2));
}

export function getBankrollEvolution(
  initialBalance: number,
  bets: Bet[],
  transactions: {
    type: "deposit" | "withdrawal";
    amount: number;
    date: string;
  }[],
): BankrollEvolutionPoint[] {
  const events: { date: string; delta: number }[] = [];

  bets.forEach((b) => events.push({ date: b.date, delta: b.profit }));
  transactions.forEach((t) =>
    events.push({
      date: t.date,
      delta: t.type === "deposit" ? t.amount : -t.amount,
    }),
  );

  events.sort((a, b) => a.date.localeCompare(b.date));

  let balance = initialBalance;
  const points: BankrollEvolutionPoint[] = [{ date: "Start", balance }];

  events.forEach((e) => {
    balance = parseFloat((balance + e.delta).toFixed(2));
    points.push({ date: e.date, balance });
  });

  return points;
}

export function getMonthlyProfits(bets: Bet[]): MonthlyProfitPoint[] {
  const map = new Map<string, number>();

  bets.forEach((b) => {
    const month = b.date.slice(0, 7); // YYYY-MM
    map.set(month, (map.get(month) ?? 0) + b.profit);
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, profit]) => ({
      month: format(new Date(month + "-01"), "MMM"),
      profit: parseFloat(profit.toFixed(2)),
    }));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function exportBetsToCSV(bets: Bet[]): void {
  const header = [
    "Date",
    "Sport",
    "Event",
    "Bookmaker",
    "Odd",
    "Stake",
    "Result",
    "Profit",
  ];
  const rows = bets.map((b) =>
    [
      b.date,
      b.sport,
      b.event,
      b.bookmaker,
      b.odd,
      b.stake,
      b.result,
      b.profit,
    ].join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bets-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
