var express = require('express');
var app = express();
app.get('/shooter/api', function(req, res) {
  console.log(req.url);
  res.send('this page is an easter egg!');
});

var players = {};

app.get('/shooter/api/register', function(req, res) {
  console.log(req.url);
  var player = req.query.player;
  var id = player.id;
  players[id] = player;

  console.log(players);
  res.send(players);
});

app.get('/shooter/api/poll', function(req, res) {
  var player = req.query.player;
  var id = player.id;
  players[id] = player;
  console.log(players);
  res.send(players);
});
app.listen(3000);
