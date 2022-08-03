const express = require('express');
const { connect } = require('http2');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get('/', async (req, res) => {
    let times = await db.selectTeams();
    res.render('index', {times});
});

app.get('/lineups/:id/:season', async (req, res) => {
    let lineUp = await db.selectPlayers(req.params.id, req.params.season);
    res.render('lineups', {lineUp});
});

app.get('/lineups/:id/@/otherinfos', async (req, res) =>{
    let otherinfos = await db.selectOtherInfos(req.params.id);
    res.render('otherinfos', {otherinfos});
})

app.get('/lineups/:id/:season/stats', async(req, res) => {
    //let mhw =  await db.selectMostHomeWins();
    let playedSeasonsByPlayer = await db.playedSeasonsByPlayer(req.params.id);
    let pt3 = await db.playerPt3(req.params.id);
    res.render('stats', {playedSeasonsByPlayer, pt3});
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);