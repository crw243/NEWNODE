const express = require("express");
const router = express.Router();
var db = require("../data/db_config.js");
var cors = require("cors");
bankRoll = 200;

// GET /games
router.get("/", (req, res) => {
  const sql = "SELECT * FROM games ORDER BY draw";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("games", { model: rows });
  });
});

// GET /create
router.get("/create", (req, res) => {
  res.render("creategame", { model: {} });
});

// POST /games/create
router.post("/create", (req, res) => {
  const sql =
    "INSERT OR IGNORE INTO games (gameID,tournament,date,team1,team2,ovUnd,ovUndLine,team1StraightOdds,team2StraightOdds,team1SpreadOdds,team2SpreadOdds,ptsSprd,draw,ccUUID,gender,ccIDteam1,ccIDteam2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const thing = [
    req.body.gameID,
    req.body.tournament,
    req.body.date,
    req.body.team1,
    req.body.team2,
    req.body.ovUnd,
    req.body.ovUndLine,
    req.body.team1StraightOdds,
    req.body.team2StraightOdds,
    req.body.team1SpreadOdds,
    req.body.team2SpreadOdds,
    req.body.ptsSprd,
    req.body.draw,
    req.body.ccUUID,
    req.body.gender,
    req.body.ccIDteam1,
    req.body.ccIDteam2,
  ];
  db.run(sql, thing, (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/geams");
  });
});
// GET /games/edit/5
router.get("/edit/:id", (req, res) => {
  const ident = req.params.id;
  const sql = "SELECT * FROM games WHERE id = ?";
  db.get(sql, ident, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("editgames", { model: row });
  });
});

router.post("/edit/:id", (req, res) => {
  const ident = req.params.id;
  const team = [
    req.body.gameID,
    req.body.tournament,
    req.body.date,
    req.body.team1,
    req.body.team2,
    req.body.ovUnd,
    req.body.ovUndLine,
    req.body.team1StraightOdds,
    req.body.team2StraightOdds,
    req.body.team1SpreadOdds,
    req.body.team2SpreadOdds,
    req.body.ptsSprd,
    req.params.id,
  ];
  const sql =
    "UPDATE games SET gameID = ?, tournament = ?,  date = ?, team1 = ?, team2 = ?,  ovUnd = ?, ovUndLine = ?, team1StraightOdds = ? , team2StraightOdds =?, team1SpreadOdds = ? , team2SpreadOdds =?, ptsSprd = ?  WHERE (id = ?)";
  db.run(sql, team, (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/games");
  });
});

// GET /delete/5
router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM games WHERE (id = ?)";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("deletegames", { model: row });
  });
});

// POST /delete/5
router.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM games WHERE (id = ?)";
  db.run(sql, id, (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/games");
    console.log(id);
  });
});

//test out a put

router.put("/edit/api/:ccUUID", (req, res) => {
  const ident = req.params.id;
  const team = [req.body.team1, req.body.team2, req.params.ccUUID];
  const sql = "UPDATE games SET team1 = ?, team2 = ? WHERE (ccUUID = ?) ";
  db.run(sql, team, (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/games");
  });
  // console.log(req.params.ccUUID)
  // console.log(req.body)
});

router.put("/score/:ccUUID", (req, res) => {
  const ident = req.params.id;
  const team = [
    req.body.team1score,
    req.body.team2score,
    req.body.team1result,
    req.body.team2result,
    req.params.ccUUID,
  ];
  const sql =
    "UPDATE games SET team1score = ?, team2score = ?, team1result = ?, team2result = ?  WHERE (ccUUID = ?) ";
  db.run(sql, team, (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/games");
  });
  console.log(req.params.ccUUID);
  console.log(req.body);
});

/// Get the game and both teams
function getGames(req, res, next) {
  var dbRequest = "SELECT * FROM games WHERE id = ?";
  var param = req.params.id;
  db.get(dbRequest, param, function (error, rows) {
    if (rows.length !== 0) {
      req.games = rows;
      // console.log(req.games)
      return next();
    }
  });
}

function findTeam1(req, res, next) {
  dbRequest = "SELECT * FROM teams WHERE teamID = '" + req.games.team1 + "'";
  db.get(dbRequest, function (error, rows) {
    /* Add selected data to previous saved data. */
    req.team1 = rows;
    // console.log(req.team1)
    return next();
  });
}

