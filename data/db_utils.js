const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create the DB from SQQLITE
const db_name = path.join(__dirname,"apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connection is estabilised to 'apptest.db'");
});




// Creation of Teams Table. 

const createTeamsTable = ()=> {
const sql_create = `CREATE TABLE IF NOT EXISTS teams ( 
  "id" INTEGER PRIMARY KEY,
  "teamID" VARCHAR UNIQUE, 
  "win" REAL,
  "ccID" REAL, 
  "gender" TEXT,
  "lose" REAL, 
  "winPer" REAL as (ROUND("win"/("win"+"lose"),2)), 
  "ptsFor" REAL, 
  "ptsAgainst" REAL, 
  "netScore" REAL as (ROUND("ptsFor" - "ptsAgainst",2)), 
  "hamEff" REAL,
  "stlDef" REAL,
  "netEff" REAL as (ROUND("hamEff" - "stlDef",2)) 
);`;

db.run(sql_create, err => {
if (err) {
  return console.error(err.message);
}
console.log("Creation of Table 'teams'");

});

 // Seed Data in The Table.
 const sql_insert = `INSERT OR IGNORE INTO teams (teamID,win,lose,ptsFor,ptsAgainst,hamEff,stlDef) VALUES
 ("Edin",61,13,8.55,5.42,0.48,0.15),
 ("Gim",54,20,8.83,5.72,0.51,0.14),
 ("Constantini",34,20,8.08,5.99,0.4,0.25)
 ;`;
 db.run(sql_insert, err => {
   if (err) {
     return console.error(err.message);
   }
   console.log("Seeded Data into Teams Table");
 });

}

//Create a second table for the games.
 
const createGamesTable = ()=> {
const sql_create2 = `
CREATE TABLE IF NOT EXISTS games ( 
  "id" INTEGER PRIMARY KEY,
  "gameID" VARCHAR UNIQUE, 
  "tournament" INT,
  "draw" TEXT, 
  "date" TEXT, 
  "team1" TEXT, 
  "team2" TEXT, 
  "ovUnd" REAL, 
  "ovUndLine" REAL, 
  "undLine" REAL,
  "team1StraightOdds" REAL,
  "team2StraightOdds" REAL, 
  "team1SpreadOdds" REAL,
  "team2SpreadOdds" REAL,
  "ptsSprd" REAL,
  "ccUUID" TEXT,
  "gender" TEXT
)`;

db.run(sql_create2, err => {
if (err) {
  return console.error(err.message);
}
console.log("Creation of Table 'games'");
})



// feed the games table
const sql_insert = `INSERT OR IGNORE INTO games (gameID,tournament,date,team1,team2,ovUnd,ovUndLine,team1StraightOdds,team2StraightOdds,team1SpreadOdds,team2SpreadOdds,ptsSprd) VALUES
("game1","CADOPEN23","10/01/2023","Gim","Constantini","10.5","1.72","1.3","3.2","1.65","2.1","-1.5")
;`

db.run(sql_insert, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Seeded Data into Games Table");
});
}



module.exports = {db , ctt: createTeamsTable() , cgt: createGamesTable() }


 