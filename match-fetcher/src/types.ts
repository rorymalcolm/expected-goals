type Match = {
  round: number;
  roundName: string;
  pageUrl: string;
  id: string;
  home: {
    name: string;
    shortName: string;
    id: string;
  };
  away: {
    name: string;
    shortName: string;
    id: string;
  };
  status: {
    utcTime: string;
    finished: boolean;
    started: boolean;
    cancelled: boolean;
    scoreStr?: string;
    reason?: {
      short: string;
      shortKey: string;
      long: string;
      longKey: string;
    };
  };
};
