"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Fixture {
  id: number;
  home: string;
  away: string;
  time: string;
  status: string;
  leagueName: string;
}

interface GamePickerProps {
  date: string; // YYYY-MM-DD
  onSelect: (event: string) => void;
  selectedEvent?: string;
}

// football-data.org competition codes (free tier)
const LEAGUES = [
  { id: "CL", name: "🏆 UEFA Champions League" },
  { id: "EL", name: "🥈 UEFA Europa League" },
  { id: "ECL", name: "🥉 UEFA Conference League" },
  { id: "PL", name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League" },
  { id: "PD", name: "🇪🇸 La Liga" },
  { id: "SA", name: "🇮🇹 Serie A" },
  { id: "BL1", name: "🇩🇪 Bundesliga" },
  { id: "FL1", name: "🇫🇷 Ligue 1" },
  { id: "PPL", name: "🇵🇹 Primeira Liga" },
  { id: "ELC", name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Championship" },
  { id: "DED", name: "🇳🇱 Eredivisie" },
  { id: "BSA", name: "🇧🇷 Brasileirão" },
  { id: "CLI", name: "🌎 Copa Libertadores" },
];

export function GamePicker({ date, onSelect, selectedEvent }: GamePickerProps) {
  const [leagueId, setLeagueId] = useState("");
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId || !date) return;
    setLoading(true);
    setError(null);
    setFixtures([]);

    fetch(`/api/fixtures?date=${date}&league=${leagueId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setFixtures(data.fixtures ?? []);
      })
      .catch(() => setError("Failed to load fixtures. Check your API key."))
      .finally(() => setLoading(false));
  }, [leagueId, date]);

  // Reset fixtures when date changes
  useEffect(() => {
    setFixtures([]);
    setError(null);
  }, [date]);

  return (
    <div className="space-y-3">
      {/* League selector */}
      <Select onValueChange={(v) => setLeagueId(v)} value={leagueId}>
        <SelectTrigger>
          <SelectValue placeholder="Select league..." />
        </SelectTrigger>
        <SelectContent>
          {LEAGUES.map((l) => (
            <SelectItem key={l.id} value={String(l.id)}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading fixtures…
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* No games */}
      {!loading && !error && leagueId && fixtures.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No games found for this date.
        </p>
      )}

      {/* Fixtures list */}
      {fixtures.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {fixtures.map((fixture) => {
            const label = `${fixture.home} vs ${fixture.away}`;
            const isSelected = selectedEvent === label;
            const kickoff = (() => {
              try {
                return format(new Date(fixture.time), "HH:mm");
              } catch {
                return "";
              }
            })();

            return (
              <button
                key={fixture.id}
                type="button"
                onClick={() => onSelect(label)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <p className="text-sm font-medium">
                  {fixture.home} vs {fixture.away}
                </p>
                {kickoff && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {kickoff} · {fixture.leagueName}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
