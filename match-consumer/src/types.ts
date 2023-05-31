export type NewMatchNotification = {
  id: string;
  home: string;
  away: string;
  matchTime: string;
  score: string | undefined;
  homeScore: number;
  awayScore: number;
};

export type MatchStat = {
  matchId: string;
  title: string;
  key: string;
  home: number;
  away: number;
};

export type MatchForDb = {
  id: string;
  home: string;
  away: string;
  matchTime: string;
  score: string;
  homeScore: number;
  awayScore: number;
  homeXG: number;
  awayXG: number;
};
