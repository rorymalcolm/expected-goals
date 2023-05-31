import { fetchLeagueMatches } from './api';
import { Match, MatchNotification } from './types';
import { filterAndTransformMatches } from './utils';

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const leagueMatchesPromise = fetchLeagueMatches('67', 'GBR');
    ctx.waitUntil(leagueMatchesPromise);
    const leagueMatches = await leagueMatchesPromise;
    const matches = filterAndTransformMatches(leagueMatches);
    const processMatchesPromise = processMatches(matches, env);
    ctx.waitUntil(processMatchesPromise);
    await processMatchesPromise;
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
    const leagueMatchesPromise = fetchLeagueMatches('67', 'GBR');
    ctx.waitUntil(leagueMatchesPromise);
    console.log('Waiting for league matches...');
    const leagueMatches = await leagueMatchesPromise;
    console.log('Got league matches!');
    const matches = filterAndTransformMatches(leagueMatches);
    const processMatchesPromise = processMatches(matches, env);
    ctx.waitUntil(processMatchesPromise);
    await processMatchesPromise;
    return new Response(JSON.stringify(matches), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  },
};

async function clearKv(env: Env, ctx: ExecutionContext) {
  const kvKeysListPromise = env.MATCH_IDS.list();
  ctx.waitUntil(kvKeysListPromise);
  const kvKeys = await kvKeysListPromise;
  console.log(`Deleting ${kvKeys.keys.length} keys...`);
  for (const key of kvKeys.keys) {
    const deletePromise = env.MATCH_IDS.delete(key.name);
    ctx.waitUntil(deletePromise);
    await deletePromise;
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
