const BASE_API_URL = 'https://www.fotmob.com/api';
const LEAGUE_API_URL = `${BASE_API_URL}/leagues`;

export async function fetchLeagueMatches(leagueId: string, countryCode: string) {
  const url = new URL(LEAGUE_API_URL);
  url.searchParams.append('id', leagueId);
  url.searchParams.append('ccode3', countryCode);
  const response = await fetch(url.toString());
  const data = (await response.json()) as { matches: { allMatches: Match[] } };
  return data.matches.allMatches;
}
