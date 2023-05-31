import { fetchLeagueMatches } from './api';
import { filterAndTransformMatches } from './utils';

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const leagueMatches = fetchLeagueMatches('67', 'GBR');
    ctx.waitUntil(leagueMatches);
    const matches = await leagueMatches;
    filterAndTransformMatches(matches);
    for (const match of matches) {
      if (env.MATCH_IDS.get(match.id) === null) {
        env.MATCH_IDS.put(match.id, match.id);
        env.NEW_MATCHES_QUEUE.send(match.id);
      }
    }
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const leagueMatchesPromise = fetchLeagueMatches('67', 'GBR');
    ctx.waitUntil(leagueMatchesPromise);
    console.log('Waiting for league matches...');
    const leagueMatches = await leagueMatchesPromise;
    console.log('Got league matches!');
    const matches = filterAndTransformMatches(leagueMatches);
    for (const match of matches) {
      if (env.MATCH_IDS.get(match.id) === null) {
        env.MATCH_IDS.put(match.id, match.id);
        env.NEW_MATCHES_QUEUE.send(match.id);
      }
    }
    return new Response(JSON.stringify(matches), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  },
};
