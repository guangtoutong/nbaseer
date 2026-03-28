// v1.0.2 - fixed abbreviation column name
export default {
  async fetch(request, env, ctx) {
    var url = new URL(request.url);
    var headers = {"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};

    if (url.pathname === "/sync") {
      try {
        var result = await runSync(env.DB, env.ODDS_API_KEY);
        return new Response(JSON.stringify(result), {headers:headers});
      } catch(e) {
        return new Response(JSON.stringify({error: e.message, stack: e.stack}), {headers:headers});
      }
    }

    if (url.pathname === "/test") {
      var hasDB = env.DB ? "yes" : "no";
      var hasKey = env.ODDS_API_KEY ? "yes (length:" + env.ODDS_API_KEY.length + ")" : "no";
      return new Response(JSON.stringify({version: "1.0.2", db: hasDB, oddsKey: hasKey}), {headers:headers});
    }

    return new Response(JSON.stringify({endpoints:["/sync","/test"]}), {headers:headers});
  }
};

var TEAM_MAPPING = {
  ATL:1,BOS:2,BKN:3,CHA:4,CHI:5,CLE:6,DAL:7,DEN:8,DET:9,GSW:10,
  HOU:11,IND:12,LAC:13,LAL:14,MEM:15,MIA:16,MIL:17,MIN:18,NOP:19,NYK:20,
  OKC:21,ORL:22,PHI:23,PHX:24,POR:25,SAC:26,SAS:27,TOR:28,UTA:29,WAS:30
};

var TEAM_NAMES = {};
TEAM_NAMES["Atlanta Hawks"] = "ATL";
TEAM_NAMES["Boston Celtics"] = "BOS";
TEAM_NAMES["Brooklyn Nets"] = "BKN";
TEAM_NAMES["Charlotte Hornets"] = "CHA";
TEAM_NAMES["Chicago Bulls"] = "CHI";
TEAM_NAMES["Cleveland Cavaliers"] = "CLE";
TEAM_NAMES["Dallas Mavericks"] = "DAL";
TEAM_NAMES["Denver Nuggets"] = "DEN";
TEAM_NAMES["Detroit Pistons"] = "DET";
TEAM_NAMES["Golden State Warriors"] = "GSW";
TEAM_NAMES["Houston Rockets"] = "HOU";
TEAM_NAMES["Indiana Pacers"] = "IND";
TEAM_NAMES["Los Angeles Clippers"] = "LAC";
TEAM_NAMES["Los Angeles Lakers"] = "LAL";
TEAM_NAMES["LA Clippers"] = "LAC";
TEAM_NAMES["LA Lakers"] = "LAL";
TEAM_NAMES["Memphis Grizzlies"] = "MEM";
TEAM_NAMES["Miami Heat"] = "MIA";
TEAM_NAMES["Milwaukee Bucks"] = "MIL";
TEAM_NAMES["Minnesota Timberwolves"] = "MIN";
TEAM_NAMES["New Orleans Pelicans"] = "NOP";
TEAM_NAMES["New York Knicks"] = "NYK";
TEAM_NAMES["Oklahoma City Thunder"] = "OKC";
TEAM_NAMES["Orlando Magic"] = "ORL";
TEAM_NAMES["Philadelphia 76ers"] = "PHI";
TEAM_NAMES["Phoenix Suns"] = "PHX";
TEAM_NAMES["Portland Trail Blazers"] = "POR";
TEAM_NAMES["Sacramento Kings"] = "SAC";
TEAM_NAMES["San Antonio Spurs"] = "SAS";
TEAM_NAMES["Toronto Raptors"] = "TOR";
TEAM_NAMES["Utah Jazz"] = "UTA";
TEAM_NAMES["Washington Wizards"] = "WAS";

function oddsToProb(odds) {
  if (odds > 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

async function runSync(db, oddsKey) {
  var log = {gamesUpdated: 0, oddsFound: 0, predictionsUpdated: 0, errors: []};

  var today = new Date();
  var dates = [
    new Date(today.getTime() - 86400000).toISOString().split("T")[0],
    today.toISOString().split("T")[0],
    new Date(today.getTime() + 86400000).toISOString().split("T")[0]
  ];

  for (var i = 0; i < dates.length; i++) {
    try {
      var dateStr = dates[i].replace(/-/g, "");
      var espnUrl = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=" + dateStr;
      var res = await fetch(espnUrl);
      var data = await res.json();
      var events = data.events || [];

      for (var j = 0; j < events.length; j++) {
        var evt = events[j];
        var comp = evt.competitions && evt.competitions[0];
        if (!comp) continue;

        var homeTeam = null;
        var awayTeam = null;
        for (var k = 0; k < comp.competitors.length; k++) {
          if (comp.competitors[k].homeAway === "home") homeTeam = comp.competitors[k];
          if (comp.competitors[k].homeAway === "away") awayTeam = comp.competitors[k];
        }
        if (!homeTeam || !awayTeam) continue;

        var homeAbbr = homeTeam.team && homeTeam.team.abbreviation;
        var awayAbbr = awayTeam.team && awayTeam.team.abbreviation;
        var statusName = comp.status && comp.status.type && comp.status.type.name;

        var status = "scheduled";
        if (statusName === "STATUS_FINAL") status = "final";
        if (statusName === "STATUS_IN_PROGRESS") status = "live";
        if (statusName === "STATUS_HALFTIME") status = "live";

        var gameId = parseInt(evt.id);
        var gameDate = evt.date ? evt.date.split("T")[0] : null;
        var gameTime = status === "scheduled" ? evt.date : (comp.status && comp.status.displayClock);
        var period = (comp.status && comp.status.period) || 0;
        var homeScore = parseInt(homeTeam.score) || 0;
        var awayScore = parseInt(awayTeam.score) || 0;
        var season = new Date().getMonth() >= 9 ? new Date().getFullYear() + 1 : new Date().getFullYear();

        var homeId = TEAM_MAPPING[homeAbbr];
        var awayId = TEAM_MAPPING[awayAbbr];
        if (!homeId || !awayId) continue;

        try {
          var sql1 = "INSERT INTO games (id,date,time,status,period,home_team_id,away_team_id,home_score,away_score,season,postseason,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,datetime('now')) ON CONFLICT(id) DO UPDATE SET status=excluded.status,period=excluded.period,time=excluded.time,home_score=excluded.home_score,away_score=excluded.away_score,updated_at=datetime('now')";
          await db.prepare(sql1).bind(gameId, gameDate, gameTime, status, period, homeId, awayId, homeScore, awayScore, season).run();
          log.gamesUpdated++;
        } catch (err) {
          log.errors.push("game " + gameId + ": " + err.message);
        }
      }
    } catch(e) {
      log.errors.push("espn " + dates[i] + ": " + e.message);
    }
  }

  var oddsMap = {};
  if (oddsKey) {
    try {
      var oddsUrl = "https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=" + oddsKey + "&regions=us&markets=h2h,spreads,totals&oddsFormat=american";
      var oddsRes = await fetch(oddsUrl);
      var oddsData = await oddsRes.json();

      if (oddsData.error_code) {
        log.errors.push("odds api: " + oddsData.message);
      } else {
        for (var m = 0; m < oddsData.length; m++) {
          var og = oddsData[m];
          var oh = TEAM_NAMES[og.home_team];
          var oa = TEAM_NAMES[og.away_team];
          if (oh && oa) {
            oddsMap[oh + "-" + oa] = og;
            log.oddsFound++;
          }
        }
      }
    } catch (err) {
      log.errors.push("odds fetch: " + err.message);
    }
  } else {
    log.errors.push("no ODDS_API_KEY");
  }

  try {
    var sql2 = "SELECT g.id,g.home_team_id,g.away_team_id,h.abbreviation as home_abbr,a.abbreviation as away_abbr FROM games g JOIN teams h ON g.home_team_id=h.id JOIN teams a ON g.away_team_id=a.id WHERE g.status='scheduled'";
    var gamesResult = await db.prepare(sql2).all();
    var gamesList = gamesResult.results || [];
    log.scheduledGames = gamesList.length;

    for (var n = 0; n < gamesList.length; n++) {
      var game = gamesList[n];
      var oddsKey2 = game.home_abbr + "-" + game.away_abbr;
      var odds = oddsMap[oddsKey2];

      var homeWinProb = 0.5;
      var awayWinProb = 0.5;
      var spread = 0;
      var total = 220;
      var conf = 0.1;

      if (odds && odds.bookmakers && odds.bookmakers[0]) {
        var bm = odds.bookmakers[0];
        var h2hMarket = null;
        var spreadsMarket = null;
        var totalsMarket = null;

        for (var p = 0; p < bm.markets.length; p++) {
          if (bm.markets[p].key === "h2h") h2hMarket = bm.markets[p];
          if (bm.markets[p].key === "spreads") spreadsMarket = bm.markets[p];
          if (bm.markets[p].key === "totals") totalsMarket = bm.markets[p];
        }

        if (h2hMarket && h2hMarket.outcomes) {
          var homeOdds = null;
          var awayOdds = null;
          for (var q = 0; q < h2hMarket.outcomes.length; q++) {
            if (TEAM_NAMES[h2hMarket.outcomes[q].name] === game.home_abbr) homeOdds = h2hMarket.outcomes[q];
            if (TEAM_NAMES[h2hMarket.outcomes[q].name] === game.away_abbr) awayOdds = h2hMarket.outcomes[q];
          }
          if (homeOdds && awayOdds) {
            var rawHome = oddsToProb(homeOdds.price);
            var rawAway = oddsToProb(awayOdds.price);
            homeWinProb = rawHome / (rawHome + rawAway);
            awayWinProb = rawAway / (rawHome + rawAway);
          }
        }

        if (spreadsMarket && spreadsMarket.outcomes) {
          for (var r = 0; r < spreadsMarket.outcomes.length; r++) {
            if (TEAM_NAMES[spreadsMarket.outcomes[r].name] === game.home_abbr) {
              spread = spreadsMarket.outcomes[r].point;
            }
          }
        }

        if (totalsMarket && totalsMarket.outcomes) {
          for (var s = 0; s < totalsMarket.outcomes.length; s++) {
            if (totalsMarket.outcomes[s].name === "Over") {
              total = totalsMarket.outcomes[s].point;
            }
          }
        }

        conf = Math.abs(homeWinProb - 0.5) * 1.5 + 0.3;
        if (conf > 0.95) conf = 0.95;
      }

      var predHomeScore = Math.round((total - spread) / 2);
      var predAwayScore = Math.round((total + spread) / 2);

      try {
        var sql3 = "INSERT INTO predictions (game_id,home_win_prob,away_win_prob,predicted_home_score,predicted_away_score,predicted_spread,predicted_total,confidence,updated_at) VALUES (?,?,?,?,?,?,?,?,datetime('now')) ON CONFLICT(game_id) DO UPDATE SET home_win_prob=excluded.home_win_prob,away_win_prob=excluded.away_win_prob,predicted_home_score=excluded.predicted_home_score,predicted_away_score=excluded.predicted_away_score,predicted_spread=excluded.predicted_spread,predicted_total=excluded.predicted_total,confidence=excluded.confidence,updated_at=datetime('now')";
        await db.prepare(sql3).bind(game.id, homeWinProb, awayWinProb, predHomeScore, predAwayScore, spread, total, conf).run();
        log.predictionsUpdated++;
      } catch (err) {
        log.errors.push("pred " + game.id + ": " + err.message);
      }
    }
  } catch(e) {
    log.errors.push("predictions: " + e.message);
  }

  return log;
}
