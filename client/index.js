

protobuf.load("schemas.proto", function (err, root) {
  if (err) throw err;

  // Obtain a message type
  Game = root.lookupType("main.Game");
  PlayerMsg = root.lookupType("main.PlayerMsg");

  var errMsg = Game.verify({
    state: 0,
    leftPlayerX: 0,
    leftPlayerY: 240,
    rightPlayerX: 490,
    rightPlayerY: 240,
    ballX: 250,
    ballY: 250,
  });
  if (errMsg) throw Error(errMsg);
  var errMsg = PlayerMsg.verify({
    side: true,
    msg: 0,
  });
  if (errMsg) throw Error(errMsg);  


  

  var playerSide;
var Game;
var started;
var PlayerMsg;
var ws;
function draw(game) {
  var canvas = document.getElementById("game");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(game.leftPlayerX, game.leftPlayerY, 10, 100);
    ctx.fillRect(game.rightPlayerX, game.rightPlayerY, 10, 100);

    var circle = new Path2D();
    // console.log("ball(x,y): " + game.ballX + " " + game.ballY);
    circle.arc(game.ballX, game.ballY, 25, 0, 2 * Math.PI);
    ctx.fill(circle);
  }
}
function clearCanvas() {
  var canvas = document.getElementById("game");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

var stored1 = localStorage["room"];
var stored2 = localStorage["playerSide"];

if(stored1){
  if(stored2){
    playerSide = stored2
    console.log("old session")
    connectOld(stored1,stored2)
  }
}
var stored = localStorage["started"];
// var stored = localStorage["gameState"];
if (stored) {
  started = stored;
  console.log('read', started)
  if(started==1){
    console.log('started')
    //connect()
    start()
  }
}
//else myVar = {a:'test', b: [1, 2, 3]};



function connect() {
  var select = document.getElementById("rooms");
  let room = select.options[select.selectedIndex].value;
  localStorage["room"] = room;
  var select = document.getElementById("sides");
  playerSide = select.options[select.selectedIndex].value;
  localStorage["playerSide"] = playerSide;
  ws = new WebSocket(" ws://localhost:8080/" + room);
  ws.binaryType = "arraybuffer";
  //logging the websocket property properties
  console.log(ws);
  //receiving the message from server
  ws.onmessage = (message) => {
    console.log("before: " + message.data);
    var gameMessage = Game.decode(new Uint8Array(message.data));
    gameState = Game.toObject(gameMessage);
    console.log(gameMessage);
    localStorage["gameState"] = JSON.stringify(gameState);
    draw(gameState);
  };
  
}

function connectOld(room, playerSide) {
  ws = new WebSocket(" ws://localhost:8080/" + room);
  ws.binaryType = "arraybuffer";
  //logging the websocket property properties
  console.log(ws);
  //receiving the message from server
  ws.onmessage = (message) => {
    //console.log("before: " + message.data);
    var gameMessage = Game.decode(new Uint8Array(message.data));
    gameState = Game.toObject(gameMessage);
    // console.log(gameMessage);
    localStorage["gameState"] = JSON.stringify(gameState);
    draw(gameState);
  };
  ws.onopen = function (event) {
    console.log("start else");
  var message =PlayerMsg.create({ side: true, msg: 2 });
  var buffer = PlayerMsg.encode(message).finish();
  ws.send(buffer);
  localStorage["started"] = 1;
  document.addEventListener("keypress", function (event) {
    if (event.key === "w") {
      moveUp(ws);
    }
    if (event.key === "s") {
      moveDown(ws);
    }
  })
  };
}


function start() {
  
  if (ws.readyState === WebSocket.OPEN) {
    console.log("start standard");
    var message =PlayerMsg.create({ side: true, msg: 2 });
    var buffer = PlayerMsg.encode(message).finish();
    ws.send(buffer);
    localStorage["started"] = 1;
    document.addEventListener("keypress", function (event) {
      if (event.key === "w") {
        moveUp(ws);
      }
      if (event.key === "s") {
        moveDown(ws);
      }
    });
  }
}



function restart() {
  if (ws.readyState === WebSocket.OPEN) {
    console.log("restart");
    var message =PlayerMsg.create({ side: true, msg: 4 });
    var buffer = PlayerMsg.encode(message).finish();
    ws.send(buffer);
    document.addEventListener("keypress", function (event) {
      if (event.key === "w") {
        moveUp(ws);
      }
      if (event.key === "s") {
        moveDown(ws);
      }
    });
  }
}

function stop() {
  if (ws.readyState === WebSocket.OPEN) {
    console.log("stop");
    localStorage["started"] = 2;
    var message =PlayerMsg.create({ side: true, msg: 3 });
    var buffer = PlayerMsg.encode(message).finish();
    ws.send(buffer);

    document.removeEventListener("keypress", function (event) {
      if (event.key === "w") {
        moveUp(ws);
      }
      if (event.key === "s") {
        moveDown(ws);
      }
    });
  }
}

function disconect(){
  if (ws.readyState === WebSocket.OPEN) {
    console.log("stop");
    localStorage.clear;
    ws.close()
    clearCanvas();
  }
}

function moveUp(ws) {
  console.log(playerSide);
  if (playerSide === "Left") {
    var message = PlayerMsg.create({ side: true, msg: 0 });
  } else {
    var message = PlayerMsg.create({ side: false, msg: 0 });
  }
  console.log("msg: " + message);
  var buffer = PlayerMsg.encode(message).finish();
  console.log("buff: " + buffer);
  ws.send(buffer);
}

function moveDown(ws) {
  if (playerSide === "Left") {
    var message = PlayerMsg.create({ side: true, msg: 1 });
  } else {
    var message = PlayerMsg.create({ side: false, msg: 1 });
  }
  var buffer = PlayerMsg.encode(message).finish();
  ws.send(buffer);
}

});


