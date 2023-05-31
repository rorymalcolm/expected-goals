import { fetchMatchDetails } from './api';
import { MatchForDb, NewMatchNotification } from './types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const matchId = url.searchParams.get('matchId');
    if (!matchId) {
      return new Response('matchId query parameter is required', { status: 400 });
    }
    const match = await fetchMatchDetails(matchId);
    console.log(match);
    return new Response(JSON.stringify(match), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  },

  async queue(batch: MessageBatch<string>, env: Env): Promise<void> {
    console.log('Processing batch of', batch.messages.length, 'messages');
    for (const message of batch.messages) {
      const messageParsed: NewMatchNotification = JSON.parse(message.body);
      const matchDetails = await fetchMatchDetails(messageParsed.id);
      const matchForDb = {
        id: messageParsed.id,
        home: messageParsed.home,
        away: messageParsed.away,
        matchTime: messageParsed.matchTime,
        score: messageParsed.score || '',
        homeScore: messageParsed.homeScore,
        awayScore: messageParsed.awayScore,
        homeXG: matchDetails[0].home,
        awayXG: matchDetails[0].away,
      };
      console.log('Inserting match', matchForDb.id);
      await insertMatch(env.MATCH_STATS_DB, matchForDb);
    }
  },
};

async function insertMatch(db: D1Database, match: MatchForDb) {
  console.log('Inserting match', match);
  try {
    const statement = db
      .prepare(
        `INSERT INTO matches (id, home, away, matchTime, score, homeScore, awayScore, homeXG, awayXG) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(match.id, match.home, match.away, match.matchTime, match.score, match.homeScore, match.awayScore, match.homeXG, match.awayXG);
    await statement.run();
  } catch (e: any) {
    console.error('Error inserting match', match);
    console.error({
      message: e.message,
      cause: e.cause.message,
    });
    throw e;
  }
}
