import { fetchLeagueMatches } from './api';
import { Match, MatchNotification } from './types';
import { filterAndTransformMatches } from './utils';

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const leagueMatches = await fetchLeagueMatches('67', 'GBR');
    const matches = filterAndTransformMatches(leagueMatches);
    await processMatches(matches, env);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname.includes('favicon')) {
      return new Response(null, { status: 404 });
    }
    const clearKvFlag = url.searchParams.get('clearKv');
    if (clearKvFlag) {
      return await clearKv(env, ctx);
    }
    const leagueMatches = await fetchLeagueMatches('67', 'GBR');
    console.log('Got league matches!');
    const matches = filterAndTransformMatches(leagueMatches);
    await processMatches(matches, env);
    return new Response(JSON.stringify(matches), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  },
};

async function clearKv(env: Env, ctx: ExecutionContext) {
  const kvKeys = await env.MATCH_IDS.list();
  console.log(`Deleting ${kvKeys.keys.length} keys...`);
  for (const key of kvKeys.keys) {
    const deletePromise = env.MATCH_IDS.delete(key.name);
    ctx.waitUntil(deletePromise);
  }
  return new Response('KV cleared');
}

async function processMatches(matches: MatchNotification[], env: Env) {
  for (const match of matches) {
    console.log('Checking match', match.id);
    console.log('env.MATCH_IDS.get(match.id)', await env.MATCH_IDS.get(match.id));
    if ((await env.MATCH_IDS.get(match.id)) === null) {
      await env.MATCH_IDS.put(match.id, match.id);
      await env.NEW_MATCHES_QUEUE.send(JSON.stringify(match));
    }
  }
}
