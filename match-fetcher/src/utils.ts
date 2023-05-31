import { Match } from './types';

export function filterAndTransformMatches(matches: Match[]) {
  return matches
    .filter((match) => match.status.finished)
    .map((match) => ({
      id: match.id,
      home: match.home.name,
      away: match.away.name,
      matchTime: match.status.utcTime,
      score: match.status.scoreStr,
      homeScore: parseInt(match.status.scoreStr?.split('-')[0].trim() || '0'),
      awayScore: parseInt(match.status.scoreStr?.split('-')[1].trim() || '0'),
    }));
}