function findTeam2(req, res, next) {
  dbRequest = "SELECT * FROM teams WHERE teamID = '" + req.games.team2 + "'";
  db.get(dbRequest, function (error, rows) {
    /* Add selected data to previous saved data. */
    req.team2 = rows;
    // console.log(req.team2)
    return next();
  });
}

function overUnder(req, res, next) {
  const team1Avg = (req.team1.ptsFor + req.team2.ptsAgainst) / 2;
  const team2Avg = (req.team2.ptsFor + req.team1.ptsAgainst) / 2;
  const expScore = team1Avg + team2Avg;

  const scoreHedge = 0.4;
  let ouBet = "";
  let betAmt = "";
  let ouEdge =
    Math.round(
      ((expScore - req.games.ovUnd) / req.games.ovUnd +
        (1 / req.games.ovUndLine - 0.54)) *
        100
    ) / 100;

  const adjEdge = Math.round(ouEdge * scoreHedge * 100) / 100;

  if (expScore >= req.games.ovUnd) {
    ouBet = "over";
    betAmount = adjEdge * bankRoll;
    // console.log(
    //   `${req.games.gameID} ${req.team1.teamID}  vs ${req.team2.teamID} Bet the over game as ${expScore} is higher than ${req.games.ovUnd}  you should bet $ ${adjEdge * bankRoll} based on current bankroll. edge = ${adjEdge}`
    // );
  } else {
    ouBet = "under";
    betAmount = adjEdge * bankRoll;
    // console.log(
    //   `${req.games.gameID} ${req.team1.teamID} vs ${req.team2.teamID} Bet the under because ${expScore} is lower than ${req.games.ovUnd} you should bet $ ${adjEdge * bankRoll} based on current bankroll. ${adjEdge}`
    // );
  }

  req.ouResults = {
    expScore,
    ouBet,
    betAmount,
    adjEdge,
    scoreHedge,
  };
  const sql =
    "INSERT OR IGNORE INTO OuBets (gameID,team1,team2,ovUnd,ovUndLine,ccUUID,ccIDteam1,ccIDteam2,ouBet,betAmount,adjEdge,scoreHedge,expScore) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const thing = [
    req.games.gameID,
    req.games.team1,
    req.games.team2,
    req.games.ovUnd,
    req.games.ovUndLine,
    req.games.ccUUID,
    req.games.ccIDteam1,
    req.games.ccIDteam2,
    req.ouResults.ouBet,
    req.ouResults.betAmount,
    req.ouResults.adjEdge,
    req.ouResults.scoreHedge,
    req.ouResults.expScore,
  ];
  db.run(sql, thing, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  next();
}

function moneyLineEval(req, res, next) {
  const reqEdge = "";
  let mlBet = "";
  let lookAtWinPer =
    Math.round((req.team1.winPer - req.team2.winPer) * 1000) / 1000;
  let lookAtNetScore = req.team1.netScore - req.team2.netScore;
  let lookAtNetEff = req.team1.netEff - req.team2.netEff;
  let team1ImpPer =
    Math.round((1 / req.games.team1StraightOdds - 0.04) * 100) / 100;
  let favouriteFinder = (req) => {
    if (req.games.team2StraightOdds - req.games.team1StraightOdds > 0) {
      return req.team1.teamID;
    } else {
      return req.team2.teamID;
    }
  };

  function getWinProb() {
    const yInt = 0.4811;
    const cwinPer = 0.9843;
    const cnetScore = -0.0324;
    const cnetEff = 0.9823;

    return (
      Math.round(
        (yInt +
          cwinPer * lookAtWinPer +
          cnetScore * lookAtNetScore +
          cnetEff * lookAtNetEff) *
          100
      ) / 100
    );
  }

  let estWinProb = getWinProb();
  let mlEdge = (0.33 * Math.round((estWinProb - team1ImpPer) * 1000)) / 1000;

  if (mlEdge > reqEdge) {
    mlBet = "Team1";
  } else if (mlEdge < -1 * reqEdge) {
    mlBet = "Team2";
  } else {
    mlBet = "No Bet ;";
  }

  let mlBetAmt = Math.abs(Math.round(mlEdge * bankRoll * 100) / 100);

  let favourite = favouriteFinder(req);
  // console.log(`${req.games.gameID} MoneyLine ${req.team1.teamId} : is ${favourite} , with, ${team1ImpPer}% ,chance to win.,  Net Win Per, ${lookAtWinPer} , Net Score, ${lookAtNetScore}, Net Efficiency, ${lookAtNetEff}`)

  req.mlResults = {
    lookAtWinPer,
    lookAtNetScore,
    lookAtNetEff,
    team1ImpPer,
    mlBetAmt,
    estWinProb,
    mlEdge,
    mlBet,
  };
  const sql =
    "INSERT OR IGNORE INTO MLBets (gameID,team1,team2,ccUUID,ccIDteam1,ccIDteam2,lookAtWinPer, lookAtNetScore,lookAtNetEff,team1ImpPer,mlBetAmt,estWinProb,mlEdge,mlBet) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const thing = [
    req.games.gameID,
    req.games.team1,
    req.games.team2,
    req.games.ccUUID,
    req.games.ccIDteam1,
    req.games.ccIDteam2,
    req.mlResults.lookAtWinPer,
    req.mlResults.lookAtNetScore,
    req.mlResults.lookAtNetEff,
    req.mlResults.team1ImpPer,
    req.mlResults.mlBetAmt,
    req.mlResults.estWinProb,
    req.mlResults.mlEdge,
    req.mlResults.mlBet,
  ];
  db.run(sql, thing, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });
  next();
}

