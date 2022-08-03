async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;
 
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection("mysql://root:senhaxpto@localhost:3306/nbaapp");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

async function selectPlayers(id, season) {
    const conn = await connect();
    const [rows] = await conn.query(
        'SELECT players.PLAYER_ID, PLAYER_NAME, players.TEAM_ID, teams.LOGO FROM `players` INNER JOIN teams ON teams.TEAM_ID = players.TEAM_ID WHERE players.TEAM_ID =' + id + ' AND SEASON =' + season + ';');
    return rows;
}

async function selectTeams() {
    const conn = await connect();
    const [rows] = await conn.query('SELECT TEAM_ID, ABBREVIATION, CITY, NICKNAME, LOGO FROM `teams`;');
    return rows;
}

async function selectOtherInfos(id){
    const conn = await connect();
    const [rows] = await conn.query(
        'SELECT ABBREVIATION, CITY, NICKNAME, HEADCOACH, GENERALMANAGER, `OWNER`, g, W_PCT, HOME_RECORD, ROAD_RECORD, STANDINGSDATE FROM ranking INNER JOIN teams on ranking.TEAM_ID = teams.TEAM_ID WHERE SEASON_ID = 22019 AND ranking.TEAM_ID = ' + id +' AND ranking.STANDINGSDATE = (SELECT MAX(standingsdate) FROM ranking where SEASON_ID = 22019);');
    return rows;
}

async function playedSeasonsByPlayer(id){
    const conn = await connect();
    const[rows] = await conn.query("SELECT DISTINCT p.PLAYER_NAME AS 'nome', NICKNAME AS 'time', COUNT(DISTINCT SEASON) AS 'temporadas_jogadas' FROM players AS p INNER JOIN teams AS t ON p.team_id = t.team_id WHERE PLAYER_ID = " + id+ " GROUP BY p.player_id, p.team_id;");
    return rows;
}

async function playerPt3PerTeam(id){
    const conn = await connect();
    const[rows] = await conn.query(
        "SELECT DISTINCT PLAYER_NAME, NICKNAME, cestas FROM players AS p INNER JOIN teams AS t ON p.TEAM_ID = t.TEAM_ID INNER JOIN (select TEAM_ID, SUM(FG3M) AS cestas FROM games_details WHERE PLAYER_ID = "+id+" GROUP BY TEAM_ID) AS gt ON gt.TEAM_ID = t. TEAM_ID WHERE p.PLAYER_ID = "+id+";");
    return rows;
}


async function selectMostHomeWins(){
    const conn = await connect();
    const[rows] = await conn.query("SELECT t.city, t.nickname, SUM(home_team_wins) AS vitorias FROM teams AS t INNER JOIN games as g ON t.team_id = g.home_team_id WHERE season = 2019 GROUP BY t.team_id HAVING vitorias = (SELECT MAX(v) FROM (SELECT SUM(home_team_wins) AS v FROM games WHERE season = 2019 GROUP BY home_team_id) as gv);");
    return rows;
}

// async function playerPt3(id){
//     const conn = await connect();
//     const [rows] = await conn.query('SELECT PLAYER_ID, SUM(FG3M) AS pt3 FROM games_details WHERE PLAYER_ID =' + id +' GROUP BY PLAYER_ID;');
//     return rows;
// }

module.exports = {selectPlayers, selectTeams, selectOtherInfos, selectMostHomeWins, playedSeasonsByPlayer, playerPt3PerTeam, playerPt3}
