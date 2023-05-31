const BASE_API_URL = 'https://www.fotmob.com/api';
const MATCH_DETAILS_API_URL = `${BASE_API_URL}/matchDetails`;

export async function fetchMatchDetails(matchId: string) {
  const url = new URL(MATCH_DETAILS_API_URL);
  url.searchParams.append('matchId', matchId);
  console.log(`url`, url.toString());
  const response = await fetch(url.toString());
  console.log(`response`, response.status, response.statusText);
  const data = (await response.json()) as {
    content: {
      stats: {
        stats: {
          title: string;
          key: string;
          stats: {
            title: string;
            key: string;
            stats: number[];
            type: string;
            highlighted: boolean;
          }[];
        }[];
      };
    };
  };
  const xgStats = data.content.stats.stats.filter((stat) => stat.key === 'expected_goals')[0];
  const filteredStats = xgStats.stats.filter((stat) => stat.stats[0] !== null && stat.stats[1] !== null);
  const finalStatPoint = filteredStats
    .map((stat) => ({
      matchId: matchId,
      title: stat.title,
      key: stat.key,
      home: stat.stats[0],
      away: stat.stats[1],
    }))
    .filter((stat) => stat.home !== null && stat.away !== null)
    .filter((stat) => stat.key === 'expected_goals');
  console.log(`finalStatPoint`, finalStatPoint);
  return finalStatPoint;
}