function spreadEval(req, res, next) {
  const spreadDescrepancy = 0.75; //This is a threshold for when to bet on moneyline mispricing 1=1point
  let t1expNetScore =
    Math.round((req.team1.netScore - req.team2.netScore) * 100) / 100;
  let t2expNetScore =
    Math.round((req.team2.netScore - req.team1.netScore) * 100) / 100;
  let team1ptsSprd = -1 * req.games.ptsSprd;
  let team2ptsSprd = req.games.ptsSprd;
  let team1sprdPer =
    Math.round(
      (req.games.team2SpreadOdds /
        (req.games.team1SpreadOdds + req.games.team2SpreadOdds)) *
        100
    ) / 100;
  let team2sprdPer =
    Math.round(
      (req.games.team1SpreadOdds /
        (req.games.team1SpreadOdds + req.games.team2SpreadOdds)) *
        100
    ) / 100;
  let sprdBet = "";
  let sprdBetAmt = "";

  //  console.log(`${req.games.gameID}: ${req.team1.teamID} expected netscore ${t1expNetScore} vs points spread of ${team1ptsSprd}`)

  if (team1ptsSprd - t1expNetScore > spreadDescrepancy) {
    sprdBet = "team2";
  } else if (team2ptsSprd - t2expNetScore > spreadDescrepancy) {
    sprdBet = "team1";
  } else {
    sprdBet = "no bet";
  }

  req.sprdResults = {
    t1expNetScore,
    t2expNetScore,
    team1ptsSprd,
    team2ptsSprd,
    team2sprdPer,
    team1sprdPer,
    sprdBet,
    sprdBetAmt,
  };

  const sql =
    "INSERT OR IGNORE INTO PSBets (gameID,team1,team2,ccUUID,ccIDteam1,ccIDteam2,t1expNetScore,t2expNetScore,team1ptsSprd,team2ptsSprd,team1sprdPer,team2sprdPer,sprdBet,sprdBetAmt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const thing = [
    req.games.gameID,
    req.games.team1,
    req.games.team2,
    req.games.ccUUID,
    req.games.ccIDteam1,
    req.games.ccIDteam2,
    req.sprdResults.t1expNetScore,
    req.sprdResults.t2expNetScore,
    req.sprdResults.team1ptsSprd,
    req.sprdResults.team2ptsSprd,
    req.sprdResults.team1sprdPer,
    req.sprdResults.team2sprdPer,
    req.sprdResults.sprdBet,
    req.sprdResults.sprdBetAmt,
  ];
  db.run(sql, thing, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });
  next();
}

function renderBetsPage(req, res) {
  res.render("bets", {
    games: req.games,
    t1: req.team1,
    t2: req.team2,
    ouResults: req.ouResults,
    mlResults: req.mlResults,
    sprdResults: req.sprdResults,
  });
}

router.get(
  "/bets/:id",
  getGames,
  findTeam1,
  findTeam2,
  overUnder,
  moneyLineEval,
  spreadEval,
  renderBetsPage
);

module.exports = router;
