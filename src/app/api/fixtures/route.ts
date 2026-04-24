import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FIXTURES_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const league = searchParams.get("league"); // competition code e.g. PL, BL1, CL

  if (!date || !league) {
    return NextResponse.json(
      { error: "Missing date or league" },
      { status: 400 },
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "FIXTURES_API_KEY not configured. Add it to .env.local" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `${BASE_URL}/competitions/${league}/matches?dateFrom=${date}&dateTo=${date}`,
      {
        headers: { "X-Auth-Token": API_KEY },
        next: { revalidate: 300 }, // cache 5 min
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.message ?? `API error: ${res.status}`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixtures = (data.matches ?? []).map((item: any) => ({
      id: item.id,
      home: item.homeTeam.shortName ?? item.homeTeam.name,
      away: item.awayTeam.shortName ?? item.awayTeam.name,
      time: item.utcDate,
      status: item.status,
      leagueName: data.competition?.name ?? league,
    }));

    return NextResponse.json({ fixtures });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach fixtures API" },
      { status: 500 },
    );
  }
}
