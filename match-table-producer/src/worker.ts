import { MatchForDb } from './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.includes('favicon')) {
      return new Response(null, { status: 404 });
    }
    const results = await env.MATCH_STATS_DB.prepare('SELECT DISTINCT * FROM matches;').all<MatchForDb>();
    console.log(results);
    if (results.results === undefined || results.results.length === 0) {
      return new Response('No results found');
    }
    return new Response(
      placeResultsTableInValidHtmlDocument(
        results.results.sort((a, b) => {
          if (a.matchTime < b.matchTime) {
            return -1;
          }
          if (a.matchTime > b.matchTime) {
            return 1;
          }
          return 0;
        })
      ),
      {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      }
    );
  },
};

function placeResultsTableInValidHtmlDocument(results: MatchForDb[]): string {
  return `<html><head><title>Match Results</title></head><body>${formatResultsInHtmlTable(results)}</body></html>`;
}

function formatResultsInHtmlTable(results: MatchForDb[]): string {
  return `<table>${formatResultsInHtmlTableRows(results)}</table>`;
}

function formatResultsInHtmlTableRows(results: MatchForDb[]): string {
  return `<tr>${formatResultsInHtmlTableHeaders(results)}</tr>${formatResultsInHtmlTableBody(results)}`;
}

function formatResultsInHtmlTableHeaders(results: MatchForDb[]): string {
  return `<th>${Object.keys(results[0]).join('</th><th>')}</th>`;
}

function formatResultsInHtmlTableBody(results: MatchForDb[]): string {
  return results.map(formatResultInHtmlTableRow).join('');
}

function formatResultInHtmlTableRow(result: MatchForDb): string {
  return `<tr>${formatResultInHtmlTableRowCells(result)}</tr>`;
}

function formatResultInHtmlTableRowCells(result: MatchForDb): string {
  return Object.values(result).map(formatResultInHtmlTableRowCell).join('');
}

function formatResultInHtmlTableRowCell(result: string | number): string {
  return `<td>${result}</td>`;
}
